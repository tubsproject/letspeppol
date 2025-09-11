import express from 'express';
import cors from 'cors';
import { checkBearerToken } from './auth.js';
import { Acube } from './acube.js';
import { Peppyrus } from './peppyrus.js';
import rateLimit from 'express-rate-limit';
import { Backend } from './Backend.js';

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
  const backends = {
    acube: new Acube(),
    peppyrus: new Peppyrus()
  };
  function getBackend(): Backend {
    return backends['acube'];
  }
  const backend = getBackend();
  const port = parseInt(env.PORT);
  const app = express();
  app.use(cors());
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
    app.get('/', async (_req, res) => {
      // await getUuid('1023290711');
      // await listEntityDocuments({ peppolId: '1023290711', direction: 'incoming', type: 'invoices', query: {} });
      // await listEntityDocuments({ peppolId: '0705969661', direction: 'incoming', type: 'credit-notes', query: {} });
      res.setHeader('Content-Type', 'text/plain');
      res.end('Let\'s Peppol!\n');
    });
    app.get('/:docType/:direction', checkAuth, async (req, res) => {
      const documents = await backend.listEntityDocuments({ peppolId: req.peppolId, direction: req.params.direction, type: req.params.docType, query: req.query });
      res.setHeader('Content-Type', 'application/json');
      res.json(documents);
    });
    app.get('/:docType/:direction/:uuid', checkAuth, async (req, res) => {
      const xml = await backend.getDocumentXml({ peppolId: req.peppolId, type: req.params.docType, uuid: req.params.uuid });
      res.setHeader('Content-Type', 'text/xml');
      res.send(xml);
    });
    app.post('/send', checkAuth, express.text({type: '*/*'}), async(req, res) => {
      const sendingEntity = req.peppolId;
      await backend.sendDocument(req.body, sendingEntity);
      res.end('OK\n');
    });
    app.post('/reg', checkAuth, async (req, res) => {
      const sendingEntity = req.peppolId;
      await backend.reg(sendingEntity);
      res.end('OK\n');
    });
    app.post('/unreg', checkAuth, async (req, res) => {
      const sendingEntity = req.peppolId;
      await backend.unreg(sendingEntity);
      res.end('OK\n');
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
