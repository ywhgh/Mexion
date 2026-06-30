import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { PublicAdmin } from "../services/auth.js";
import { adminFromCookie } from "../services/auth.js";
import type { AppBindings } from "../app.js";

export type AuthVariables = {
  admin: PublicAdmin;
};

export const requireAdmin = createMiddleware<AppBindings>(async (c, next) => {
  const admin = await adminFromCookie(c);
  if (!admin) {
    throw new HTTPException(401, { message: "Administrator session required" });
  }
  c.set("admin", admin);
  await next();
});
