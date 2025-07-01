import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeCode, translateCode, explainCode, chatWithGemini, ChatMessage } from "./services/gemini";

export async function registerRoutes(app: Express): Promise<Server> {

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    // Log request details
    const requestLog = {
      timestamp: new Date().toISOString(),
      type: 'request',
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: req.headers,
      ip: req.ip
    };
    console.log(JSON.stringify(requestLog));

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      const responseLog = {
        timestamp: new Date().toISOString(),
        type: 'response',
        path: path,
        status: res.statusCode,
        body: capturedJsonResponse
      };
      console.log(JSON.stringify(responseLog));
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    next();
  });


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
      const result = await explainCode(code, language);
      res.json(result);
    } catch (error: any) {
      console.error("Explanation error:", error);
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
      console.error("Chat error:", error);
      res.status(500).json({ message: error.message || "Failed to process chat" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}