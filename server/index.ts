import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handlePaperUpload,
  handleStartGrading,
  handleGetGradingProgress,
  handleGetPaper,
} from "./routes/papers";
import { handleGetAnalytics } from "./routes/analytics";
import cookieParser from 'cookie-parser';
import passport from 'passport';
import authRouter from './auth';

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Auth routes
  app.use(passport.initialize());
  app.use('/auth', authRouter);

  // Health check and example routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Paper routes
  app.post("/api/papers/upload", handlePaperUpload);
  app.post("/api/papers/grade", handleStartGrading);
  app.get("/api/papers/grade/:gradingId", handleGetGradingProgress);
  app.get("/api/papers/:paperId", handleGetPaper);

  // Analytics routes
  app.get("/api/analytics", handleGetAnalytics);

  return app;
}
