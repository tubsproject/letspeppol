import express from 'express';
import cors from 'cors';
import { checkBearerToken } from './auth.js';
import { Acube } from './acube.js';
import { Peppyrus } from './peppyrus.js';
import rateLimit from 'express-rate-limit';
import { Backend } from './Backend.js';
import { Scrada } from './scrada.js';

function getAuthMiddleware(secretKey: string) {
  return async function checkAuth(req, res, next): Promise<void> {
    const authorization = req.headers['authorization'];
    if (!authorization) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const token = authorization.replace('Bearer ', '');
      try {
        const peppolId = await checkBearerToken(token, secretKey);
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
  PEPPYRUS_TOKEN_TEST: string;
  ACCESS_TOKEN_KEY: string;
};

const optionsToRequire = ['PORT', 'ACUBE_TOKEN', 'PEPPYRUS_TOKEN_TEST', 'ACCESS_TOKEN_KEY'];
export async function startServer(env: ServerOptions): Promise<number> {
  const checkAuth = getAuthMiddleware(env.ACCESS_TOKEN_KEY);
  // console.error('checking', env);
  for (const option of optionsToRequire) {
    if (!env[option]) {
      throw new Error(`${option} is not set`);
    }
  }
  const backends = {
    acube: new Acube(),
    peppyrus: new Peppyrus(),
    scrada: new Scrada(),
  };
  function getBackend(): Backend {
    return backends[process.env.BACKEND || 'peppyrus'];
  }
  const backend = getBackend();

  async function hello (_req, res) {
    // await getUuid('1023290711');
    // await listEntityDocuments({ peppolId: '1023290711', direction: 'incoming', type: 'invoices', query: {} });
    // await listEntityDocuments({ peppolId: '0705969661', direction: 'incoming', type: 'credit-notes', query: {} });
    res.setHeader('Content-Type', 'text/plain');
    res.end('Let\'s Peppol!\n');
  }
  async function list (req, res) {
    const documents = await backend.listEntityDocuments({ peppolId: req.peppolId, direction: req.params.direction, type: req.params.docType, query: req.query });
    res.setHeader('Content-Type', 'application/json');
    res.json(documents);
  }
  async function listV1 (req, res) {
    const documents = await backend.listEntityDocuments({ peppolId: req.peppolId, direction: req.params.direction, type: req.params.docType, query: req.query, apiVersion: 'v1' });
    res.setHeader('Content-Type', 'application/json');
    res.json(documents);
  }
  async function get (req, res) {
    const xml = await backend.getDocumentXml({ peppolId: req.peppolId, type: req.params.docType, uuid: req.params.uuid });
    res.setHeader('Content-Type', 'text/xml');
    res.send(xml);
  }
  async function send (req, res) {
    const sendingEntity = req.peppolId;
    await backend.sendDocument(req.body, sendingEntity);
    res.end('OK\n');
  }
  async function reg (req, res) {
    const sendingEntity = req.peppolId;
    console.log('Registering', sendingEntity);
    await backend.reg(sendingEntity);
    res.end('OK\n');
  }
  async function unreg (req, res) {
    const sendingEntity = req.peppolId;
    await backend.unreg(sendingEntity);
    res.end('OK\n');
  }
  const port = parseInt(env.PORT);
  const app = express();
  app.use(cors({ origin: true })); // Reflect (enable) the requested origin in the CORS response
  // Apply rate limiting to all requests
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
    app.get('/v1/', hello);
    app.get('/v1/:docType/:direction', checkAuth, listV1);
    app.get('/v1/:docType/:direction/:uuid', checkAuth, get);
    app.post('/v1/send', checkAuth, express.text({type: '*/*'}), send);
    app.post('/v1/reg', checkAuth, reg);
    app.post('/v1/unreg', checkAuth, unreg);

    app.get('/', hello);
    app.get('/:docType/:direction', checkAuth, list);
    app.get('/:docType/:direction/:uuid', checkAuth, get);
    app.post('/send', checkAuth, express.text({type: '*/*'}), send);
    app.post('/reg', checkAuth, reg);
    app.post('/unreg', checkAuth, unreg);


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
