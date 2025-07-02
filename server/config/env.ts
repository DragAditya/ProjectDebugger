import { z } from "zod";

// Define the schema for environment variables
const envSchema = z.object({
  // Required variables
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters for security"),
  
  // Optional variables with defaults
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().regex(/^\d+$/, "PORT must be a number").transform(Number).default("5000"),
  
  // Database (optional)
  DATABASE_URL: z.string().optional(),
  
  // Supabase (optional but recommended)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),
  
  // OAuth (optional)
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

// Validate and export configuration
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    
    // Additional validation
    if (env.NODE_ENV === "production") {
      if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
        console.warn("⚠️ Warning: Supabase configuration missing in production");
      }
      
      if (env.SESSION_SECRET.length < 64) {
        console.warn("⚠️ Warning: SESSION_SECRET should be longer in production (64+ characters)");
      }
    }
    
    console.log("✅ Environment variables validated successfully");
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      
      console.error("\n💡 Make sure you have:");
      console.error("  1. Created a .env file based on .env.example");
      console.error("  2. Added your GEMINI_API_KEY from Google AI Studio");
      console.error("  3. Generated a secure SESSION_SECRET (32+ characters)");
      console.error("  4. (Optional) Added Supabase credentials for enhanced features");
      
      process.exit(1);
    }
    
    throw error;
  }
}

// Export validated config
export const config = validateEnv();

// Helper to check if feature is enabled
export const features = {
  supabase: !!(config.SUPABASE_URL && config.SUPABASE_SERVICE_KEY),
  database: !!config.DATABASE_URL,
  oauth: {
    github: !!(config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET),
    google: !!(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET),
  },
};

// Export types
export type Config = z.infer<typeof envSchema>;
export type Features = typeof features;