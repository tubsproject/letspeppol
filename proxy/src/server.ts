import express from 'express';
import { checkBearerToken } from './auth.js';
import { sendDocument, reg, unreg, getUuid, listEntityDocuments, getDocumentXml } from './acube.js';
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
  ACCESS_TOKEN_KEY: string
};

const optionsToRequire = ['PORT', 'ACUBE_TOKEN', 'ACCESS_TOKEN_KEY'];
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
      // await listEntityDocuments({ peppolId: '1023290711', direction: 'incoming', type: 'invoices', query: {} });
      // await listEntityDocuments({ peppolId: '0705969661', direction: 'incoming', type: 'credit-notes', query: {} });
      res.setHeader('Content-Type', 'text/plain');
      res.end('Let\'s Peppol!\n');
    });
    app.get('/documents/:direction/:docType', checkAuth, async (req, res) => {
      const documents = await listEntityDocuments({ peppolId: req.peppolId, direction: req.params.direction, type: req.params.docType, query: req.query });
      res.setHeader('Content-Type', 'application/json');
      res.json(documents);
    });
    app.get('/documents/:direction/:docType/:uuid', checkAuth, async (req, res) => {
      const xml = await getDocumentXml({ peppolId: req.peppolId, direction: req.params.direction, type: req.params.docType, uuid: req.params.uuid });
      res.setHeader('Content-Type', 'text/xml');
      res.send(xml);
    });
    app.post('/send', checkAuth, express.text({type: '*/*'}), async(req, res) => {
      console.log(req.headers);
      const sendingEntity = req.peppolId;
      console.log('sending entity', sendingEntity);
      console.log('Received XML:', req.body.length);
      const responseCode = await sendDocument(req.body, sendingEntity);
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
      console.log('/reg', sendingEntity);
      const responseCode = await reg(sendingEntity);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      if (responseCode === 200) {
        res.end(`Success (${responseCode} response from A-Cube)\n`);
      } else {
        res.end(`Failure (${responseCode} response from A-Cube)\n`);
      }
    });
    app.post('/unreg', checkAuth, async (req, res) => {
      console.log(req.headers);
      const sendingEntity = req.peppolId;
      console.log('/unreg', sendingEntity);
      const responseCode = await unreg(sendingEntity);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      if (responseCode === 200) {
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
