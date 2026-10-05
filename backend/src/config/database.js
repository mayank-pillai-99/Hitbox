import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../lib/logger.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.DB_CONNECTION_SECRET);
        logger.info(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        logger.fatal({ err: error.message }, 'MongoDB connection failed');
        process.exit(1);
    }
};

export default connectDB;
