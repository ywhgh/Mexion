import { Hono } from "hono";
import type { AppBindings } from "../app.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { requireUser } from "../middleware/require-user.js";
import { registerLiveClient } from "../services/live-feed.js";
import { getStats } from "../services/stats.js";

export const statsRoutes = new Hono<AppBindings>();

const encoder = new TextEncoder();

statsRoutes.get("/live-stream", requireUser, (c) => {
  let unsubscribe = () => {
    // The stream may be closed before the controller is registered.
  };
  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  function cleanup(): void {
    if (closed) return;
    closed = true;
    if (heartbeat) clearInterval(heartbeat);
    heartbeat = null;
    unsubscribe();
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const user = c.get("user");
      unsubscribe = registerLiveClient(controller, { userId: user.id, role: user.role });
      controller.enqueue(encoder.encode(": connected\n\n"));
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          cleanup();
        }
      }, 15000);
      heartbeat.unref?.();
      c.req.raw.signal.addEventListener("abort", cleanup, { once: true });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
});

statsRoutes.use("*", requireAdmin);
statsRoutes.get("/", getStats);
statsRoutes.get("/overview", getStats);

