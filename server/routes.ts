import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/debug", async (req, res) => {
    try {
      const { code, language } = req.body;
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // TODO: Add Gemini API integration here
      // Stubbed response for now
      const debugResult = {
        issues: ["Sample error: Missing semicolon on line 5"],
        explanation: "The code has syntax errors that need to be fixed"
      };

      res.json(debugResult);
    } catch (error) {
      res.status(500).json({ message: "Failed to debug code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
