import type { Express } from "express";
import { createServer, type Server } from "http";
import triageRouter from "./routes/triage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Triage API routes
  app.use("/api/triage", triageRouter);

  return httpServer;
}
