import jsonwebtoken from 'jsonwebtoken';

export async function generateToken(peppolId: string, secretKey: string): Promise<string> {
  const options = {
    expiresIn: '1h', // Token expiration time
  };
  const payload = { peppolId };
  const token = jsonwebtoken.sign(payload, secretKey, options);
  console.log(`Generated token for ${peppolId}: ${token}`);
  return token;
}

export async function checkBearerToken(token: string, secretKey: string): Promise<string | null> {
  return new Promise((resolve) => {
    jsonwebtoken.verify(token, secretKey, (err, payload) => {
      if (err) {
        resolve(null);
      } else {
        resolve(payload.peppolId);
      }
    });
  });
}