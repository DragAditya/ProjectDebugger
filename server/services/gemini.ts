import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!, {
  apiVersion: "v1"
});

export async function analyzeCode(code: string, language: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
      const parsedResponse = JSON.parse(text.replace(/^```json\n|\n```$/g, ''));
      return {
        issues: Array.isArray(parsedResponse.issues) ? parsedResponse.issues : [],
        explanation: parsedResponse.explanation || "No explanation provided",
        correctedCode: parsedResponse.correctedCode || code,
      };
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
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

export async function translateCode(code: string, fromLanguage: string, toLanguage: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `As an expert programmer, translate this code from ${fromLanguage} to ${toLanguage}.

Original code (${fromLanguage}):
\`\`\`${fromLanguage}
${code}
\`\`\`

Provide your response in this exact JSON format:
{
  "translatedCode": "The complete translated code",
  "explanation": "Explanation of the key differences and changes made during translation"
}

Requirements:
1. Maintain the same functionality and logic
2. Use idiomatic patterns for the target language
3. Include any necessary imports or setup code
4. Explain any significant changes or language-specific adaptations`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      const parsedResponse = JSON.parse(text.replace(/^```json\n|\n```$/g, ''));
      return {
        translatedCode: parsedResponse.translatedCode || "",
        explanation: parsedResponse.explanation || "No explanation provided"
      };
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return {
        translatedCode: "",
        explanation: "Failed to translate the code. Please try again with a simpler code snippet."
      };
    }
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(error.message || "Failed to translate code");
  }
}

export async function explainCode(code: string, language: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
4. Include best practices and potential improvements`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      const parsedResponse = JSON.parse(text.replace(/^```json\n|\n```$/g, ''));
      return {
        overview: parsedResponse.overview || "No overview provided",
        detailedExplanation: parsedResponse.detailedExplanation || "No detailed explanation provided",
        keyComponents: Array.isArray(parsedResponse.keyComponents) ? parsedResponse.keyComponents : []
      };
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      return {
        overview: "Failed to analyze the code",
        detailedExplanation: "Please try again with a simpler code snippet",
        keyComponents: []
      };
    }
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(error.message || "Failed to explain code");
  }
}