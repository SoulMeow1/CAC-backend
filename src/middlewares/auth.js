import { verifyJwt } from '../utils/jwt.js';


export function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    try {
        const payload = verifyJwt(token);
        req.user = payload; // { id, email }
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}