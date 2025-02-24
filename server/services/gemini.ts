import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeCode(code: string, language: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
5. Don't escape quotes in the correctedCode unless necessary
6. Keep the same language as the input code`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      // Try to parse the response as JSON
      const parsedResponse = JSON.parse(text.replace(/^```json\n|\n```$/g, ''));

      // Validate the response structure
      return {
        issues: Array.isArray(parsedResponse.issues) ? parsedResponse.issues : [],
        explanation: parsedResponse.explanation || "No explanation provided",
        correctedCode: parsedResponse.correctedCode || code,
      };
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);

      // Attempt to extract code blocks if JSON parsing fails
      const codeMatch = text.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
      const extractedCode = codeMatch ? codeMatch[1].trim() : code;

      return {
        issues: ["Failed to analyze code properly"],
        explanation: "The analysis encountered an error. Please try again with a simpler code snippet.",
        correctedCode: extractedCode
      };
    }
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(error.message || "Failed to analyze code");
  }
}