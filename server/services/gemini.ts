import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeCode(code: string, language: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As an expert code debugging assistant, analyze this ${language} code and provide:

1. List of issues found
2. Detailed explanation of each issue
3. The corrected code

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Format your response exactly like this JSON:
{
  "issues": [
    "Clear description of each issue found"
  ],
  "explanation": "Detailed explanation of what's wrong and how to fix it",
  "correctedCode": "The complete corrected version of the code"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      const parsedResponse = JSON.parse(text);
      return {
        issues: parsedResponse.issues || [],
        explanation: parsedResponse.explanation || "No explanation provided",
        correctedCode: parsedResponse.correctedCode || code
      };
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return {
        issues: ["Error analyzing code"],
        explanation: "The AI model provided an invalid response format. Please try again.",
        correctedCode: code
      };
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to analyze code");
  }
}