import http from 'node:http';
import { Socket } from 'node:net';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type RouteHandler = (req: http.IncomingMessage, res: http.ServerResponse) => void;

interface Route {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
}

export class CortexHttpServer {
  private server: http.Server;
  private port: number;
  private routes: Route[] = [];
  private running: boolean = false;
  private connections: Set<Socket>; // Track active connections

  constructor(port: number) {
    this.port = port;
    this.connections = new Set();
    this.server = http.createServer(this.requestListener.bind(this));

    // Track connections for graceful shutdown
    this.server.on('connection', (socket) => {
      this.connections.add(socket);
      socket.on('close', () => this.connections.delete(socket));
    });
  }

  private requestListener(req: http.IncomingMessage, res: http.ServerResponse): void {
    const handler = this.findHandler(req.method as HttpMethod, req.url || '/');

    if (handler) {
      handler(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }

  private findHandler(method: HttpMethod, path: string): RouteHandler | undefined {
    for (const route of this.routes) {
      if (route.method === method && route.path === path) {
        return route.handler;
      }
    }
    return undefined;
  }

  public get(path: string, handler: RouteHandler): void {
    this.routes.push({ method: 'GET', path, handler });
  }

  public post(path: string, handler: RouteHandler): void {
    this.routes.push({ method: 'POST', path, handler });
  }

  // Add other HTTP methods as needed

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        this.running = true;
        resolve();
      });
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.running) {
        return resolve();
      }

      // Destroy all active connections
      for (const socket of this.connections) {
        socket.destroy();
      }
      this.connections.clear();

      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.running = false;
          resolve();
        }
      });
    });
  }

  public isRunning(): boolean {
    return this.running;
  }
}