import { Hono } from "hono";
import type { AppBindings } from "../app.js";
import { relayRoute } from "../services/routes.js";
import { renderPublicSubscription } from "../services/subscriptions.js";

export const publicRoutes = new Hono<AppBindings>();

publicRoutes.get("/v1/sub", renderPublicSubscription);
publicRoutes.all("/api/r/:alias/*", relayRoute);
