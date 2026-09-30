import "dotenv/config";

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import prisma from "./config/prisma";

import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import profileRoutes from "./routes/profile.routes";
import interestRoutes from "./routes/interest.routes";
import photoRoutes from "./routes/photo.routes";
import discoverRoutes from "./routes/discover.routes";
import swipeRoutes from "./routes/swipe.routes";
import matchRoutes from "./routes/match.routes";
import chatRoutes from "./routes/chat.routes";
import notificationRoutes from "./routes/notification.routes";

import { registerChatSocket } from "./sockets/chat.socket";
import dateInviteRoutes from "./routes/date-invite.routes";
import blockRoutes from "./routes/block.routes";
import reportRoutes from "./routes/report.routes";

const app = express();

const PORT = Number(
  process.env.PORT || 5000
);

const httpServer =
  http.createServer(app);

const io = new Server(
  httpServer,
  {
    cors: {
      origin: "*",
      methods: [
        "GET",
        "POST",
        "PATCH",
        "PUT",
        "DELETE",
      ],
    },

    transports: [
      "websocket",
      "polling",
    ],
  }
);

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "*",
    methods: [
      "GET",
      "POST",
      "PATCH",
      "PUT",
      "DELETE",
    ],
  })
);

app.use(express.json());

app.use(express.urlencoded({
  extended: true,
}));

/* =========================
   API ROUTES
========================= */

app.use(
  "/api/health",
  healthRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/interests",
  interestRoutes
);

app.use(
  "/api/profile/photos",
  photoRoutes
);

app.use(
  "/api/discover",
  discoverRoutes
);

app.use(
  "/api/swipes",
  swipeRoutes
);

app.use(
  "/api/matches",
  matchRoutes
);

app.use(
  "/api/conversations",
  chatRoutes
);

app.use(
  "/api/notifications", notificationRoutes
);

app.use(
  "/api/date-invites",
  dateInviteRoutes
);

app.use(
  "/api/blocks",
  blockRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);
/* =========================
   ROOT
========================= */

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Welcome to Nexora API",
    version: "1.0.0",
  });
});

/* =========================
   SOCKET.IO
========================= */

registerChatSocket(io);

/* =========================
   404
========================= */

app.use(
  (
    _req,
    res
  ) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  }
);

/* =========================
   ERROR HANDLER
========================= */

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(
      "Unhandled application error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Internal server error";

    res.status(500).json({
      success: false,
      message,
    });
  }
);

/* =========================
   DATABASE + SERVER
========================= */

const startServer = async () => {
  try {
    await prisma.$queryRaw`
      SELECT 1 AS test
    `;

    console.log(
      "✅ MySQL database connected successfully"
    );

    console.log(
      "✅ Application Prisma query successful"
    );

    httpServer.listen(
      PORT,
      () => {
        console.log(
          `🚀 Nexora API running on http://localhost:${PORT}`
        );

        console.log(
          `⚡ Socket.IO running on ws://localhost:${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "❌ Failed to start Nexora server:",
      error
    );

    process.exit(1);
  }
};

startServer();

export {
  app,
  io,
  httpServer,
};