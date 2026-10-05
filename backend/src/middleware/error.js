import { HttpError } from '../lib/errors.js';
import logger from '../lib/logger.js';

export const notFoundHandler = (_req, res) => res.status(404).json({ message: 'Route not found' });

export function errorHandler(err, req, res, _next) {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ message: err.message });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON body' });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Request body too large' });
    }
    if (err.code === 'IGDB_AUTH_FAILED' || err.isAxiosError) {
        logger.error({ err: err.message, url: req.originalUrl }, 'IGDB request failed');
        return res.status(502).json({ message: 'Game data provider is unavailable. Please try again.' });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid id' });
    }
    if (err.code === 11000) {
        return res.status(409).json({ message: 'Already exists' });
    }

    logger.error({ err, url: req.originalUrl, method: req.method }, 'Unhandled error');
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
