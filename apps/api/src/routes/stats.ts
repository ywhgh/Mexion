import { Hono } from "hono";
import type { AppBindings } from "../app.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { getStats } from "../services/stats.js";

export const statsRoutes = new Hono<AppBindings>();

statsRoutes.use("*", requireAdmin);
statsRoutes.get("/", getStats);
