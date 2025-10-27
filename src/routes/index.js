import { Router } from 'express';
import auth from './auth.routes.js';
import users from './users.routes.js';


const r = Router();


r.use('/auth', auth);
r.use('/users', users);


export default r;