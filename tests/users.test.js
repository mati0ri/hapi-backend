import db from '../services/db.js';
import usersRoutes from '../routes/users.js';
import Hapi from '@hapi/hapi';

describe('Users Routes', () => {

    let server;
    let originalNodeEnv;
    let createdUserId;

    beforeAll(async () => {

        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';

        server = Hapi.server({
            port: 3100,
            host: 'localhost',
        });

        server.route(usersRoutes);
        await server.initialize();
    });


    it('should create a new user', async () => {
        const username = 'newUserForTesting';
        const password = 'newUserForTesting';
        const email = 'newUserForTesting@test.com';

        const options = {
            method: 'POST',
            url: '/users',
            payload: {
                username,
                password,
                email
            }
        };

        const response = await server.inject(options);

        expect(response.statusCode).toBe(201);
        expect(response.result).toHaveProperty('username', username);

        createdUserId = response.result.id;
    });


    it('should fetch all users', async () => {

        const response = await server.inject({
            method: 'GET',
            url: '/users'
        });
    
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.result)).toBe(true);
    });


    it('should fetch a single user by ID', async () => {

        expect(createdUserId).toBeDefined();

        const response = await server.inject({
            method: 'GET',
            url: `/users/${createdUserId}`
        });

        expect(response.statusCode).toBe(200);
        expect(response.result).toHaveProperty('id', createdUserId);

        try {
            await db('users').where('id', createdUserId).del();
            console.log('User deleted');
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    });

    afterAll(async () => {
        await server.stop();
        await db.destroy();
        process.env.NODE_ENV = originalNodeEnv;
    });
});
