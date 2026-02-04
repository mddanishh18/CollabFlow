import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable schema validation
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('5000'),
    MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
    JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    CLIENT_URL: z.string().url().default('http://localhost:3000'),
    REDIS_URL: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
});

// Infer the type from the schema
export type EnvConfig = z.infer<typeof envSchema>;

// Validate and parse environment variables
let env: EnvConfig;
try {
    env = envSchema.parse(process.env);
} catch (error) {
    const zodError = error as z.ZodError;
    console.error('❌ Invalid environment variables:', zodError.errors);
    process.exit(1);
}

export default env;
