import { z } from 'zod';
import { one, q } from '../lib/db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signJwt } from '../utils/jwt.js';
import { validate } from '../utils/validate.js';


export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(6)
  })
});


export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  })
});


export const register = [
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const { email, name, password } = req.valid.body;
      const existing = await one('SELECT id FROM users WHERE email=$1', [email]);
      if (existing) return res.status(409).json({ error: 'Email already in use' });
      const password_hash = await hashPassword(password);
      const rows = await q(
        'INSERT INTO users(email, name, password_hash) VALUES($1,$2,$3) RETURNING id, email, name, created_at',
        [email, name, password_hash]
      );
      const user = rows[0];
      const token = signJwt({ id: user.id, email: user.email });
      res.status(201).json({ user, token });
    } catch (e) { next(e); }
  }
];


export const login = [
  validate(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.valid.body;
      const user = await one('SELECT id, email, name, password_hash FROM users WHERE email=$1', [email]);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await verifyPassword(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      const { password_hash, ...safe } = user;
      const token = signJwt({ id: user.id, email: user.email });
      res.json({ user: safe, token });
    } catch (e) { next(e); }
  }
];