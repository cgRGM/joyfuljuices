import { createDb } from "@joyfuljuices/db";
import { checkoutSessions, orderItems, orders, products } from "@joyfuljuices/db/schema/commerce";
import { eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import type StripeSdk from "stripe";
import { z } from "zod";

import { getStripe } from "../lib/stripe";
import { createId } from "../lib/utils";
import { env } from "@joyfuljuices/env/server";

const checkoutCartItemSchema = z.object({
  lineTotalCents: z.number().int().nonnegative(),
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
});

const checkoutCartSchema = z.array(checkoutCartItemSchema).min(1);

const createOrderFromCheckoutSession = async (session: StripeSdk.Checkout.Session) => {
  const db = createDb();

  const [existingOrder] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeCheckoutSessionId, session.id))
    .limit(1);

  if (existingOrder) {
    return existingOrder;
  }

  const [checkoutSession] = await db
    .select()
    .from(checkoutSessions)
    .where(eq(checkoutSessions.stripeCheckoutSessionId, session.id))
    .limit(1);

  if (!checkoutSession) {
    throw new Error(`Checkout session ${session.id} is missing its D1 snapshot.`);
  }

  const cart = checkoutCartSchema.parse(JSON.parse(checkoutSession.cartSnapshot));
  const productRows = await db
    .select()
    .from(products)
    .where(
      inArray(
        products.id,
        cart.map((item) => item.productId),
      ),
    );
  const activeProductIds = new Set(productRows.map((product) => product.id));
  const orderId = createId("order");

  const itemRows = cart.map((item) => ({
    id: createId("order_item"),
    lineTotalCents: item.lineTotalCents,
    orderId,
    productId: activeProductIds.has(item.productId) ? item.productId : null,
    productName: item.productName,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
  }));

  const subtotalCents = itemRows.reduce((total, item) => total + item.lineTotalCents, 0);
  const scheduledFor = checkoutSession.scheduledFor ?? null;

  await db.insert(orders).values({
    currency: session.currency ?? "usd",
    customerEmail: checkoutSession.customerEmail,
    customerName: checkoutSession.customerName,
    customerPhone: checkoutSession.customerPhone,
    deliveryAddress: checkoutSession.deliveryAddress,
    fulfillmentType: checkoutSession.fulfillmentType,
    id: orderId,
    notes: checkoutSession.notes,
    scheduledFor,
    status: "pending",
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
    subtotalCents,
    totalCents: session.amount_total ?? subtotalCents,
    userId: checkoutSession.userId,
  });

  await db.insert(orderItems).values(itemRows);
  await db
    .update(checkoutSessions)
    .set({
      status: "completed",
      updatedAt: new Date(),
    })
    .where(eq(checkoutSessions.id, checkoutSession.id));

  console.info(`[order] created ${orderId} from Stripe checkout session ${session.id}`);

  return orderId;
};

const markCheckoutSessionExpired = async (stripeCheckoutSessionId: string) => {
  const db = createDb();

  await db
    .update(checkoutSessions)
    .set({
      status: "expired",
      updatedAt: new Date(),
    })
    .where(eq(checkoutSessions.stripeCheckoutSessionId, stripeCheckoutSessionId));
};

export const stripeWebhookRoutes = new Hono().post("/", async (c) => {
  const signature = c.req.header("stripe-signature");

  if (!signature) {
    return c.json({ error: "Missing Stripe signature" }, 400);
  }

  const stripe = getStripe();
  const rawBody = await c.req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "checkout.session.completed") {
      await createOrderFromCheckoutSession(event.data.object);
    }

    if (event.type === "checkout.session.expired") {
      await markCheckoutSessionExpired(event.data.object.id);
    }

    return c.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Stripe webhook error";
    console.error(`[stripe-webhook] ${message}`);
    return c.json({ error: message }, 400);
  }
});
