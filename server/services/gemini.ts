import { GoogleGenerativeAI } from "@google/generative-ai";

// Validate API key on startup
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// A basic interface for chat messages
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Utility function for retry logic with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) break;
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function analyzeCode(code: string, language: string) {
  if (!code?.trim()) {
    throw new Error("Code cannot be empty");
  }

  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `You are an expert ${language} developer and code reviewer. Analyze the following code and identify all issues, bugs, and improvements.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Provide a JSON response with this exact structure (no markdown, no backticks):
{
  "issues": ["Specific issue 1", "Specific issue 2"],
  "explanation": "Detailed explanation of problems and solutions",
  "correctedCode": "Fixed version of the code"
}

Focus on:
- Syntax errors and bugs
- Logic errors and edge cases  
- Performance improvements
- Best practices and code quality
- Security vulnerabilities
- Missing error handling

Ensure the correctedCode is fully functional and follows best practices.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      // Clean up response text
      const cleanText = text
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed = JSON.parse(cleanText);
      
      return {
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        explanation: parsed.explanation || "No explanation provided",
        correctedCode: parsed.correctedCode || code
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      
      // Fallback response
      return {
        issues: ["Unable to analyze code due to service error"],
        explanation: "The code analysis service encountered an error. Please try again.",
        correctedCode: code
      };
    }
  });
}

export async function translateCode(code: string, fromLanguage: string, toLanguage: string) {
  if (!code?.trim()) {
    throw new Error("Code cannot be empty");
  }

  if (fromLanguage === toLanguage) {
    return {
      translatedCode: code,
      explanation: "Source and target languages are the same - no translation needed."
    };
  }

  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `You are an expert programmer. Translate this ${fromLanguage} code to ${toLanguage}, maintaining the same functionality.

Original ${fromLanguage} code:
\`\`\`${fromLanguage}
${code}
\`\`\`

Provide a JSON response with this exact structure (no markdown, no backticks):
{
  "translatedCode": "Complete translated code in ${toLanguage}",
  "explanation": "Explanation of translation choices and language differences"
}

Requirements:
- Maintain exact same functionality
- Use idiomatic ${toLanguage} patterns
- Include necessary imports/dependencies
- Follow ${toLanguage} best practices
- Handle language-specific differences`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const cleanText = text
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed = JSON.parse(cleanText);
      
      return {
        translatedCode: parsed.translatedCode || code,
        explanation: parsed.explanation || "Translation completed"
      };
    } catch (parseError) {
      console.error("Failed to parse translation response:", text);
      
      return {
        translatedCode: code,
        explanation: "Translation service encountered an error. Please try again."
      };
    }
  });
}

export async function explainCode(code: string, language: string) {
  if (!code?.trim()) {
    throw new Error("Code cannot be empty");
  }

  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 2048,
      }
    });

    const prompt = `You are an expert ${language} developer. Provide a comprehensive explanation of this code.

Code to explain:
\`\`\`${language}
${code}
\`\`\`

Provide a JSON response with this exact structure (no markdown, no backticks):
{
  "overview": "Brief summary of what the code does",
  "detailedExplanation": "Step-by-step explanation of the code logic",
  "keyComponents": ["Key function 1", "Important variable 2", "Core concept 3"]
}

Focus on:
- Overall purpose and functionality
- How the code works step by step
- Important functions, variables, and concepts
- Programming patterns used
- Potential improvements or alternatives`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const cleanText = text
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .trim();

      const parsed = JSON.parse(cleanText);
      
      return {
        overview: parsed.overview || "No overview available",
        detailedExplanation: parsed.detailedExplanation || "No detailed explanation available",
        keyComponents: Array.isArray(parsed.keyComponents) ? parsed.keyComponents : []
      };
    } catch (parseError) {
      console.error("Failed to parse explanation response:", text);
      
      return {
        overview: "Unable to analyze code due to service error",
        detailedExplanation: "The explanation service encountered an error. Please try again.",
        keyComponents: []
      };
    }
  });
}

/**
 * Processes a chat conversation with Gemini AI
 * @param messages Array of chat messages with roles (user/assistant) and content
 * @param systemPrompt Optional system prompt to guide the AI's behavior
 */
export async function chatWithGemini(messages: ChatMessage[], systemPrompt?: string): Promise<ChatMessage> {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages array cannot be empty");
  }

  return retryWithBackoff(async () => {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      },
      systemInstruction: systemPrompt || `You are CodeGenius, an expert AI programming assistant. You help developers with:

- Debugging and fixing code issues
- Explaining complex programming concepts
- Code optimization and best practices
- Architecture and design patterns
- Technology recommendations
- Problem-solving approaches

Be helpful, accurate, and provide practical examples. When showing code, use proper formatting and explain your reasoning.`
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history });
    
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    
    return {
      role: "assistant",
      content: result.response.text()
    };
  });
}