import express from 'express';
import { listOurEntities, sendInvoice, register } from './acube.js';

const users = JSON.parse(process.env.USERS || '{}');

function checkAuth(authorization: string): string | null {
  console.log(`Authorization string: "${authorization}"`);
  if (!authorization) return null;
  const token = authorization.replace('Bearer ', '');
  console.log('looking up token', token, users);
  return users[token] || null;
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
    app.post('/send', express.text({type: '*/*'}), async(req, res) => {
      console.log(req.headers);
      const sendingEntity = checkAuth(req.headers['authorization']);
      console.log('sending entity', sendingEntity);
      if (sendingEntity === null) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Unauthorized\n');
        return;
      }
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
    app.post('/reg', async (req, res) => {
      console.log(req.headers);
      const sendingEntity = checkAuth(req.headers['authorization']);
      console.log('sending entity', sendingEntity);
      if (sendingEntity === null) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Unauthorized\n');
        return;
      }
      console.log('req.body:', req.body);
      const responseCode = await register(req.body.identifier);
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
