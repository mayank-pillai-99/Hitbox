import axios from 'axios';
import { env } from '../config/env.js';
import logger from './logger.js';

let accessToken = null;
let tokenExpiry = 0;
let tokenPromise = null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestToken = async () => {
    for (let attemptsLeft = 3; attemptsLeft > 0; attemptsLeft--) {
        try {
            const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
                params: {
                    client_id: env.TWITCH_CLIENT_ID,
                    client_secret: env.TWITCH_CLIENT_SECRET,
                    grant_type: 'client_credentials',
                },
                timeout: 15000,
            });
            accessToken = response.data.access_token;
            tokenExpiry = Date.now() + response.data.expires_in * 1000;
            logger.info('Generated a new IGDB access token');
            return accessToken;
        } catch (error) {
            logger.warn({ err: error.message, attemptsLeft: attemptsLeft - 1 }, 'IGDB auth attempt failed');
            if (attemptsLeft > 1) await delay(2000);
        }
    }
    // Resolve to null instead of throwing, so one outage can't crash the process.
    return null;
};

export const getAccessToken = async () => {
    // Reuse the token until 60s before it expires.
    if (accessToken && Date.now() < tokenExpiry - 60000) return accessToken;

    // Concurrent callers share one refresh request.
    tokenPromise ??= requestToken().finally(() => {
        tokenPromise = null;
    });
    return tokenPromise;
};

const igdb = axios.create({
    baseURL: 'https://api.igdb.com/v4',
    timeout: 15000,
});

igdb.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (!token) {
        const error = new Error('IGDB authentication unavailable');
        error.code = 'IGDB_AUTH_FAILED';
        throw error;
    }
    config.headers['Client-ID'] = env.TWITCH_CLIENT_ID;
    config.headers.Authorization = `Bearer ${token}`;
    config.headers.Accept = 'application/json';
    config.headers['Content-Type'] = 'text/plain';
    return config;
});

export default igdb;
