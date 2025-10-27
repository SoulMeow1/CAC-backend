import { one } from '../lib/db.js';


export async function me(req, res, next) {
  try {
    const user = await one('SELECT id, email, name, created_at FROM users WHERE id=$1', [req.user.id]);
    res.json(user);
  } catch (e) { next(e); }
}