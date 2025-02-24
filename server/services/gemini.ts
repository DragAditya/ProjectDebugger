import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeCode(code: string, language: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are a code debugging assistant. Please analyze the following ${language} code and provide:
1. A list of potential issues or bugs
2. A clear explanation of what needs to be fixed

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Format your response as a JSON object with two fields:
- issues: array of strings, each describing a specific issue
- explanation: string with a comprehensive explanation`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      return JSON.parse(text);
    } catch (e) {
      // If JSON parsing fails, create a structured response from the text
      return {
        issues: ["Could not parse response"],
        explanation: text
      };
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to analyze code");
  }
}
