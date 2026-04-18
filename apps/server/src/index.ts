import { auth } from "@joyfuljuices/auth";
import { env } from "@joyfuljuices/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { sessionMiddleware, type AppEnv } from "./lib/auth-middleware";
import { checkoutRoutes } from "./routes/checkout";
import { orderRoutes } from "./routes/orders";
import { productRoutes } from "./routes/products";
import { stripeWebhookRoutes } from "./routes/webhook";

const app = new Hono<AppEnv>();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.route("/api/webhook/stripe", stripeWebhookRoutes);
app.use("/api/*", sessionMiddleware);
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.route("/api/products", productRoutes);
app.route("/api/checkout", checkoutRoutes);
app.route("/api/orders", orderRoutes);

app.get("/", (c) => c.text("OK"));

app.notFound((c) => c.json({ error: "Not Found" }, 404));
app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "Internal Server Error" }, 500);
});

export type AppType = typeof app;

export default app;
