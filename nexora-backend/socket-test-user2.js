const { io } = require("socket.io-client");

const TOKEN = process.env.NEXORA_TOKEN;

if (!TOKEN) {
  console.error("❌ NEXORA_TOKEN environment variable is missing.");
  console.error("CMD:");
  console.error("set NEXORA_TOKEN=YOUR_USER_2_JWT");
  process.exit(1);
}

const socket = io("http://localhost:5000", {
  auth: {
    token: TOKEN,
  },

  transports: ["polling", "websocket"],

  reconnection: false,

  timeout: 10000,
});

socket.on("connect", () => {
  console.log("✅ USER 2 connected:", socket.id);

  console.log(
    "🚀 USER 2 transport:",
    socket.io.engine.transport.name
  );

  socket.emit(
    "conversation:join",
    {
      conversationId: 1,
    },
    (response) => {
      console.log("🏠 USER 2 join response:", response);
    }
  );

  // Send a real-time reply after joining the conversation.
  setTimeout(() => {
    socket.emit(
      "message:send",
      {
        conversationId: 1,
        type: "text",
        content:
          "Hello User 1 👋 Reply received in real-time!",
      },
      (response) => {
        console.log(
          "📤 USER 2 SEND RESPONSE:",
          response
        );
      }
    );
  }, 3000);
});

socket.on("socket:connected", (data) => {
  console.log("🔐 USER 2 authenticated:", data);
});

socket.on("conversation:joined", (data) => {
  console.log(
    "💬 USER 2 conversation joined:",
    data
  );
});

socket.on("message:new", (data) => {
  console.log(
    "📨 USER 2 NEW MESSAGE:",
    JSON.stringify(data, null, 2)
  );
});

socket.on("message:read", (data) => {
  console.log(
    "✓ USER 2 MESSAGE READ:",
    data
  );
});

socket.on("typing:start", (data) => {
  console.log(
    "✍️ USER 2 TYPING:",
    data
  );
});

socket.on("typing:stop", (data) => {
  console.log(
    "✋ USER 2 STOPPED TYPING:",
    data
  );
});

socket.on("message:error", (data) => {
  console.error(
    "❌ USER 2 MESSAGE ERROR:",
    JSON.stringify(data, null, 2)
  );
});

socket.on("connect_error", (error) => {
  console.error(
    "❌ USER 2 connection error:",
    error.message
  );

  if (error.description) {
    console.error(
      "Details:",
      error.description
    );
  }
});

socket.on("disconnect", (reason) => {
  console.log(
    "🔌 USER 2 disconnected:",
    reason
  );
});

socket.io.engine.on("upgrade", (transport) => {
  console.log(
    "⬆️ USER 2 upgraded to:",
    transport.name
  );
});