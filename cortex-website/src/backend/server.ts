import { EventBus, ActorSystem, CortexHttpServer } from 'cortex';
import * as path from 'path'; // Import path module
import * as fs from 'fs'; // Import fs module
import * as http from 'http'; // Import http module for types
import { fileURLToPath } from 'url'; // Import fileURLToPath for ES modules

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import config from './config.js'; // Import the config instance
import { BlogServiceActor } from './blog/blogServiceActor.js'; // Import BlogServiceActor

const eventBus = EventBus.getInstance();
const actorSystem = new ActorSystem(eventBus);
const server = new CortexHttpServer(config.get('port', 3000) as number); // Get port from config, default to 3000

// Initialize blog service actor
const blogService = new BlogServiceActor();
blogService.handle({ type: 'init-sample-data' }); // Initialize with sample data

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

// Blog API Endpoints
server.get('/api/blog/posts', async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    const response = await blogService.handle({
      type: 'search',
      query: {
        limit: 10,
        offset: 0,
      },
    });

    res.writeHead(response.success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Failed to fetch blog posts' }));
  }
});

server.get('/api/blog/search', async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    // Parse query parameters from URL
    const url = new URL(req.url || '', 'http://localhost');
    const searchQuery = url.searchParams.get('q') || '';
    const category = url.searchParams.get('category') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const response = await blogService.handle({
      type: 'search',
      query: {
        search: searchQuery,
        category: category as 'tutorial' | 'update' | 'guide' | 'all',
        limit,
        offset,
      },
    });

    res.writeHead(response.success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Failed to search blog posts' }));
  }
});

server.get('/api/blog/categories', async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    const response = await blogService.handle({
      type: 'categories',
    });

    res.writeHead(response.success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Failed to fetch categories' }));
  }
});

server.get('/api/blog/featured', async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const count = parseInt(url.searchParams.get('count') || '5', 10);

    const response = await blogService.handle({
      type: 'featured',
      count,
    });

    res.writeHead(response.success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Failed to fetch featured posts' }));
  }
});

export { server }; // Export the server instance