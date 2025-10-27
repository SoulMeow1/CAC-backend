import request from 'supertest';
import app from '../src/app.js';


describe('Auth', () => {
  test('register + login', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'ada@example.com', name: 'Ada', password: 'secret123' });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeDefined();


    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ada@example.com', password: 'secret123' });
    expect(login.status).toBe(200);
    expect(login.body.user.email).toBe('ada@example.com');
    expect(login.body.token).toBeDefined();
  });
});