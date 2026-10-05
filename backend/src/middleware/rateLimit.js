import rateLimit from 'express-rate-limit';

const limiter = (windowMs, max, message) =>
    rateLimit({
        windowMs,
        limit: max,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { message },
    });

export const apiLimiter = limiter(60_000, 300, 'Too many requests. Please slow down.');
// Login and registration are the brute-force targets, so they get a much tighter budget.
export const authLimiter = limiter(15 * 60_000, 30, 'Too many attempts. Try again in a few minutes.');
// Browsing games spends IGDB quota (4 requests/second allowed upstream).
export const gamesLimiter = limiter(60_000, 60, 'Too many game searches. Please slow down.');
