import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { openDb } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { startSubscriptionExpiryTask } from "./services/billing.js";
import { startLatencyProbe } from "./services/routes.js";

const port = Number.parseInt(process.env.PORT ?? "8787", 10);
const hostname = process.env.HOST ?? "127.0.0.1";
const db = openDb();
migrate(db);
startLatencyProbe(db);
startSubscriptionExpiryTask(db);

serve(
  {
    fetch: createApp({ db }).fetch,
    port,
    hostname,
  },
  (info) => {
    console.info(`MEXION listening at http://${info.address}:${info.port}`);
  },
);
