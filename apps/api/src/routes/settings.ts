import { Hono } from "hono";
import type { AppBindings } from "../app.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { getSettings, patchSettings } from "../services/settings.js";

export const settingsRoutes = new Hono<AppBindings>();

settingsRoutes.use("*", requireAdmin);
settingsRoutes.get("/", getSettings);
settingsRoutes.patch("/", patchSettings);
