import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export default function auth(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch {
        res.status(401).json({ message: 'Token is not valid' });
    }
}
