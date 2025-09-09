import { describe, it, expect } from 'vitest';
import { checkBearerToken } from '../../src/auth.js';

// ACCESS_TOKEN_KEY='secret-string' node token.js some-user
const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXBwb2xJZCI6InNvbWUtdXNlciIsImlhdCI6MTc1NzMzMjYyNywiZXhwIjo1MzU3MzMyNjI3fQ.oPoeKGVUfDxl1tejeMQTzdRAXK4aXww9iDmJVusSRUg`;

// ACCESS_TOKEN_KEY='wrong' node token.js some-user
const invalidToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwZXBwb2xJZCI6InNvbWUtdXNlciIsImlhdCI6MTc1NzMzMjY5NSwiZXhwIjo1MzU3MzMyNjk1fQ.8ONrzFsvwvq5Hgh5piDVJaCogyoTbv14KdrIQy3TEIE`;

describe('checkBearerToken function', () => {
  it('should return true for valid token', () => {
    const result = checkBearerToken(`Bearer ${token}`, 'secret-string');
    expect(result).toBe(true);
  });

  it('should return false for invalid token', () => {
    const result = checkBearerToken(`Bearer ${invalidToken}`, 'wrong');
    expect(result).toBe(false);
  });
});