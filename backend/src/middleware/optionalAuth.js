import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// For public routes whose response depends on who is looking (e.g. "are you following them?").
// A missing or invalid token just means an anonymous viewer; it is never an error.
export default function optionalAuth(req, _res, next) {
    const token = req.header('x-auth-token');
    if (token) {
        try {
            req.user = jwt.verify(token, env.JWT_SECRET).user;
        } catch {
            // Treated as anonymous.
        }
    }
    next();
}
