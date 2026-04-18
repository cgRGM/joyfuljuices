import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth";

export const productCategories = ["juice", "hotdog", "deal"] as const;
export const productSizeLabels = ["small", "medium", "large"] as const;
export const orderStatuses = [
  "pending",
  "processing",
  "ready",
  "fulfilled",
  "delivered",
  "canceled",
] as const;
export const fulfillmentTypes = ["pickup", "delivery"] as const;
export const checkoutSessionStatuses = ["open", "completed", "expired"] as const;

export const products = sqliteTable(
  "product",
  {
    bundleDetails: text("bundle_details"),
    category: text("category", { enum: productCategories }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    description: text("description"),
    id: text("id").primaryKey(),
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
    name: text("name").notNull(),
    priceCents: integer("price_cents").notNull(),
    sizeLabel: text("size_label", { enum: productSizeLabels }),
    slug: text("slug").notNull().unique(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("product_category_idx").on(table.category)],
);

export const orders = sqliteTable(
  "order",
  {
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    currency: text("currency").default("usd").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone"),
    deliveryAddress: text("delivery_address"),
    fulfillmentType: text("fulfillment_type", { enum: fulfillmentTypes }).notNull(),
    id: text("id").primaryKey(),
    notes: text("notes"),
    scheduledFor: integer("scheduled_for", { mode: "timestamp_ms" }),
    status: text("status", { enum: orderStatuses }).default("pending").notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull().unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    subtotalCents: integer("subtotal_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
  },
  (table) => [
    index("order_user_id_idx").on(table.userId),
    index("order_status_idx").on(table.status),
    index("order_scheduled_for_idx").on(table.scheduledFor),
  ],
);

export const checkoutSessions = sqliteTable(
  "checkout_session",
  {
    cartSnapshot: text("cart_snapshot").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    currency: text("currency").default("usd").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone"),
    deliveryAddress: text("delivery_address"),
    fulfillmentType: text("fulfillment_type", { enum: fulfillmentTypes }).notNull(),
    id: text("id").primaryKey(),
    notes: text("notes"),
    scheduledFor: integer("scheduled_for", { mode: "timestamp_ms" }),
    status: text("status", { enum: checkoutSessionStatuses }).default("open").notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull().unique(),
    subtotalCents: integer("subtotal_cents").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
  },
  (table) => [
    index("checkout_session_user_id_idx").on(table.userId),
    index("checkout_session_status_idx").on(table.status),
    index("checkout_session_scheduled_for_idx").on(table.scheduledFor),
  ],
);

export const orderItems = sqliteTable(
  "order_item",
  {
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    id: text("id").primaryKey(),
    lineTotalCents: integer("line_total_cents").notNull(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    productName: text("product_name").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
  },
  (table) => [index("order_item_order_id_idx").on(table.orderId)],
);

export const productRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const orderRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
}));

export const checkoutSessionRelations = relations(checkoutSessions, ({ one }) => ({
  user: one(user, {
    fields: [checkoutSessions.userId],
    references: [user.id],
  }),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
