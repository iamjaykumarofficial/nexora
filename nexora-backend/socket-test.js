const { io } = require("socket.io-client");

const TOKEN = process.env.NEXORA_TOKEN;

if (!TOKEN) {
  console.error("❌ NEXORA_TOKEN environment variable is missing.");
  console.error("PowerShell:");
  console.error('$env:NEXORA_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaWF0IjoxNzkwNjY1OTk2LCJleHAiOjE3OTEyNzA3OTZ9.ChjhDWGcsdapDh6dRpXVQcljrlJcnjO9vs7nO2LfTGU"');
  process.exit(1);
}

const socket = io("http://localhost:5000", {
  auth: {
    token: TOKEN,
  },

  // IMPORTANT:
  // Don't force websocket during initial testing.
  transports: ["polling", "websocket"],

  reconnection: false,

  timeout: 10000,
});

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
  console.log("🚀 Transport:", socket.io.engine.transport.name);

  socket.emit(
    "conversation:join",
    { conversationId: 1 },
    (response) => {
      console.log("🏠 Join response:", response);
    }
  );
});

socket.on("socket:connected", (data) => {
  console.log("🔐 Authenticated:", data);
});

socket.on("conversation:joined", (data) => {
  console.log("💬 Conversation joined:", data);
});

socket.on("message:new", (data) => {
  console.log(
    "📨 NEW MESSAGE:",
    JSON.stringify(data, null, 2)
  );
});

socket.on("message:read", (data) => {
  console.log("✓ MESSAGE READ:", data);
});

socket.on("typing:start", (data) => {
  console.log("✍️ TYPING START:", data);
});

socket.on("typing:stop", (data) => {
  console.log("✋ TYPING STOP:", data);
});

socket.on("message:error", (data) => {
  console.error(
    "❌ MESSAGE ERROR:",
    JSON.stringify(data, null, 2)
  );
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
  console.error("Details:", error.description || "No description");
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Disconnected:", reason);
});

socket.io.engine?.on("upgrade", (transport) => {
  console.log("⬆️ Transport upgraded to:", transport.name);
});

setTimeout(() => {
  socket.emit(
    "message:send",
    {
      conversationId: 1,
      type: "text",
      content: "Hello Priya, this is a real-time message! 🚀"
    },
    (response) => {
      console.log("📤 USER 1 SEND RESPONSE:", response);
    }
  );
}, 3000);