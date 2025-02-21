import app from "./app";
import {websocket} from "./server";
const host = Bun.env.HOST || "localhost";
const port = Bun.env.PORT || 3000;


console.log(`Server running at http://${host}:${port}`);
Bun.serve({
  fetch: app.fetch,
  websocket,
  hostname: host,
  port: port,
});
