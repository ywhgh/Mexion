import { Hono } from "hono";
import type { AppBindings } from "../app.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { createToken, listTokens, revokeToken } from "../services/tokens.js";

export const tokenRoutes = new Hono<AppBindings>();

tokenRoutes.use("*", requireAdmin);
tokenRoutes.get("/", listTokens);
tokenRoutes.post("/", createToken);
tokenRoutes.delete("/:id", revokeToken);
