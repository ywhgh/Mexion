import { openDb } from "../apps/api/src/db/client.js";
import { migrate } from "../apps/api/src/db/migrate.js";

const db = openDb();
migrate(db);
db.sqlite.close();
console.info("Axion database initialized");
