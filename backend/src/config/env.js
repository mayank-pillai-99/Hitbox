import 'dotenv/config';
import { z } from 'zod';

const schema = z
    .object({
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        PORT: z.coerce.number().int().positive().default(8000),
        DB_CONNECTION_SECRET: z.string().min(1, 'DB_CONNECTION_SECRET is required'),
        JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
        JWT_EXPIRES_IN: z.string().default('7d'),
        TWITCH_CLIENT_ID: z.string().min(1, 'TWITCH_CLIENT_ID is required'),
        TWITCH_CLIENT_SECRET: z.string().min(1, 'TWITCH_CLIENT_SECRET is required'),
        // Comma-separated list of allowed browser origins. Empty allows any origin outside production.
        CORS_ORIGIN: z.string().default(''),
        LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    })
    .superRefine((env, ctx) => {
        if (env.NODE_ENV === 'production' && !env.CORS_ORIGIN) {
            ctx.addIssue({ code: 'custom', path: ['CORS_ORIGIN'], message: 'CORS_ORIGIN is required in production' });
        }
    });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    console.error(`Invalid environment configuration:\n${problems}`);
    process.exit(1);
}

export const env = parsed.data;
