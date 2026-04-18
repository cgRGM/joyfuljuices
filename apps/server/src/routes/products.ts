import { createDb } from "@joyfuljuices/db";
import { demoCatalogProducts } from "@joyfuljuices/db/seed";
import { productCategories, products, productSizeLabels } from "@joyfuljuices/db/schema/commerce";
import { asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import type { AppEnv } from "../lib/auth-middleware";
import { requireAdmin } from "../lib/auth-middleware";
import { createId, slugify } from "../lib/utils";

const productInputSchema = z.object({
  bundleDetails: z.string().trim().nullable().optional(),
  category: z.enum(productCategories),
  description: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(1),
  priceCents: z.number().int().positive(),
  sizeLabel: z.enum(productSizeLabels).nullable().optional(),
  slug: z.string().min(1).optional(),
});

const productUpdateSchema = productInputSchema.partial();

export const productRoutes = new Hono<AppEnv>()
  .get("/", async (c) => {
    const user = c.get("user");
    const includeInactive = c.req.query("includeInactive") === "true";
    const shouldIncludeInactive = includeInactive && user?.role === "admin";
    const db = createDb();

    const productList = shouldIncludeInactive
      ? await db.select().from(products).orderBy(asc(products.category), asc(products.name))
      : await db
          .select()
          .from(products)
          .where(eq(products.isActive, true))
          .orderBy(asc(products.category), asc(products.name));

    return c.json({ products: productList });
  })
  .post("/", requireAdmin, async (c) => {
    const payload = productInputSchema.parse(await c.req.json());
    const db = createDb();
    const productId = createId("prod");
    const slug = payload.slug
      ? slugify(payload.slug)
      : slugify(`${payload.name}-${payload.sizeLabel ?? payload.category}`);

    await db.insert(products).values({
      bundleDetails: payload.bundleDetails ?? null,
      category: payload.category,
      description: payload.description ?? null,
      id: productId,
      isActive: payload.isActive ?? true,
      name: payload.name,
      priceCents: payload.priceCents,
      sizeLabel: payload.sizeLabel ?? null,
      slug,
    });

    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    return c.json({ product }, 201);
  })
  .post("/seed-demo-data", requireAdmin, async (c) => {
    const db = createDb();

    await db.insert(products).values(demoCatalogProducts).onConflictDoNothing({
      target: products.slug,
    });

    const seededProducts = await db
      .select()
      .from(products)
      .orderBy(asc(products.category), asc(products.name));

    return c.json({
      count: seededProducts.length,
      message: "Demo catalog seeded.",
      products: seededProducts,
    });
  })
  .put("/:productId", requireAdmin, async (c) => {
    const payload = productUpdateSchema.parse(await c.req.json());
    const productId = c.req.param("productId");
    const db = createDb();

    const updateValues: Partial<typeof products.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.bundleDetails === undefined) {
      // Leave the existing value unchanged.
    } else {
      updateValues.bundleDetails = payload.bundleDetails;
    }

    if (payload.description === undefined) {
      // Leave the existing value unchanged.
    } else {
      updateValues.description = payload.description;
    }

    if (payload.isActive === undefined) {
      // Leave the existing value unchanged.
    } else {
      updateValues.isActive = payload.isActive;
    }

    if (payload.name) {
      updateValues.name = payload.name;
    }

    if (payload.category) {
      updateValues.category = payload.category;
    }

    if (payload.priceCents === undefined) {
      // Leave the existing value unchanged.
    } else {
      updateValues.priceCents = payload.priceCents;
    }

    if (payload.sizeLabel === undefined) {
      // Leave the existing value unchanged.
    } else {
      updateValues.sizeLabel = payload.sizeLabel;
    }

    if (payload.slug) {
      updateValues.slug = slugify(payload.slug);
    }

    await db.update(products).set(updateValues).where(eq(products.id, productId));

    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ product });
  })
  .delete("/:productId", requireAdmin, async (c) => {
    const productId = c.req.param("productId");
    const db = createDb();

    const [existingProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!existingProduct) {
      return c.json({ error: "Product not found" }, 404);
    }

    await db.delete(products).where(eq(products.id, productId));
    return c.json({ deletedProductId: productId });
  });
