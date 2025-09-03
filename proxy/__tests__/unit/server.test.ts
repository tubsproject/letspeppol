import { describe, it, beforeEach, afterAll, vi, expect } from 'vitest';
import { startServer } from '../../src/server.js';

describe('startServer function', () => {
  const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleMock.mockReset();
  });

  it('should start the server and listen on the specified port', async () => {
    const port = 3000;
    process.env.PORT = port.toString();

    await startServer({
        PORT: '3000',
        ACUBE_TOKEN: 'test-token',
        DATABASE_URL: 'test-database-url',
        PASS_HASH_SALT: 'test-pass-hash-salt',
        ACCESS_TOKEN_KEY: 'test-access-token-key'
    });

    expect(consoleMock).toHaveBeenCalledWith(`LetsPeppol listening on port ${port}`);
  });
});
