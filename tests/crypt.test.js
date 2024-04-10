import { encrypt, decrypt } from '../tools/crypt.js';

describe('Encryption and Decryption', () => {
  test('should encrypt and then decrypt to the original value', () => {
    const originalValue = 'test string';
    const encrypted = encrypt(originalValue);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(originalValue);
  });
});
