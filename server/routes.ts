import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { analyzeCode, translateCode, explainCode } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/debug", async (req, res) => {
    try {
      const { code, language } = req.body;
      const debugResult = await analyzeCode(code, language);
      res.json(debugResult);
    } catch (error: any) {
      console.error("Debug error:", error);
      res.status(500).json({ message: error.message || "Failed to debug code" });
    }
  });

  app.post("/api/translate", async (req, res) => {
    try {
      const { code, fromLanguage, toLanguage } = req.body;
      const result = await translateCode(code, fromLanguage, toLanguage);
      res.json(result);
    } catch (error: any) {
      console.error("Translation error:", error);
      res.status(500).json({ message: error.message || "Failed to translate code" });
    }
  });

  app.post("/api/explain", async (req, res) => {
    try {
      const { code, language } = req.body;
      const result = await explainCode(code, language);
      res.json(result);
    } catch (error: any) {
      console.error("Explanation error:", error);
      res.status(500).json({ message: error.message || "Failed to explain code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}