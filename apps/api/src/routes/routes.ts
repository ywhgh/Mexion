import { Hono } from "hono";
import type { AppBindings } from "../app.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { createRoute, deleteRoute, listRoutes, routeLatency, updateRoute } from "../services/routes.js";

export const routeRoutes = new Hono<AppBindings>();

routeRoutes.use("*", requireAdmin);
routeRoutes.get("/", listRoutes);
routeRoutes.post("/", createRoute);
routeRoutes.patch("/:id", updateRoute);
routeRoutes.delete("/:id", deleteRoute);
routeRoutes.get("/:id/latency", routeLatency);
