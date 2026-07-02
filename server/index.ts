import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid"; 

const port = process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT) : 8080;
const server = new WebSocketServer({ port });

console.log(port)

// Custom interface to attach metadata directly to the socket instance
interface ExtWebSocket extends WebSocket {
  id: string;
  isAlive: boolean;
}

// Global registry of active connections: Mapping userId -> Socket
const clients = new Map<string, ExtWebSocket>();

server.on("connection", (socket: ExtWebSocket) => {
  // 1. Assign a unique ID to this session
  socket.id = uuidv4();
  socket.isAlive = true;
  clients.set(socket.id, socket);

  // Send an initial system event telling the user what their ID is
  socket.send(JSON.stringify({
    type: "SYSTEM_WELCOME",
    payload: { userId: socket.id }
  }));

  console.log(`User connected: ${socket.id}. Total active: ${clients.size}`);

  socket.on("pong", () => { socket.isAlive = true; });

  socket.on("message", (rawMessage, isBinary) => {
    try {
      const dataString = isBinary ? rawMessage : rawMessage.toString();
      const packet = JSON.parse(dataString);

      const { type, targetId, payload } = packet;

      switch (type) {
        case "BROADCAST":
          // Global chat
          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "MESSAGE", from: socket.id, payload }));
            }
          });
          break;

        case "PRIVATE_MESSAGE":
          // One-on-one targeted routing
          const targetSocket = clients.get(targetId);
          if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
            targetSocket.send(JSON.stringify({ type: "PRIVATE_MESSAGE", from: socket.id, payload }));
            // Echo back to sender for their UI history
            socket.send(JSON.stringify({ type: "PRIVATE_MESSAGE", from: socket.id, to: targetId, payload }));
          } else {
            socket.send(JSON.stringify({ type: "SYSTEM_ERROR", payload: "User offline or not found." }));
          }
          break;

        default:
          console.warn(`Unknown packet type received: ${type}`);
      }
    } catch (err) {
      console.error("Failed to parse incoming packet", err);
    }
  });

  socket.on("close", () => {
    clients.delete(socket.id);
    console.log(`User disconnected: ${socket.id}. Remaining: ${clients.size}`);
  });
});

// Heartbeat Pruning
const interval = setInterval(() => {
  clients.forEach((socket, id) => {
    if (!socket.isAlive) {
      clients.delete(id);
      return socket.terminate();
    }
    socket.isAlive = false;
    socket.ping();
  });
}, 30000);

server.on("close", () => clearInterval(interval));
console.log(`WebSocket Server orchestrated on port ${port}`);