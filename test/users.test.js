import request from 'supertest';
import app from '../src/app.js';


async function authToken() {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ email: 'grace@example.com', name: 'Grace', password: 'secret123' });
  return reg.body.token;
}


describe('Users', () => {
  test('GET /api/users/me requires auth', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
});


  test('GET /api/users/me returns profile', async () => {
    const token = await authToken();
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('grace@example.com');
  });
});