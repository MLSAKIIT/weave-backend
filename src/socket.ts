import { WebSocketServer, WebSocket } from "ws";

const createWebSocketServer = (port: number) => {
  const wss = new WebSocketServer({ port });


  wss.on("connection", (ws: WebSocket) => {
    console.log("WebSocket client connected");

    ws.on("message", (message) => {
      const data = JSON.parse(message.toString());
      console.log("Received signaling message:", data);

      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  return wss;
};

export { createWebSocketServer };
