import 'dotenv/config';
import { startServer, ServerOptions } from './server.js';

// ...
startServer(process.env as unknown as ServerOptions);
