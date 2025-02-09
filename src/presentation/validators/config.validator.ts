import { z } from "zod";

export const configSchema = z.object({
    PORT: z.string().transform(Number).default('8080'),
    NODE_ENV: z.string().default('development'),
    CORS_ORIGIN: z.string().url(),
    MONGODB_URI: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('7d'),
    EMAIL_USER: z.string().email(),
    EMAIL_PASS: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GITHUB_TOKEN: z.string(), GITHUB_URL: z.string().url(),
    CLAUDE_API_KEY: z.string(), DEEPSEEK_API_KEY: z.string()
});