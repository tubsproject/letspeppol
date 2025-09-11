import { describe, it, expect } from 'vitest';
import { checkBearerToken } from '../../src/auth.js';

// ACCESS_TOKEN_KEY='secret-string' node token.js some-user
const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXBwb2xJZCI6InNvbWUtdXNlciIsImlhdCI6MTc1NzQzMDk4MCwiZXhwIjo1MzU3NDMwOTgwfQ.Zidxcwu343qBZRSRQddcTSCbNtRMo6rY2hLgCesinco`;

// ACCESS_TOKEN_KEY='wrong' node token.js some-user
const invalidToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXBwb2xJZCI6InNvbWUtdXNlciIsImlhdCI6MTc1NzQzMzU0NywiZXhwIjo1MzU3NDMzNTQ3fQ.PPf-wMm0BAoctE25B9jw9m-NBpEI0BIMhLELcp0JQiQ`;

describe('checkBearerToken function', () => {
  it('should return user id for valid token', async () => {
    const result = await checkBearerToken(token, 'secret-string');
    expect(result).toBe('some-user');
  });

  it('should throw for invalid token', async () => {
   const promise = checkBearerToken(invalidToken, 'secret-string');
   await expect(promise).rejects.toThrowError();
  });
});