import express from 'express';
import { checkPassHash } from './db.js';
import { generateToken, checkBearerToken } from './auth.js';
import { sendInvoice, createLegalEntity, getUuid, listOurInvoices, unreg, getInvoiceXml } from './acube.js';
import rateLimit from 'express-rate-limit';
void getUuid;

function getAuthMiddleware(secretKey: string) {
  return async function checkAuth(req, res, next): Promise<void> {
    const authorization = req.headers['authorization'];
    console.log(`Authorization string: "${authorization}"`);
    if (!authorization) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const token = authorization.replace('Bearer ', '');
      try {
        const peppolId = await checkBearerToken(token, secretKey);
        console.log('looked up token', token, peppolId);
        req.peppolId = peppolId;
        next();
      } catch (err: { message: string } | any) {
        console.error('Error verifying token:', err);
        res.status(401).json({ error: err.message });
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
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: {
      status: 429,
      error: 'Too many requests, please try again later.',
    },
    headers: true, // Include rate limit info in response headers
  }));
  app.use(express.json());
  return new Promise((resolve, reject) => {
    app.get('/', async (_req, res) => {
      // await getUuid('1023290711');
      await listOurInvoices(1, '1023290711');
      await listOurInvoices(1, '0705969661');
      res.setHeader('Content-Type', 'text/plain');
      res.end('Let\'s Peppol!\n');
    });
    app.get('/incoming', checkAuth, async (req, res) => {
      const invoices = await listOurInvoices(1, req.peppolId);
      res.setHeader('Content-Type', 'application/json');
      res.json(invoices);
    });
    app.get('/incoming/:uuid', checkAuth, async (req, res) => {
      const xml = await getInvoiceXml(req.peppolId, req.params.uuid);
      res.setHeader('Content-Type', 'text/xml');
      res.send(xml);
    });
    // Apply a stricter limit on login attempts
    const loginLimiter = rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 5, // Limit each IP to 5 login requests per `window`
      message: 'Too many login attempts. Please try again in 5 minutes.',
    });
    app.post('/token', loginLimiter, async(req, res) => {
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
      const responseCode = await createLegalEntity(sendingEntity);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      if (responseCode === 201 || responseCode === 202) {
        res.end(`Success (${responseCode} response from A-Cube)\n`);
      } else {
        res.end(`Failure (${responseCode} response from A-Cube)\n`);
      }
    });
    app.post('/unreg', checkAuth, async (req, res) => {
      console.log(req.headers);
      const sendingEntity = req.peppolId;
      console.log('sending entity', sendingEntity);
      const responseCode = await unreg(sendingEntity);
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
