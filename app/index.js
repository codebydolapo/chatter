const socket = new WebSocket('ws://localhost:3000');

function sendMessage(e) {
  e.preventDefault();
  const input = document.querySelector("input");
  
  // Ensure socket is open before sending
  if (input.value && socket.readyState === WebSocket.OPEN) {
    socket.send(input.value);
    input.value = ""; 
  }
  input.focus();
}

document.querySelector("form").addEventListener("submit", sendMessage);

socket.addEventListener("message", ({ data }) => {
  // If data is a Blob (binary), read it as text
  if (data instanceof Blob) {
    data.text().then(text => appendMessage(text));
  } else {
    appendMessage(data);
  }
});

function appendMessage(text) {
  const li = document.createElement("li");
  li.textContent = text;
  document.querySelector("ul").appendChild(li);
}

// Optional: Add auto-reconnect logic if connection drops
socket.addEventListener("close", () => {
  console.log("Connection closed. Attempting to reconnect...");
  // Reconnection logic would go here in a production app
});