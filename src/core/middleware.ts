import * as http from 'node:http';

type NextFunction = () => void;

export const jsonBodyParser: (options?: { limit?: string | number }) => (req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction) => void = (options = {}) => {
  const limit = options.limit || '1mb'; // Default limit

  return (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
        // Basic limit check (can be more sophisticated)
        if (body.length > (typeof limit === 'string' ? parseInt(limit) : limit)) {
          res.writeHead(413, { 'Content-Type': 'text/plain' });
          res.end('Payload Too Large');
          req.destroy();
          return;
        }
      });

      req.on('end', () => {
        try {
          (req as any).body = JSON.parse(body);
          next();
        } catch (error) {
          console["error"]('JSON Body Parser Error:', error);
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Bad Request: Invalid JSON');
        }
      });

      req.on('error', (error) => {
        console["error"]('Request stream error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
    } else {
      next();
    }
  };
};