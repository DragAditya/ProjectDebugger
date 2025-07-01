import { GoogleGenerativeAI } from "@google/generative-ai";

// Validate API key on startup
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// A basic interface for chat messages
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      if (result) return result;
      throw new Error("Empty response");
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw lastError;
}

export async function analyzeCode(code: string, language: string) {
  return retryOperation(async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an expert code debugger. Analyze this ${language} code and provide debugging feedback.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Provide your response in this exact JSON format, with no additional text or markdown:
{
  "issues": ["List each specific issue found"],
  "explanation": "A detailed technical explanation of all issues and how to fix them",
  "correctedCode": "The complete fixed code that resolves all issues"
}

Requirements:
1. Return valid JSON only, no markdown
2. List all syntax errors, logical errors, and best practice violations
3. Provide complete corrected code that fixes all issues
4. Use proper code formatting in the correctedCode field
5. Keep the same language as the input code`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      try {
        const parsedResponse = JSON.parse(text.replace(/^```json\n|\n```$/g, ''));
        const debugResult = {
          issues: Array.isArray(parsedResponse.issues) ? parsedResponse.issues : [],
          explanation: parsedResponse.explanation || "No explanation provided",
          correctedCode: parsedResponse.correctedCode || code,
        };

        if (!debugResult.explanation || debugResult.explanation === "No explanation provided") {
          throw new Error("Invalid explanation");
        }

        return debugResult;
      } catch (e) {
        console.error("Failed to parse Gemini response:", text, e);
        throw e;
      }
    } catch (error: any) {
      console.error("Gemini API error:", error);
      throw error;
    }
  });
}

export async function translateCode(code: string, fromLanguage: string, toLanguage: string) {
  return retryOperation(async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `As an expert programmer, translate this code from ${fromLanguage} to ${toLanguage}.

Original code (${fromLanguage}):
\`\`\`${fromLanguage}
${code}
\`\`\`

Provide your response in this exact JSON format only, with no additional text or code blocks:
{
  "translatedCode": "The translated code here",
  "explanation": "Your detailed explanation here"
}

Requirements:
1. Return valid JSON only
2. Maintain the same functionality and logic
3. Use idiomatic patterns for the target language
4. Include any necessary imports or setup code
5. Explain any significant changes or language-specific adaptations`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text();

      try {
        // Clean up the response text
        text = text.replace(/^```json\n|\n```$/g, ''); // Remove code block markers
        text = text.replace(/\\n/g, '\n'); // Handle escaped newlines
        
        // Safety check for same language translation
        if (fromLanguage === toLanguage) {
          return {
            translatedCode: code,
            explanation: "No translation needed as source and target languages are the same."
          };
        }
        
        const parsedResponse = JSON.parse(text);
        const translationResult = {
          translatedCode: parsedResponse.translatedCode || "",
          explanation: parsedResponse.explanation || "No explanation provided"
        };

        if (!translationResult.translatedCode || !translationResult.explanation) {
          throw new Error("Invalid translation response");
        }

        return translationResult;
      } catch (e) {
        console.error("Failed to parse Gemini response:", text, e);
        throw e;
      }
    } catch (error: any) {
      console.error("Gemini API error:", error);
      throw error;
    }
  });
}

export async function explainCode(code: string, language: string) {
  return retryOperation(async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `As an expert programmer, provide a detailed explanation of this ${language} code.

Code to explain:
\`\`\`${language}
${code}
\`\`\`

Provide your response in this exact JSON format:
{
  "overview": "Brief overview of what the code does",
  "detailedExplanation": "Line-by-line or section-by-section explanation",
  "keyComponents": ["List of important functions, variables, or concepts used"]
}

Requirements:
1. Explain the purpose and functionality
2. Break down complex logic
3. Highlight important programming concepts used
4. Include best practices and potential improvements
5. Use plain text formatting`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      try {
        const parsedResponse = JSON.parse(text.replace(/^```json\n|\n```$/g, ''));
        const explanation = {
          overview: typeof parsedResponse.overview === 'string' ? parsedResponse.overview : JSON.stringify(parsedResponse.overview),
          detailedExplanation: typeof parsedResponse.detailedExplanation === 'string' ? parsedResponse.detailedExplanation : JSON.stringify(parsedResponse.detailedExplanation),
          keyComponents: Array.isArray(parsedResponse.keyComponents) ? parsedResponse.keyComponents.map((c: any) => typeof c === 'string' ? c : JSON.stringify(c)) : []
        };

        if (!explanation.overview || !explanation.detailedExplanation) {
          throw new Error("Invalid explanation response");
        }

        return explanation;
      } catch (e) {
        console.error("Failed to parse Gemini response:", text, e);
        throw e;
      }
    } catch (error: any) {
      console.error("Gemini API error:", error);
      throw error;
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

  return retryOperation(async () => {
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