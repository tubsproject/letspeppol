import { createServer } from 'http';
import { sendInvoice, register, listOurEntities } from './acube.js';

const users = JSON.parse(process.env.USERS || '{}');
function checkAuth(authorization) {
  if (!authorization) return null;
  const token = authorization.replace('Bearer ', '');
  console.log('looking up token', token, users);
  return users[token] || null;
}

const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/reg') {
    console.log(req.headers);
    const sendingEntity = checkAuth(req.headers['authorization']);
    console.log('sending entity', sendingEntity);
    if (sendingEntity === null) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Unauthorized\n');
      return;
    }
    const body = [];
    req.on('data', chunk => {
      body.push(chunk);
    });
    req.on('end', async () => {
      const identifier = Buffer.concat(body).toString();
      console.log('Received identifier:', identifier);
      const responseCode = await register(identifier);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      if (responseCode === 201 || responseCode === 202) {
        res.end(`Success (${responseCode} response from A-Cube)\n`);
      } else {
        res.end(`Failure (${responseCode} response from A-Cube)\n`);
      }
    });
  } else if (req.method === 'POST' && req.url === '/send') {
    console.log(req.headers);
    const sendingEntity = checkAuth(req.headers['authorization']);
    console.log('sending entity', sendingEntity);
    if (sendingEntity === null) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Unauthorized\n');
      return;
    }
    const body = [];
    req.on('data', chunk => {
      body.push(chunk);
    });
    req.on('end', async () => {
      const xml = Buffer.concat(body).toString();
      console.log('Received XML:', xml.length);
      const responseCode = await sendInvoice(xml);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      if (responseCode === 201 || responseCode === 202) {
        res.end(`Success (${responseCode} response from A-Cube)\n`);
      } else {
        res.end(`Failure (${responseCode} response from A-Cube)\n`);
      }
    });
  } else if (req.url === '/') {
    await listOurEntities();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Let\'s Peppol!\n');
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found\n');
  }
});
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
