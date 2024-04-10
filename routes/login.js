import bcrypt from 'bcrypt';
import db from '../services/db.js';
import jwt from 'jsonwebtoken';
import { encrypt } from '../tools/crypt.js';


const loginRoutes = [
    {
        method: 'GET',
        path: '/login',
        handler: (request, h) => {
            return `<html>
                <head><title>Login page</title></head>
                <body>
                    <h3>Please Log In</h3>
                    <form method="post" action="/login">
                        Username: <input type="text" name="username"><br>
                        Password: <input type="password" name="password"><br/>
                        <input type="submit" value="Login">
                    </form>
                </body>
              </html>`;
        },
        options: {
            auth: false
        }
    },
    {
        method: 'POST',
        path: '/login',
        handler: async (request, h) => {

            const { username, password } = request.payload;
            const user = await db.select('*').from('users').where('username', username).first();
            
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return h.response({ err: 'Invalid username or password' }).code(401);
            }

            const token = jwt.sign({
                user: {
                    id: user.id,
                    username: user.username
                }
            }, 'jwtKey', { algorithm: 'HS256', expiresIn: '4h' });

            const encryptedToken = encrypt(token);

            return h.response({ token: encryptedToken });
        },
        options: {
            auth: false
        }
    }
];

export default loginRoutes;
