import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { me } from '../controllers/users.controller.js';


const r = Router();


r.get('/me', requireAuth, me);


export default r;