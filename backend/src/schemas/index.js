import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

// A game can be addressed by its local Mongo id or by its IGDB id.
export const gameRef = z.union([objectId, z.coerce.number().int().positive()]).transform((v) => String(v));

const httpUrl = z
    .string()
    .max(500)
    .refine((value) => {
        try {
            return ['http:', 'https:'].includes(new URL(value).protocol);
        } catch {
            return false;
        }
    }, 'Must be an http(s) URL');

const username = z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{3,30}$/, 'Username must be 3-30 letters, numbers, _ or -');
const email = z.string().trim().email('Invalid email').max(254);
const password = z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password is too long');

const page = z.coerce.number().int().min(1).max(10000).default(1);
const limit = (max, fallback) => z.coerce.number().int().min(1).max(max).default(fallback);

export const idParam = z.object({ id: objectId });

export const auth = {
    register: z.object({ username, email, password }),
    login: z.object({
        email: z.string().trim().min(1, 'Email is required'),
        password: z.string().min(1, 'Password is required'),
    }),
    updateProfile: z.object({
        username: username.optional(),
        email: email.optional(),
        bio: z.string().max(500).optional(),
        profilePicture: z.union([httpUrl, z.literal('')]).optional(),
    }),
};

export const games = {
    query: z.object({
        search: z.string().trim().max(100).optional(),
        // Unknown values (the UI sends '-added') fall back to popularity.
        ordering: z.string().max(20).optional(),
        platforms: z.string().max(30).optional(),
        genres: z.string().max(30).optional(),
        dates: z.string().max(60).optional(),
        page,
    }),
    params: z.object({ id: gameRef }),
};

export const reviews = {
    create: z.object({
        gameId: gameRef,
        rating: z.number().int().min(1).max(5),
        text: z.string().trim().max(5000).optional(),
    }),
    update: z.object({
        rating: z.number().int().min(1).max(5).optional(),
        text: z.string().trim().max(5000).optional(),
    }),
    params: z.object({ reviewId: objectId }),
    gameParams: z.object({ gameId: gameRef }),
    recentQuery: z.object({ limit: limit(50, 5) }),
};

export const lists = {
    discoverQuery: z.object({ page, limit: limit(50, 20), sort: z.enum(['popular', 'recent']).default('popular') }),
    create: z.object({
        name: z.string().trim().min(1, 'List name is required').max(100),
        description: z.string().trim().max(500).optional(),
    }),
    update: z.object({
        name: z.string().trim().min(1, 'List name is required').max(100).optional(),
        description: z.string().trim().max(500).optional(),
    }),
    addGame: z.object({ gameId: gameRef }),
    removeGameParams: z.object({ id: objectId, gameId: objectId }),
};

export const comments = {
    create: z.object({ text: z.string().trim().min(1, 'Comment required').max(1000, 'Too long') }),
    listParams: z.object({ listId: objectId }),
    params: z.object({ commentId: objectId }),
};

export const gameStatus = {
    set: z.object({
        gameId: gameRef,
        status: z.enum(['played', 'playing', 'want_to_play'], { message: 'Invalid status' }),
    }),
    params: z.object({ gameId: gameRef }),
};

export const users = {
    membersQuery: z.object({ page, limit: limit(50, 20), sort: z.enum(['reviews', 'recent']).default('reviews') }),
    reviewsQuery: z.object({ page, limit: limit(50, 10) }),
    params: z.object({ username: z.string().min(1).max(30) }),
};
