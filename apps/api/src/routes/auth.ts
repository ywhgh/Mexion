import { Hono } from "hono";
import type { AppBindings } from "../app.js";
import { bootstrap, changePassword, me, signIn, signOut } from "../services/auth.js";
import { requireAdmin } from "../middleware/require-admin.js";

export const authRoutes = new Hono<AppBindings>();

authRoutes.post("/bootstrap", bootstrap);
authRoutes.post("/sign-in", signIn);
authRoutes.post("/sign-out", signOut);
authRoutes.get("/me", me);
authRoutes.patch("/password", requireAdmin, (c) => changePassword(c, c.get("admin").id));
