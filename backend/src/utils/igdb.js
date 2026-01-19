import axios from 'axios';

let accessToken = null;
let tokenExpiry = 0;

let tokenPromise = null;

const getAccessToken = async () => {
    // If we have a token and it's not expired (buffer of 60s), return it
    if (accessToken && Date.now() < tokenExpiry - 60000) {
        return accessToken;
    }

    // If a request is already in progress, wait for it
    if (tokenPromise) {
        return tokenPromise;
    }

    // Start a new request
    tokenPromise = (async () => {
        let retries = 3;
        while (retries > 0) {
            try {
                const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
                    params: {
                        client_id: process.env.TWITCH_CLIENT_ID,
                        client_secret: process.env.TWITCH_CLIENT_SECRET,
                        grant_type: 'client_credentials'
                    },
                    timeout: 15000 // 15s timeout
                });

                accessToken = response.data.access_token;
                tokenExpiry = Date.now() + (response.data.expires_in * 1000);
                console.log('New IGDB Access Token Generated');
                return accessToken;
            } catch (error) {
                console.error(`IGDB Auth Attempt Failed (${retries} retries left):`, error.message);
                retries--;
                if (retries === 0) {
                    if (error.response) {
                        console.error('Final Auth Error Response:', error.response.data);
                    }
                    console.error('IGDB Auth Failed after multiple attempts - returning null');
                    return null; // Return null instead of throwing to prevent crash
                }
                // Wait 2s before retry
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        return null;
    })();

    tokenPromise.finally(() => {
        tokenPromise = null;
    });

    return tokenPromise;
};

const igdb = axios.create({
    baseURL: 'https://api.igdb.com/v4',
});

// Interceptor to add auth headers just before sending
igdb.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (!token) {
        // If no token, reject the request gracefully
        const error = new Error('IGDB authentication unavailable');
        error.code = 'IGDB_AUTH_FAILED';
        return Promise.reject(error);
    }
    config.headers['Client-ID'] = process.env.TWITCH_CLIENT_ID;
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Accept'] = 'application/json';
    config.headers['Content-Type'] = 'text/plain';
    return config;
});

export default igdb;

