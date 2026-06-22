const ws = require("ws");
const server = new ws.Server({ port: 3000 });

// Helper to keep track of alive connections
function heartbeat() {
  this.isAlive = true;
}

server.on("connection", (socket) => {
  socket.isAlive = true;
  // Respond to pongs from the client
  socket.on("pong", heartbeat);

  socket.on("message", (message, isBinary) => {
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
  server.clients.forEach((socket) => {
    if (socket.isAlive === false) return socket.terminate();
    
    socket.isAlive = false;
    socket.ping(); // Send a ping to the client
  });
}, 30000);

server.on("close", () => {
  clearInterval(interval);
});

console.log("WebSocket server running on port 3000");