import { serve } from "@hono/node-server";
import { createApp } from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "8787", 10);
const hostname = process.env.HOST ?? "127.0.0.1";

serve(
  {
    fetch: createApp().fetch,
    port,
    hostname,
  },
  (info) => {
    console.info(`AXION listening at http://${info.address}:${info.port}`);
  },
);
