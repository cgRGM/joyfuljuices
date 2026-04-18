import { createDb } from "@joyfuljuices/db";
import { orderItems, orders, orderStatuses } from "@joyfuljuices/db/schema/commerce";
import { desc, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { requireAdmin, requireAuth } from "../lib/auth-middleware";
import type { AppEnv } from "../lib/auth-middleware";
import { notifyCustomerAboutOrder } from "../lib/notifications";

const orderStatusSchema = z.object({
  status: z.enum(orderStatuses),
});

const getAllowedNextStatuses = (
  order: typeof orders.$inferSelect,
): (typeof orderStatuses)[number][] => {
  if (order.status === "pending") {
    return ["processing", "canceled"];
  }

  if (order.status === "processing") {
    return ["ready", "canceled"];
  }

  if (order.status === "ready") {
    return order.fulfillmentType === "delivery"
      ? ["delivered", "canceled"]
      : ["fulfilled", "canceled"];
  }

  return [];
};

const attachItems = async (orderRows: (typeof orders.$inferSelect)[]) => {
  const db = createDb();

  if (orderRows.length === 0) {
    return [];
  }

  const rows = await db
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        orderRows.map((order) => order.id),
      ),
    );

  const itemsByOrderId = new Map<string, (typeof orderItems.$inferSelect)[]>();

  for (const item of rows) {
    const items = itemsByOrderId.get(item.orderId) ?? [];
    items.push(item);
    itemsByOrderId.set(item.orderId, items);
  }

  return orderRows.map((order) => ({
    ...order,
    items: itemsByOrderId.get(order.id) ?? [],
  }));
};

export const orderRoutes = new Hono<AppEnv>()
  .get("/", requireAuth, async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const db = createDb();
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt));

    return c.json({ orders: await attachItems(userOrders) });
  })
  .get("/admin", requireAdmin, async (c) => {
    const db = createDb();
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));

    return c.json({ orders: await attachItems(allOrders) });
  })
  .patch("/:orderId/status", requireAdmin, async (c) => {
    const payload = orderStatusSchema.parse(await c.req.json());
    const orderId = c.req.param("orderId");
    const db = createDb();

    const [currentOrder] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!currentOrder) {
      return c.json({ error: "Order not found" }, 404);
    }

    if (currentOrder.status === payload.status) {
      return c.json({ order: currentOrder });
    }

    const allowedNextStatuses = getAllowedNextStatuses(currentOrder);
    if (!allowedNextStatuses.includes(payload.status)) {
      return c.json(
        {
          error: `Orders in ${currentOrder.status} can only move to ${allowedNextStatuses.join(" or ") || "a final state"}.`,
        },
        400,
      );
    }

    await db
      .update(orders)
      .set({
        status: payload.status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    const [updatedOrder] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);

    await notifyCustomerAboutOrder({
      customerEmail: currentOrder.customerEmail,
      orderId,
      status: payload.status,
    });

    return c.json({ order: updatedOrder });
  });
