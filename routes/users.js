import Joi from '@hapi/joi';
import db from '../services/db.js';
import bcrypt from 'bcrypt';

const usersRoutes = [
    {
        method: 'POST',
        path: '/users',
        handler: async (request, h) => {
            const { username, password, email } = request.payload;
            try {
                const existingUser = await db.select('*').from('users').where('username', username).orWhere('email', email).first();
                if (existingUser) {
                    return h.response({
                        message: 'Username or email already in use.'
                    }).code(400);
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const [newUser] = await db('users').insert({
                    username,
                    password: hashedPassword,
                    email
                }).returning('*');

                return h.response(newUser).code(201);
            } catch (err) {
                console.error(err);
                return h.response('Error creating user').code(500);
            }
        },
        options: {
            auth: false,
            validate: {
                payload: Joi.object({
                    username: Joi.string().required(),
                    password: Joi.string().min(6).required(),
                    email: Joi.string().email().required()
                })
            }
        }

    },
    {
        method: 'GET',
        path: '/users/{id}',
        handler: async (request, h) => {
            const { id } = request.params;
            try {
                const user = await db.select('id', 'username', 'email', 'created_at').from('users').where('id', id);
                if (user.length === 0) {
                    return h.response('User not found').code(404);
                }
                return user[0];
            } catch (err) {
                console.error(err);
                return h.response('Error fetching user').code(500);
            }
        },
        options: {
            auth: false,
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            }
        }
    },
    {
        method: 'GET',
        path: '/users',
        handler: async  (request, h) => {
            try {
                const users = await db.select('id', 'username', 'email', 'created_at').from('users');
                return h.response(users).code(200);
            } catch (err) {
                console.error(err);
                return h.response('Error fetching users').code(500);
            }
        },
        options: {
            auth: process.env.NODE_ENV === 'test' ? false : 'authJwt'
        }
    }
];

export default usersRoutes;
