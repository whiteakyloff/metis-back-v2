import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
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
    GITHUB_TOKEN: z.string(), GITHUB_URL: z.string().url()
});

const env = envSchema.parse(process.env);

export const config = {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    corsOrigin: process.env.CORS_ORIGIN,
    mongodbUri: env.MONGODB_URI,
    jwt: {
        secret: env.JWT_SECRET,
        expiresIn: env.JWT_EXPIRES_IN
    },
    email: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
    },
    github: {
        url: env.GITHUB_URL,
        token: env.GITHUB_TOKEN
    },
    google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET
    }

};

export type AppConfig = typeof config;