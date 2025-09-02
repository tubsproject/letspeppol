import { createHash } from 'crypto';
import { Client } from 'pg';
const client = await getPostgresClient();

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
  const client = new Client({
    user: process.env.POSTGRES_APP_USER || 'letspeppol',
    password: process.env.POSTGRES_APP_PASSWORD || 'letspeppol',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_APP_DB || 'letspeppol',
  }); 
  await client.connect();
  return client;
}

export async function checkPassHash(
  peppolId: string,
  password: string,
): Promise<string | null> {
  const passHash = sha256(password);
  const query = `
SELECT peppolId
FROM passwords
WHERE peppolId = $1  AND passHash = $2
`;
  console.log(query, [peppolId, passHash]);
  const result = await client.query(query, [peppolId, passHash]);
  console.log(result.rows);
  return result.rows[0]?.peppolid || null;
}

export async function generateToken(peppolId: string): Promise<string> {
  const token = Math.random().toString(36).slice(2);
  const query = `
INSERT INTO sessions (peppolId, token, expires)
VALUES ($1, $2, now()::timestamp + interval '1 day')
`;
  await client.query(query, [peppolId, token]);
  console.log(`Generated token for ${peppolId}: ${token}`);
  return token;
}