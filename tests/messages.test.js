import db from '../services/db.js';
import Hapi from '@hapi/hapi';
import messagesRoutes from '../routes/messages.js';

describe('Messages Routes', () => {

    let server;
    let originalNodeEnv;
    let createdMessageId;

    beforeAll(async () => {

        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'test';

        server = Hapi.server({
            port: 3100,
            host: 'localhost',
        });

        server.route(messagesRoutes);
        await server.initialize();
    });


    const sender_id = 1;

    it('should create a new message', async () => {
        const content = 'This is a message for testing with Jest';

        const options = {
            method: 'POST',
            url: '/messages',
            payload: {
                sender_id,
                content
            }
        };

        const response = await server.inject(options);

        expect(response.statusCode).toBe(201);
        expect(response.result).toHaveProperty('content', content);

        createdMessageId = response.result.id; 
    });


    it('should fetch all messages', async () => {

        const response = await server.inject({
            method: 'GET',
            url: '/messages'
        });
    
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.result)).toBe(true);
    });


    it('should fetch a single message by ID', async () => {
        expect(createdMessageId).toBeDefined();

        const response = await server.inject({
            method: 'GET',
            url: `/messages/${createdMessageId}`
        });

        expect(response.statusCode).toBe(200);
        expect(response.result).toHaveProperty('id', createdMessageId);
    });


    it('should update a message by ID', async () => {
        const updatedContent = 'This is an updated message for testing with Jest';

        const response = await server.inject({
            method: 'PUT',
            url: `/messages/${createdMessageId}`,
            payload: {
                content: updatedContent
            }
        });

        expect(response.statusCode).toBe(200);
        expect(response.result).toHaveProperty('content', updatedContent);
    });


    it('should delete a message by ID', async () => {
        const response = await server.inject({
            method: 'DELETE',
            url: `/messages/${createdMessageId}`
        });

        expect(response.statusCode).toBe(200);
        const fetchResponse = await server.inject({
            method: 'GET',
            url: `/messages/${createdMessageId}`
        });

        expect(fetchResponse.statusCode).toBe(404);
    });


    afterAll(async () => {
        await server.stop();
        await db.destroy();
        process.env.NODE_ENV = originalNodeEnv;
    });
});
