import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import logger from './lib/logger.js';
import { apiLimiter, gamesLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/games.js';
import reviewRoutes from './routes/reviews.js';
import listRoutes from './routes/lists.js';
import userRoutes from './routes/users.js';
import gameStatusRoutes from './routes/gameStatus.js';
import commentRoutes from './routes/comments.js';
import feedRoutes from './routes/feed.js';
import statsRoutes from './routes/stats.js';

export function createApp() {
    const app = express();

    // Behind a tunnel or reverse proxy, the client IP comes from X-Forwarded-For (needed for rate limiting).
    app.set('trust proxy', 1);

    const origins = env.CORS_ORIGIN.split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    app.use(helmet());
    app.use(cors({ origin: origins.length > 0 ? origins : true }));
    app.use(express.json({ limit: '100kb' }));
    app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));

    app.get('/', (_req, res) => res.send('Hitbox API is running'));
    app.get('/health', (_req, res) => res.json({ status: 'ok' }));

    app.use('/api', apiLimiter);
    app.use('/api/auth', authRoutes);
    app.use('/api/games', gamesLimiter, gameRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/lists', listRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/game-status', gameStatusRoutes);
    app.use('/api/comments', commentRoutes);
    app.use('/api/feed', feedRoutes);
    app.use('/api/stats', statsRoutes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
