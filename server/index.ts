import ws, { WebSocket, WebSocketServer } from "ws";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const port = process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT, 10) : 8080;

const server = new WebSocketServer({ port });

// Extend the native WebSocket type to include our custom tracking property
interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

// Helper to keep track of alive connections
function heartbeat(this: ExtWebSocket) {
  this.isAlive = true;
}

server.on("connection", (socket: ExtWebSocket) => {
  socket.isAlive = true;
  
  // Respond to pongs from the client
  socket.on("pong", heartbeat);

  socket.on("message", (message: ws.RawData, isBinary: boolean) => {
    try {
      // Handle data safely depending on whether it's binary or text
      const messageString = isBinary ? message : message.toString();
      console.log("Received:", messageString);

      // Broadcast to EVERYONE connected to the server:
      server.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send(message, { binary: isBinary });
        }
      });
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

// Terminate dead sockets every 30 seconds
const interval = setInterval(() => {
  server.clients.forEach((client) => {
    const socket = client as ExtWebSocket;
    if (socket.isAlive === false) return socket.terminate();

    socket.isAlive = false;
    socket.ping();
  });
}, 30000);

server.on("close", () => {
  clearInterval(interval);
});

console.log(`WebSocket server running on port ${port}`);