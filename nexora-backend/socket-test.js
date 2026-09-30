const { io } = require("socket.io-client");
const readline = require("readline");

const TOKEN = process.env.NEXORA_TOKEN;

if (!TOKEN) {
  console.error("❌ NEXORA_TOKEN environment variable is missing.");
  console.error("CMD:");
  console.error("set NEXORA_TOKEN=YOUR_USER_1_JWT");
  process.exit(1);
}

const CONVERSATION_ID = 2;

const socket = io("http://localhost:5000", {
  auth: {
    token: TOKEN,
  },
  transports: ["polling", "websocket"],
  reconnection: false,
  timeout: 10000,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

socket.on("connect", () => {
  console.log("\n✅ USER 1 connected:", socket.id);
  console.log("🚀 Transport:", socket.io.engine.transport.name);

  socket.emit(
    "conversation:join",
    {
      conversationId: CONVERSATION_ID,
    },
    (response) => {
      console.log("🏠 USER 1 join response:", response);

      console.log("\n==============================");
      console.log("USER 1 CONTROLS");
      console.log("==============================");
      console.log("t  = typing start");
      console.log("s  = typing stop");
      console.log("m  = send message");
      console.log("r  = mark conversation as read");
      console.log("q  = quit");
      console.log("==============================\n");

      rl.prompt();
    }
  );
});

socket.on("socket:connected", (data) => {
  console.log("🔐 USER 1 authenticated:", data);
});

socket.on("conversation:joined", (data) => {
  console.log(
    "💬 USER 1 conversation joined:",
    JSON.stringify(data, null, 2)
  );
});

socket.on("notification:new", (notification) => {
  console.log(
    "\n🔔 USER 1 NEW NOTIFICATION:",
    JSON.stringify(notification, null, 2)
  );

  rl.prompt();
});

socket.on("message:new", (data) => {
  console.log(
    "\n📨 USER 1 NEW MESSAGE:",
    JSON.stringify(data, null, 2)
  );

  rl.prompt();
});

socket.on("message:read", (data) => {
  console.log(
    "\n✓ USER 1 MESSAGE READ:",
    JSON.stringify(data, null, 2)
  );

  rl.prompt();
});

socket.on("message:read:success", (data) => {
  console.log(
    "\n✓ USER 1 READ SUCCESS:",
    JSON.stringify(data, null, 2)
  );

  rl.prompt();
});

socket.on("typing:start", (data) => {
  console.log(
    "\n✍️ USER 1 TYPING:",
    JSON.stringify(data, null, 2)
  );

  rl.prompt();
});

socket.on("typing:stop", (data) => {
  console.log(
    "\n✋ USER 1 STOPPED TYPING:",
    JSON.stringify(data, null, 2)
  );

  rl.prompt();
});

socket.on("presence:update", (data) => {
  console.log(
    "\n🟢 USER 1 PRESENCE UPDATE:",
    JSON.stringify(data, null, 2)
  );

  rl.prompt();
});

socket.on("presence:self", (data) => {
  console.log(
    "\n👤 USER 1 OWN PRESENCE:",
    JSON.stringify(data, null, 2)
  );

  rl.prompt();
});

socket.on("message:error", (data) => {
  console.error(
    "\n❌ USER 1 MESSAGE ERROR:",
    JSON.stringify(data, null, 2)
  );

  rl.prompt();
});

socket.on("connect_error", (error) => {
  console.error("\n❌ USER 1 connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("\n🔌 USER 1 disconnected:", reason);
});

socket.io.engine.on("upgrade", (transport) => {
  console.log("⬆️ Transport upgraded to:", transport.name);
});

rl.on("line", (input) => {
  const command = input.trim().toLowerCase();

  switch (command) {
    case "t":
      socket.emit("typing:start", {
        conversationId: CONVERSATION_ID,
      });

      console.log("✍️ USER 1 → typing:start sent");
      break;

    case "s":
      socket.emit("typing:stop", {
        conversationId: CONVERSATION_ID,
      });

      console.log("✋ USER 1 → typing:stop sent");
      break;

    case "m":
      socket.emit(
        "message:send",
        {
          conversationId: CONVERSATION_ID,
          type: "text",
          content: "Hello Priya 👋 This is User 1 realtime test!",
        },
        (response) => {
          console.log(
            "📤 USER 1 SEND RESPONSE:",
            JSON.stringify(response, null, 2)
          );
        }
      );
      break;

    case "r":
      socket.emit(
        "message:read",
        {
          conversationId: CONVERSATION_ID,
        },
        (response) => {
          console.log(
            "📖 USER 1 READ RESPONSE:",
            JSON.stringify(response, null, 2)
          );
        }
      );
      break;

    case "q":
      console.log("👋 Closing USER 1...");
      rl.close();
      socket.disconnect();
      process.exit(0);

    default:
      console.log("❓ Use: t / s / m / r / q");
  }

  rl.prompt();
});

rl.on("close", () => {
  socket.disconnect();
});