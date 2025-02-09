import dotenv from 'dotenv';
import { configSchema } from "@presentation/validators/config.validator";

dotenv.config();

const env = configSchema.parse(process.env);

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
    },
    claude: {
        apiKey: env.CLAUDE_API_KEY
    },
    deepseek: {
        apiKey: env.DEEPSEEK_API_KEY
    }
};

export type AppConfig = typeof config;