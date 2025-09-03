import 'dotenv/config';
import { startServer, ServerOptions } from './server.js';

// ...
const exitCode = await startServer(process.env as unknown as ServerOptions);
process.exit(exitCode);
