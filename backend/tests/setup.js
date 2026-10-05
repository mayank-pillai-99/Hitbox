// Runs before every test file: env.js validates these on import.
process.env.NODE_ENV = 'test';
process.env.DB_CONNECTION_SECRET = 'mongodb://localhost:27017/hitbox-test';
process.env.JWT_SECRET = 'test-secret-test-secret';
process.env.TWITCH_CLIENT_ID = 'test-client';
process.env.TWITCH_CLIENT_SECRET = 'test-secret';
process.env.CORS_ORIGIN = '';
