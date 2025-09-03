import express from 'express';
import { checkPassHash } from './db.js';
import { generateToken, checkBearerToken } from './auth.js';
import { sendInvoice, register, listOurInvoices } from './acube.js';

function getAuthMiddleware(secretKey: string) {
  return async function checkAuth(req, res, next): Promise<void> {
    const authorization = req.headers['authorization'];
    console.log(`Authorization string: "${authorization}"`);
    if (!authorization) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const token = authorization.replace('Bearer ', '');
      const peppolId = await checkBearerToken(token, secretKey);
      console.log('looked up token', token, peppolId);
      if (peppolId) {
        req.peppolId = peppolId;
        next();
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    }
}
}

export type ServerOptions = {
  PORT: string;
  ACUBE_TOKEN: string;
  DATABASE_URL: string;
  PASS_HASH_SALT: string;
  ACCESS_TOKEN_KEY: string;
};

const optionsToRequire = ['PORT', 'ACUBE_TOKEN', 'DATABASE_URL', 'PASS_HASH_SALT', 'ACCESS_TOKEN_KEY'];
export async function startServer(env: ServerOptions): Promise<number> {
  const checkAuth = getAuthMiddleware(env.ACCESS_TOKEN_KEY);
  // console.error('checking', env);
  for (const option of optionsToRequire) {
    if (!env[option]) {
      throw new Error(`${option} is not set`);
    }
  }
  const port = parseInt(env.PORT);
  const app = express();
  app.use(express.json());
  return new Promise((resolve, reject) => {
    app.get('/', async (_req, res) => {
      // await listOurEntities();
      await listOurInvoices(1, '1023290711');
      res.setHeader('Content-Type', 'text/plain');
      res.end('Let\'s Peppol!\n');
    });
    app.post('/token', async(req, res) => {
      const user = await checkPassHash(req.body.peppolId, req.body.password);
      if (user) {
        const token = await generateToken(user, env.ACCESS_TOKEN_KEY);
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    });
    app.post('/send', checkAuth, express.text({type: '*/*'}), async(req, res) => {
      console.log(req.headers);
      const sendingEntity = req.peppolId;
      console.log('sending entity', sendingEntity);
      console.log('Received XML:', req.body.length);
      const responseCode = await sendInvoice(req.body, sendingEntity);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      if (responseCode === 201 || responseCode === 202) {
        res.end(`Success (${responseCode} response from A-Cube component)\n`);
      } else {
        res.end(`Failure (${responseCode} response from A-Cube component)\n`);
      }
    });
    app.post('/reg', checkAuth, async (req, res) => {
      console.log(req.headers);
      const sendingEntity = req.peppolId;
      console.log('sending entity', sendingEntity);
      const responseCode = await register(sendingEntity);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      if (responseCode === 201 || responseCode === 202) {
        res.end(`Success (${responseCode} response from A-Cube)\n`);
      } else {
        res.end(`Failure (${responseCode} response from A-Cube)\n`);
      }
    });
    app.listen(port, (error) => {
      if (error) {
        reject(error);
      } else {
        console.log(`LetsPeppol listening on port ${port}`);
        resolve(0);
      }
    });
  });
}
