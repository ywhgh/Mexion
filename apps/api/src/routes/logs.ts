import { Hono } from "hono";
import type { AppBindings } from "../app.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { exportLogsCsv, getLogs } from "../services/logs.js";

export const logRoutes = new Hono<AppBindings>();

logRoutes.use("*", requireAdmin);
logRoutes.get("/", getLogs);
logRoutes.get("/export", exportLogsCsv);
logRoutes.get("/export.csv", exportLogsCsv);

