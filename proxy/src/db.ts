import { createHash } from 'crypto';
import { Client } from 'pg';
import jsonwebtoken from 'jsonwebtoken';
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

  const secretKey = 'yourSecretKey'; // Replace with your own secret key
  const options = {
    expiresIn: '1h', // Token expiration time
  };
  const payload = { peppolId };
  const token = jsonwebtoken.sign(payload, secretKey, options);
//   const query = `
// INSERT INTO sessions (peppolId, token, expires)
// VALUES ($1, $2, now()::timestamp + interval '1 day')
// `;
//   await client.query(query, [peppolId, token]);
  console.log(`Generated token for ${peppolId}: ${token}`);
  return token;
}

export async function checkBearerToken(token: string): Promise<string | null> {
  return new Promise((resolve) => {
    jsonwebtoken.verify(token, 'yourSecretKey', (err, payload) => {
      if (err) {
        resolve(null);
      } else {
        resolve(payload.peppolId);
      }
    });
  });
}
