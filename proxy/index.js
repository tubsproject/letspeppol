import { createServer } from 'http';
import { sendInvoice } from './acube.js';

const users = JSON.parse(process.env.USERS || '{}');
function checkAuth(authorization) {
  if (!authorization) return null;
  const token = authorization.replace('Bearer ', '');
  console.log('looking up token', token, users);
  return users[token] || null;
}

const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/send') {
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
      await sendInvoice(xml);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Invoice sent\n');
    });
  } else if (req.url === '/') {
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
