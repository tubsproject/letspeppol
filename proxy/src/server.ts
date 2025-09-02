import express from 'express';
import { checkPassHash, generateToken, checkBearerToken } from './db.js';
import { listOurEntities, sendInvoice, register } from './acube.js';

// express middleware for authentication
async function checkAuth(req, res, next): Promise<void> {
  const authorization = req.headers['authorization'];
  console.log(`Authorization string: "${authorization}"`);
  if (!authorization) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    const token = authorization.replace('Bearer ', '');
    const peppolId = await checkBearerToken(token);
    console.log('looked up token', token, peppolId);
    if (peppolId) {
      req.peppolId = peppolId;
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

export async function startServer(): Promise<void> {
  const port = process.env.PORT || 3000;
  const app = express();
  app.use(express.json());
  await new Promise((resolve, reject) => {
    app.get('/', async (_req, res) => {
      await listOurEntities();
      res.setHeader('Content-Type', 'text/plain');
      res.end('Let\'s Peppol!\n');
    });
    app.post('/token', async(req, res) => {
      const user = await checkPassHash(req.body.peppolId, req.body.password);
      if (user) {
        const token = await generateToken(user);
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
      const responseCode = await sendInvoice(req.body);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      if (responseCode === 201 || responseCode === 202) {
        res.end(`Success (${responseCode} response from A-Cube)\n`);
      } else {
        res.end(`Failure (${responseCode} response from A-Cube)\n`);
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
        console.log(`LetsPeppol listening on port ${port}`)
        resolve(void 0);
      }
    });
  });
}
