import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeCode, translateCode, explainCode, chatWithGemini, ChatMessage } from "./services/gemini";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      log(`${req.method} ${req.path}`, 'api');
    }

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    next();
  });


  app.post("/api/debug", async (req, res) => {
    try {
      const { code, language } = req.body;
      
      // Validate input
      if (!code || !language) {
        return res.status(400).json({ 
          message: "Code and language are required" 
        });
      }
      
      log(`Debug request for ${language}`, 'info');
      const debugResult = await analyzeCode(code, language);
      res.json(debugResult);
    } catch (error: any) {
      log(`Debug error: ${error.message}`, 'error');
      res.status(500).json({ message: error.message || "Failed to debug code" });
    }
  });

  app.post("/api/translate", async (req, res) => {
    try {
      const { code, fromLanguage, toLanguage } = req.body;
      
      // Validate input
      if (!code || !fromLanguage || !toLanguage) {
        return res.status(400).json({ 
          message: "Code, fromLanguage, and toLanguage are required" 
        });
      }
      
      log(`Translation request from ${fromLanguage} to ${toLanguage}`, 'info');
      const result = await translateCode(code, fromLanguage, toLanguage);
      res.json(result);
    } catch (error: any) {
      log(`Translation error: ${error.message}`, 'error');
      res.status(500).json({ message: error.message || "Failed to translate code" });
    }
  });

  app.get("/api/logs", (req, res) => {
    // Example logs - replace with your actual logging system
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: "info",
        message: "Server started successfully",
      },
      {
        timestamp: new Date(Date.now() - 5000).toISOString(),
        level: "warn",
        message: "High memory usage detected",
        details: { usage: "85%" },
      },
      {
        timestamp: new Date(Date.now() - 10000).toISOString(),
        level: "error",
        message: "Database connection failed",
        details: { error: "Connection timeout" },
      },
    ];
    res.json(logs);
  });

  app.post("/api/explain", async (req, res) => {
    try {
      const { code, language } = req.body;
      
      // Validate input
      if (!code || !language) {
        return res.status(400).json({ 
          message: "Code and language are required" 
        });
      }
      
      log(`Explanation request for ${language}`, 'info');
      const result = await explainCode(code, language);
      res.json(result);
    } catch (error: any) {
      log(`Explanation error: ${error.message}`, 'error');
      res.status(500).json({ message: error.message || "Failed to explain code" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, systemPrompt } = req.body;
      
      // Validate input
      if (!Array.isArray(messages) || !messages.length) {
        return res.status(400).json({ message: "Messages array is required" });
      }
      
      // Make sure all messages have the expected format
      const validMessages = messages.every((msg: any) => 
        msg && (msg.role === 'user' || msg.role === 'assistant') && typeof msg.content === 'string'
      );
      
      if (!validMessages) {
        return res.status(400).json({ 
          message: "Invalid message format. Each message must have 'role' (user/assistant) and 'content' properties"
        });
      }
      
      const response = await chatWithGemini(messages as ChatMessage[], systemPrompt);
      res.json(response);
    } catch (error: any) {
      log(`Chat error: ${error.message}`, 'error');
      res.status(500).json({ message: error.message || "Failed to process chat" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}