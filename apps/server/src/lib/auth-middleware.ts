import { auth, type AuthSession } from "@joyfuljuices/auth";
import { createMiddleware } from "hono/factory";

type AppVariables = {
  user: AuthSession["user"] | null;
  session: AuthSession["session"] | null;
};

export type AppEnv = {
  Variables: AppVariables;
};

export const sessionMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const activeSession = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!activeSession) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }

  c.set("user", activeSession.user);
  c.set("session", activeSession.session);
  await next();
});

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.get("user") || !c.get("session")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await next();
});
