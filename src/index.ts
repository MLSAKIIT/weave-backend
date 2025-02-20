import app from "./app";
import { createWebSocketServer } from "./socket";

const host = Bun.env.HOST || "localhost";
const port = Number(Bun.env.PORT) || 3000;
const wssPort = Number(Bun.env.WEBSOCKET_PORT) || 3001;


createWebSocketServer(wssPort);

// Start Bun HTTP Server
Bun.serve({
  fetch: app.fetch,
  hostname: host,
  port: port,
});

console.log(`HTTP server running at http://${host}:${port}`);
console.log(`WebSocket signaling server running at ws://${host}:${wssPort}`);
