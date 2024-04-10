import Hapi from '@hapi/hapi';
import loginRoutes from '../routes/login.js';
import db from '../services/db.js';

describe('Login Route', () => {
    let server;

    beforeAll(async () => {
        server = Hapi.server({
            port: 3100,
            host: 'localhost',
        });

        server.route(loginRoutes);
        await server.initialize();
    });

    it('should return 200 and a token for valid credentials', async () => {
        const testUser = {
            username: 'a',
            password: 'a',
        };

        const response = await server.inject({
            method: 'POST',
            url: '/login',
            payload: testUser,
        });

        expect(response.statusCode).toBe(200);
        expect(response.result).toHaveProperty('token');
    });


    it('should return 401 for invalid credentials', async () => {
        const response = await server.inject({
            method: 'POST',
            url: '/login',
            payload: {
                username: 'wronguser',
                password: 'wrongpassword',
            },
        });

        expect(response.statusCode).toBe(401);
    });

    afterAll(async () => {
        await server.stop();
        await db.destroy();
    });
});
