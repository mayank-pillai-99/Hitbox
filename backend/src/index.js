import mongoose from 'mongoose';
import { env } from './config/env.js';
import connectDB from './config/database.js';
import logger from './lib/logger.js';
import { createApp } from './app.js';

// Connect first, so no request can arrive before the database is ready.
await connectDB();

const server = createApp().listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
});

const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
    });
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
