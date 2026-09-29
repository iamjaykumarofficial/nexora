import "dotenv/config";

import cors from "cors";
import express from "express";

import prisma from "./config/prisma";
import errorMiddleware from "./middlewares/error.middleware";

import authRoutes from "./routes/auth.routes";
import healthRoutes from "./routes/health.routes";
import profileRoutes from "./routes/profile.routes";
import interestRoutes from "./routes/interest.routes";
import photoRoutes from "./routes/photo.routes";

import discoverRoutes from "./routes/discover.routes";
import swipeRoutes from "./routes/swipe.routes";
import matchRoutes from "./routes/match.routes";
import chatRoutes from "./routes/chat.routes";

const app = express();

const PORT = Number(
  process.env.PORT || 5000
);

const originalJson =
  app.response.json;

app.response.json = function (
  body: unknown
) {
  const jsonSafeBody =
    JSON.parse(
      JSON.stringify(
        body,
        (_key, value) => {
          if (
            typeof value === "bigint"
          ) {
            return Number(value);
          }

          return value;
        }
      )
    );

  return originalJson.call(
    this,
    jsonSafeBody
  );
};

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "Welcome to Nexora API",
    version: "1.0.0",
  });
});

app.use(
  "/api/health",
  healthRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/interests",
  interestRoutes
);

app.use(
  "/api/profile",
  profileRoutes
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
  (_req, res) => {
    return res.status(404).json({
      success: false,
      message: "Route not found",
    });
  }
);

app.use(errorMiddleware);

const startServer =
  async (): Promise<void> => {
    try {
      await prisma.$connect();

      console.log(
        "✅ MySQL database connected successfully"
      );

      const dbTest =
        await prisma.$queryRaw<
          Array<{
            test: bigint | number;
          }>
        >`SELECT 1 AS test`;

      console.log(
        "✅ Application Prisma query successful:",
        dbTest
      );

      app.listen(
        PORT,
        () => {
          console.log(
            `🚀 Nexora API running on http://localhost:${PORT}`
          );
        }
      );
    } catch (error) {
      console.error(
        "❌ Failed to connect to database:",
        error
      );

      await prisma.$disconnect();

      process.exit(1);
    }
  };

startServer();

export default app;