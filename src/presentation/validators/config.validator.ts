import { z } from "zod";

export const configSchema = z.object({
    // Server environment
    NODE_ENV: z.enum(['development', 'production'])
        .default('development')
        .describe('Application environment'),

    // Server configuration
    PORT: z.string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0 && val < 65536, {
            message: "Port must be between 1 and 65535"
        }),

    // CORS configuration
    CORS_ORIGIN: z.string()
        .url({ message: 'CORS_ORIGIN must be a valid URL' })
        .default('http://localhost:3000')
        .describe('Allowed CORS origin'),

    // Database configuration
    MONGODB_URI: z.string()
        .url({ message: 'MONGODB_URI must be a valid MongoDB connection string' })
        .startsWith('mongodb', { message: 'MONGODB_URI must start with "mongodb"' })
        .default('mongodb://localhost:27017/metis-v2')
        .describe('MongoDB connection string'),

    // JWT configuration
    JWT_SECRET: z.string()
        .min(32, { message: 'JWT_SECRET must be at least 32 characters long' })
        .regex(/^[a-zA-Z0-9-_]+$/, {
            message: 'JWT_SECRET must only contain alphanumeric characters, hyphens, and underscores'
        })
        .describe('JWT secret key'),

    JWT_EXPIRES_IN: z.string()
        .regex(/^\d+[smhd]$/, {
            message: 'JWT_EXPIRES_IN must be in format: <number>[s|m|h|d] (e.g., 7d, 24h, 60m)'
        })
        .default('7d')
        .describe('JWT expiration time'),

    // Email configuration
    EMAIL_USER: z.string()
        .email({ message: 'EMAIL_USER must be a valid email address' })
        .describe('Email service username'),

    EMAIL_PASS: z.string()
        .min(8, { message: 'EMAIL_PASS must be at least 8 characters long' })
        .describe('Email service password'),

    // OAuth configuration
    GOOGLE_CLIENT_ID: z.string()
        .regex(/^\d+-[a-zA-Z0-9_]+\.apps\.googleusercontent\.com$/, {
            message: 'Invalid Google Client ID format'
        })
        .describe('Google OAuth client ID'),

    GOOGLE_CLIENT_SECRET: z.string()
        .regex(/^GOCSPX-[a-zA-Z0-9_-]+$/, {
            message: 'Invalid Google Client Secret format'
        })
        .describe('Google OAuth client secret'),

    // GitHub configuration
    GITHUB_URL: z.string()
        .url({ message: 'GITHUB_URL must be a valid URL' })
        .regex(/^https:\/\/api\.github\.com\//, {
            message: 'GITHUB_URL must be a GitHub API URL (https://api.github.com/...)'
        })
        .describe('GitHub API URL'),

    GITHUB_TOKEN: z.string()
        .regex(/^(gh[ps]_[a-zA-Z0-9_]+|github_pat_[a-zA-Z0-9_]+)$/, {
            message: 'Invalid GitHub token format. Must be a personal access token or GitHub App token'
        })
        .describe('GitHub access token'),

    // Qwen API configuration
    QWEN_API_KEY: z.string()
        .regex(/^[a-zA-Z0-9_-]+$/, {
            message: 'QWEN_API_KEY must only contain alphanumeric characters, hyphens, and underscores'
        })
        .describe('Qwen API key'),
    QWEN_BASE_URL: z.string(),

    // Claude AI configuration
    CLAUDE_API_KEY: z.string()
        .regex(/^[a-zA-Z0-9_-]+$/, {
            message: 'CLAUDE_API_KEY must only contain alphanumeric characters, hyphens, and underscores'
        })
        .describe('Claude AI API key'),

    CLAUDE_TIMEOUT: z.string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, {
            message: "Timeout must be a positive number"
        }),

    CLAUDE_MAX_RETRIES: z.string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => val >= 0, {
            message: "Max retries must be a non-negative number"
        })
});