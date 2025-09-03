import 'dotenv/config';
import { startServer } from './server.js';

if (!process.env.ACUBE_TOKEN) {
  console.error('ACUBE_TOKEN is not set');
  process.exit(1);
}

// ...
startServer();
