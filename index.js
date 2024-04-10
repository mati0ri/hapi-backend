import Hapi from '@hapi/hapi';
import jwt from '@hapi/jwt';
import JWT from 'jsonwebtoken';

import loginRoutes from './routes/login.js';
import messagesRoutes from './routes/messages.js';
import usersRoutes from './routes/users.js';

import { decrypt } from './tools/crypt.js';



const init = async () => {

    const server = new Hapi.server({
        port: 3100,
        host: '0.0.0.0',
        routes: {
            cors: true
        }
    });

    await server.register(jwt);


    // Auth strategies

    server.auth.strategy('authJwt', 'jwt', {
        keys: 'jwtKey',
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: 14400
        },
        validate: (artifacts, request, h) => {
            try {
                const payload = JWT.verify(artifacts.token, 'jwtKey');
                return {
                    isValid: true,
                    credentials: { user: payload.user }
                };
            } catch (err) {
                console.error('Failed to verify token:', err.message);
                return { isValid: false };
            }
        }
    });

    server.auth.strategy('authJwtForUser', 'jwt', {
        // prevent users to access other users data
        keys: 'jwtKey',
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: 14400
        },
        validate: async (artifacts, request, h) => {
            try {
                const payload = JWT.verify(artifacts.token, 'jwtKey');
                const userIdFromParam = request.params.id;
    
                if (userIdFromParam && payload.user.id.toString() !== userIdFromParam.toString()) {
                    return { isValid: false };
                }
    
                return {
                    isValid: true,
                    credentials: { user: payload.user }
                };
            } catch (err) {
                console.error('Failed to verify token:', err.message);
                return { isValid: false };
            }
        }
    });
    


    // On request hook to decrypt token

    server.ext('onRequest', (request, h) => {

        const authorization = request.headers.authorization;

        if (authorization && authorization.startsWith('Bearer ')) {

            try {
                const encryptedToken = authorization.split(' ')[1];
                const decryptedToken = decrypt(encryptedToken);

                request.headers.authorization = `Bearer ${decryptedToken}`;

            } catch (error) {
                console.error('Error decrypting token:', error);
            }
        }

        return h.continue;
    });

    server.auth.default('authJwt');


    // Routes

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hapi backend running !'
        },
        options: {
            auth: false,
        }
    });

    server.route(loginRoutes);
    server.route(usersRoutes);
    server.route(messagesRoutes);


    server.route({
        method: '*',
        path: '/{any*}',
        handler: (request, h) => {
            return '404 Error! Page Not Found!'
        },
    });

    await server.start()
    return server
}

init().then(server => {
    console.log('Server running on %s', server.info.uri);
}).catch(err => {
    console.error(err);
});