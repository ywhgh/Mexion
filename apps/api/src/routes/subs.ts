import { Hono } from "hono";
import type { AppBindings } from "../app.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { createSub, deleteSub, getSub, listSubs, updateSub } from "../services/subscriptions.js";

export const subRoutes = new Hono<AppBindings>();

subRoutes.use("*", requireAdmin);
subRoutes.get("/", listSubs);
subRoutes.post("/", createSub);
subRoutes.get("/:id", getSub);
subRoutes.patch("/:id", updateSub);
subRoutes.delete("/:id", deleteSub);
