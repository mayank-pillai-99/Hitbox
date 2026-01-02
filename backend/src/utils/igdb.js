import axios from 'axios';

let accessToken = null;
let tokenExpiry = 0;

const getAccessToken = async () => {
    // If we have a token and it's not expired (buffer of 60s), return it
    if (accessToken && Date.now() < tokenExpiry - 60000) {
        return accessToken;
    }

    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        });

        accessToken = response.data.access_token;
        // expires_in is in seconds
        tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        console.log('New IGDB Access Token Generated');
        return accessToken;
    } catch (error) {
        console.error('Failed to get IGDB access token:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        throw new Error('IGDB Auth Failed');
    }
};

const igdb = axios.create({
    baseURL: 'https://api.igdb.com/v4',
});

// Interceptor to add auth headers just before sending
igdb.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    config.headers['Client-ID'] = process.env.TWITCH_CLIENT_ID;
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Accept'] = 'application/json';
    config.headers['Content-Type'] = 'text/plain';
    return config;
});

export default igdb;
