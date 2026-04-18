import { createDb } from "@joyfuljuices/db";
import { checkoutSessions, fulfillmentTypes, products } from "@joyfuljuices/db/schema/commerce";
import { inArray } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import type { AppEnv } from "../lib/auth-middleware";
import { requireAuth } from "../lib/auth-middleware";
import { env } from "@joyfuljuices/env/server";
import { createId, formatCurrency, parseOptionalDate } from "../lib/utils";
import { getStripe } from "../lib/stripe";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

const checkoutSchema = z
  .object({
    customerName: z.string().min(1),
    customerPhone: z.string().trim().nullable().optional(),
    deliveryAddress: z.string().trim().nullable().optional(),
    fulfillmentType: z.enum(fulfillmentTypes),
    items: z.array(cartItemSchema).min(1),
    notes: z.string().trim().nullable().optional(),
    scheduledFor: z.string().trim().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.fulfillmentType === "delivery" && !value.deliveryAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Delivery address is required for delivery orders.",
        path: ["deliveryAddress"],
      });
    }
  });

export const checkoutRoutes = new Hono<AppEnv>().post("/", requireAuth, async (c) => {
  const payload = checkoutSchema.parse(await c.req.json());
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = createDb();
  const stripe = getStripe();
  const itemQuantities = new Map<string, number>();

  for (const item of payload.items) {
    const currentQuantity = itemQuantities.get(item.productId) ?? 0;
    itemQuantities.set(item.productId, currentQuantity + item.quantity);
  }

  const normalizedItems = Array.from(itemQuantities, ([productId, quantity]) => ({
    productId,
    quantity,
  }));
  const requestedProductIds = normalizedItems.map((item) => item.productId);
  const productRows = await db
    .select()
    .from(products)
    .where(inArray(products.id, requestedProductIds));

  if (productRows.length !== requestedProductIds.length) {
    return c.json({ error: "One or more products could not be found." }, 400);
  }

  const productMap = new Map(productRows.map((product) => [product.id, product]));
  const checkoutItems = normalizedItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product || !product.isActive) {
      throw new Error(`Inactive or missing product: ${item.productId}`);
    }

    return {
      lineTotalCents: product.priceCents * item.quantity,
      product,
      quantity: item.quantity,
    };
  });

  const subtotalCents = checkoutItems.reduce((total, item) => total + item.lineTotalCents, 0);
  const scheduledFor = parseOptionalDate(payload.scheduledFor);
  if (payload.scheduledFor && !scheduledFor) {
    return c.json({ error: "Scheduled time must be a valid date or datetime string." }, 400);
  }

  const cartSnapshot = checkoutItems.map((item) => ({
    lineTotalCents: item.lineTotalCents,
    productId: item.product.id,
    productName: item.product.sizeLabel
      ? `${item.product.name} (${item.product.sizeLabel})`
      : item.product.name,
    quantity: item.quantity,
    unitPriceCents: item.product.priceCents,
  }));
  const metadata = {
    customerName: payload.customerName,
    fulfillmentType: payload.fulfillmentType,
    scheduledFor: scheduledFor?.toISOString() ?? "",
    userId: user.id,
  };

  const session = await stripe.checkout.sessions.create({
    cancel_url: env.STRIPE_CANCEL_URL,
    client_reference_id: user.id,
    customer_email: user.email,
    line_items: checkoutItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          description: item.product.description ?? undefined,
          name: item.product.sizeLabel
            ? `${item.product.name} (${item.product.sizeLabel})`
            : item.product.name,
        },
        unit_amount: item.product.priceCents,
      },
      quantity: item.quantity,
    })),
    metadata,
    mode: "payment",
    success_url: `${env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
  });

  await db.insert(checkoutSessions).values({
    cartSnapshot: JSON.stringify(cartSnapshot),
    currency: "usd",
    customerEmail: user.email,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone ?? null,
    deliveryAddress: payload.deliveryAddress ?? null,
    fulfillmentType: payload.fulfillmentType,
    id: createId("checkout"),
    notes: payload.notes ?? null,
    scheduledFor,
    status: "open",
    stripeCheckoutSessionId: session.id,
    subtotalCents,
    userId: user.id,
  });

  return c.json({
    checkoutSessionId: session.id,
    checkoutUrl: session.url,
    currency: "usd",
    subtotal: formatCurrency(subtotalCents),
  });
});
