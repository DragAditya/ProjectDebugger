import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeCode, translateCode, explainCode, chatWithGemini, ChatMessage } from "./services/gemini";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // Note: Logging middleware is handled in server/index.ts to avoid duplication


  app.post("/api/debug", async (req, res) => {
    try {
      const { code, language } = req.body;
      
      // Enhanced input validation and sanitization
      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ 
          message: "Valid code is required" 
        });
      }
      
      if (!language || typeof language !== 'string' || !language.trim()) {
        return res.status(400).json({ 
          message: "Valid language is required" 
        });
      }
      
      // Sanitize inputs - trim and limit length
      const sanitizedCode = code.trim().slice(0, 50000); // Limit to 50k characters
      const sanitizedLanguage = language.trim().toLowerCase().slice(0, 50);
      
      // Validate language is in allowed list
      const allowedLanguages = ['javascript', 'python', 'java', 'cpp', 'typescript', 'go', 'rust', 'c', 'csharp'];
      if (!allowedLanguages.includes(sanitizedLanguage)) {
        return res.status(400).json({ 
          message: `Unsupported language. Allowed: ${allowedLanguages.join(', ')}` 
        });
      }
      
      log(`Debug request for ${sanitizedLanguage} (${sanitizedCode.length} chars)`, 'info');
      const debugResult = await analyzeCode(sanitizedCode, sanitizedLanguage);
      res.json(debugResult);
    } catch (error: any) {
      log(`Debug error: ${error.message}`, 'error');
      res.status(500).json({ message: error.message || "Failed to debug code" });
    }
  });

  app.post("/api/translate", async (req, res) => {
    try {
      const { code, fromLanguage, toLanguage } = req.body;
      
      // Enhanced input validation and sanitization
      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ 
          message: "Valid code is required" 
        });
      }
      
      if (!fromLanguage || typeof fromLanguage !== 'string' || !fromLanguage.trim()) {
        return res.status(400).json({ 
          message: "Valid fromLanguage is required" 
        });
      }
      
      if (!toLanguage || typeof toLanguage !== 'string' || !toLanguage.trim()) {
        return res.status(400).json({ 
          message: "Valid toLanguage is required" 
        });
      }
      
      // Sanitize inputs
      const sanitizedCode = code.trim().slice(0, 50000);
      const sanitizedFromLanguage = fromLanguage.trim().toLowerCase().slice(0, 50);
      const sanitizedToLanguage = toLanguage.trim().toLowerCase().slice(0, 50);
      
      // Validate languages
      const allowedLanguages = ['javascript', 'python', 'java', 'cpp', 'typescript', 'go', 'rust', 'c', 'csharp'];
      if (!allowedLanguages.includes(sanitizedFromLanguage) || !allowedLanguages.includes(sanitizedToLanguage)) {
        return res.status(400).json({ 
          message: `Unsupported language. Allowed: ${allowedLanguages.join(', ')}` 
        });
      }
      
      log(`Translation request from ${sanitizedFromLanguage} to ${sanitizedToLanguage} (${sanitizedCode.length} chars)`, 'info');
      const result = await translateCode(sanitizedCode, sanitizedFromLanguage, sanitizedToLanguage);
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
      
      // Enhanced input validation and sanitization
      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ 
          message: "Valid code is required" 
        });
      }
      
      if (!language || typeof language !== 'string' || !language.trim()) {
        return res.status(400).json({ 
          message: "Valid language is required" 
        });
      }
      
      // Sanitize inputs
      const sanitizedCode = code.trim().slice(0, 50000);
      const sanitizedLanguage = language.trim().toLowerCase().slice(0, 50);
      
      // Validate language
      const allowedLanguages = ['javascript', 'python', 'java', 'cpp', 'typescript', 'go', 'rust', 'c', 'csharp'];
      if (!allowedLanguages.includes(sanitizedLanguage)) {
        return res.status(400).json({ 
          message: `Unsupported language. Allowed: ${allowedLanguages.join(', ')}` 
        });
      }
      
      log(`Explanation request for ${sanitizedLanguage} (${sanitizedCode.length} chars)`, 'info');
      const result = await explainCode(sanitizedCode, sanitizedLanguage);
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