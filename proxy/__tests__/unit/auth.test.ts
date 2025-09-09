import { describe, it, expect } from 'vitest';
import { checkBearerToken } from '../../src/auth.js';

// ACCESS_TOKEN_KEY='secret-string' node token.js some-user
const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXBwb2xJZCI6InNvbWUtdXNlciIsImlhdCI6MTc1NzQzMDk4MCwiZXhwIjo1MzU3NDMwOTgwfQ.Zidxcwu343qBZRSRQddcTSCbNtRMo6rY2hLgCesinco`;

// ACCESS_TOKEN_KEY='wrong' node token.js some-user
const invalidToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXBwb2xJZCI6InNvbWUtdXNlciIsImlhdCI6MTc1NzMzMjY5NSwiZXhwIjo1MzU3MzMyNjk1fQ.8ONrzFsvwvq5Hgh5piDVJaCogyoTbv14KdrIQy3TEIE`;

describe('checkBearerToken function', () => {
  it('should return user id for valid token', async () => {
    const result = await checkBearerToken(`Bearer ${token}`, 'secret-string');
    expect(result).toBe('some-user');
  });

  it('should throw for invalid token', async () => {
   const promise = checkBearerToken(`Bearer ${invalidToken}`, 'wrong');
   await expect(promise).rejects.toThrowError();
  });
});