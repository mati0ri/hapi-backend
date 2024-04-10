import crypto from 'crypto';

// const algorithm = 'Cipheriv';
const algorithm = 'aes-256-ctr';
const secretKey = 'my-very-very-secret-key';
const secretIv = 'my-secret-iv';

const key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32);
const iv = crypto.createHash('sha256').update(String(secretIv)).digest('base64').substr(0, 16);

export function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

export function decrypt(text) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}