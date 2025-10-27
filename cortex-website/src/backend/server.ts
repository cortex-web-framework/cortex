import { EventBus, ActorSystem, CortexHttpServer } from 'cortex';
import * as path from 'path'; // Import path module
import * as fs from 'fs'; // Import fs module
import * as http from 'http'; // Import http module for types
import { fileURLToPath } from 'url'; // Import fileURLToPath for ES modules

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import config from './config.js'; // Import the config instance
import { PersistentBlogServiceActor } from './blog/persistentBlogService.js'; // Import PersistentBlogServiceActor
import { FeatureActor } from './features/featureActor.js'; // Import FeatureActor
import { ExampleActor } from './examples/exampleActor.js'; // Import ExampleActor

const eventBus = EventBus.getInstance();
const actorSystem = new ActorSystem(eventBus);
const server = new CortexHttpServer(config.get('port', 3000) as number); // Get port from config, default to 3000

// Initialize service actors
const blogService = new PersistentBlogServiceActor(); // Now persists to file system

const featureActor = new FeatureActor();

const exampleActor = new ExampleActor();

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

// Features API Endpoints
server.get('/api/features', async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const category = url.searchParams.get('category');

    const response = await featureActor.handle({
      type: 'get-features',
      category: category || undefined,
    });

    res.writeHead(response.success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Failed to fetch features' }));
  }
});

server.get('/api/features/categories', async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    const response = await featureActor.handle({
      type: 'list-categories',
    });

    res.writeHead(response.success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Failed to fetch categories' }));
  }
});

// Examples API Endpoints
server.get('/api/examples', async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const category = url.searchParams.get('category');

    const response = await exampleActor.handle({
      type: 'get-examples',
      category: category as 'actor' | 'eventbus' | 'http' | 'resilience' | 'middleware' | undefined,
    });

    res.writeHead(response.success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Failed to fetch examples' }));
  }
});

server.get('/api/examples/categories', async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    const response = await exampleActor.handle({
      type: 'list-categories',
    });

    res.writeHead(response.success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Failed to fetch categories' }));
  }
});

server.get('/api/examples/run', async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const exampleId = url.searchParams.get('id');

    if (!exampleId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing example id' }));
      return;
    }

    const response = await exampleActor.handle({
      type: 'run-example',
      id: exampleId,
    });

    res.writeHead(response.success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Failed to run example' }));
  }
});

server.get('/api/examples/search', async (req: http.IncomingMessage, res: http.ServerResponse) => {
  try {
    const url = new URL(req.url || '', 'http://localhost');
    const query = url.searchParams.get('q') || '';

    const response = await exampleActor.handle({
      type: 'search',
      query,
    });

    res.writeHead(response.success ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Failed to search examples' }));
  }
});

export { server }; // Export the server instance