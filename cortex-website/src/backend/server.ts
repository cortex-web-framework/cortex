import { EventBus, ActorSystem, CortexHttpServer } from 'cortex';
import * as path from 'path'; // Import path module
import * as fs from 'fs'; // Import fs module
import * as http from 'http'; // Import http module for types
import { fileURLToPath } from 'url'; // Import fileURLToPath for ES modules

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import config from './config.js'; // Import the config instance

const eventBus = EventBus.getInstance();
const actorSystem = new ActorSystem(eventBus);
const server = new CortexHttpServer(config.get('port', 3000) as number); // Get port from config, default to 3000

// Middleware for static file serving
server.use((req: http.IncomingMessage, res: http.ServerResponse, next: () => void) => {
  console.log(`[Static File Middleware] Request URL: ${req.url}`);
  const filePath = path.join(__dirname, '../../../public', req.url || '');
  console.log(`[Static File Middleware] Trying to serve file: ${filePath}`);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(`[Static File Middleware] File not found: ${filePath}, passing to next.`);
      next(); // File not found, pass to next middleware/route
    } else {
      console.log(`[Static File Middleware] Serving file: ${filePath}`);
      res.writeHead(200, { 'Content-Type': 'text/html' }); // Assuming HTML for now
      res.end(data);
    }
  });
});

// Define a basic /api route
server.get('/api/status', async (req: http.IncomingMessage, res: http.ServerResponse) => {
  res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
});

export { server }; // Export the server instance