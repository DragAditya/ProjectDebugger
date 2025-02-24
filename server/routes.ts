import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { analyzeCode } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/debug", async (req, res) => {
    try {
      const { code, language } = req.body;
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const debugResult = await analyzeCode(code, language);
      res.json(debugResult);
    } catch (error: any) {
      console.error("Debug error:", error);
      res.status(500).json({ message: error.message || "Failed to debug code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}