import Joi from '@hapi/joi';
import db from '../services/db.js';

const messagesRoutes = [
    {
        method: 'GET',
        path: '/messages',
        options: {
            auth: process.env.NODE_ENV === 'test' ? false : 'authJwt',
            handler: async (request, h) => {
                try {
                    const messages = await db.select('*').from('messages');
                    return messages;
                } catch (err) {
                    console.error(err);
                    return h.response('Error fetching messages').code(500);
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/messages/{id}',
        handler: async (request, h) => {
            const { id } = request.params;
            try {
                const message = await db.select('*').from('messages').where('id', id);
                if (message.length === 0) {
                    return h.response('Message not found').code(404);
                }
                return message[0];
            } catch (err) {
                console.error(err);
                return h.response('Error fetching message').code(500);
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
        method: 'POST',
        path: '/messages',
        handler: async (request, h) => {
            const { sender_id, content } = request.payload;
            try {
                const [newMessage] = await db('messages').insert({ sender_id, content }).returning('*');
                return h.response(newMessage).code(201);
            } catch (err) {
                console.error(err);
                return h.response('Error creating message').code(500);
            }
        },
        options: {
            auth: process.env.NODE_ENV === 'test' ? false : 'authJwt',
            validate: {
                payload: Joi.object({
                    content: Joi.string().required(),
                    sender_id: Joi.number().integer().required()
                })
            }
        }
    },
    {
        method: 'PUT',
        path: '/messages/{id}',
        handler: async (request, h) => {
            const { id } = request.params;
            const { content } = request.payload;

            try {
                const [updatedMessage] = await db('messages')
                    .where('id', id)
                    .update({ content })
                    .returning('*');

                if (!updatedMessage) {
                    return h.response('Message not found').code(404);
                }

                return h.response(updatedMessage).code(200);
            } catch (err) {
                console.error(err);
                return h.response('Error updating message').code(500);
            }
        },
        options: {
            auth: process.env.NODE_ENV === 'test' ? false : 'authJwt',
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                }),
                payload: Joi.object({
                    content: Joi.string().required()
                })
            }
        }
    },
    {
        method: 'DELETE',
        path: '/messages/{id}',
        handler: async (request, h) => {
            const { id } = request.params;

            try {
                const deleted = await db('messages')
                    .where('id', id)
                    .del();

                if (deleted === 0) {
                    return h.response('Message not found').code(404);
                }

                return h.response('Message deleted successfully').code(200);
            } catch (err) {
                console.error(err);
                return h.response('Error deleting message').code(500);
            }
        },
        options: {
            auth: process.env.NODE_ENV === 'test' ? false : 'authJwt',
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required()
                })
            }
        }
    }

];

export default messagesRoutes;
