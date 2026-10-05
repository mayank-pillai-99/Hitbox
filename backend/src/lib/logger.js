import pino from 'pino';

const level = process.env.NODE_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL || 'info';

const logger = pino({
    level,
    // Never log credentials, even if a handler logs a whole request.
    redact: ['req.headers["x-auth-token"]', 'req.headers.authorization', 'password', '*.password'],
    ...(process.env.NODE_ENV === 'development' && { transport: { target: 'pino-pretty' } }),
});

export default logger;
