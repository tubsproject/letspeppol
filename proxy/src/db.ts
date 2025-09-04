import { createHash } from 'crypto';
import { Client } from 'pg';

function sha256(plaintext: string): string {
  if (typeof plaintext !== 'string') throw new Error('Invalid input');
  const salt = process.env.PASS_HASH_SALT;
  if (typeof salt !== 'string') throw new Error('Invalid salt');
  if (salt.length < 10) throw new Error('Salt too short (min len 10)');
  const hash = createHash('sha256');
  hash.update(plaintext + salt);
  return `\\x${hash.digest('hex')}`;
}

async function getPostgresClient(): Promise<Client> {
  const options = {
    connectionString: process.env.DATABASE_URL || 'postgres://letspeppol:something-secret@localhost:5432/letspeppol?sslmode=disable',
    ssl: {
      rejectUnauthorized: false
    }
  };
  console.log('connecting to postgres', options);
  const client = new Client(options);
  await client.connect();
  return client;
}

export async function checkPassHash(
  peppolId: string,
  password: string,
): Promise<string | null> {
  const passHash = sha256(`${peppolId}:${password}`);
  const query = `
SELECT peppolId
FROM passwords
WHERE peppolId = $1  AND passHash = $2
`;
  console.log(query, [peppolId, passHash]);
  const client = await getPostgresClient();

  const result = await client.query(query, [peppolId, passHash]);
  console.log(result.rows);
  return result.rows[0]?.peppolid || null;
}

