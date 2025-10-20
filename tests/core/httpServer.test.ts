import { test } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

import { CortexHttpServer } from '../../src/core/httpServer';

const PORT = 8080;

// Helper function to make a request to the server
function makeRequest(path: string, method: string = 'GET', port: number = PORT): Promise<{ data: string, statusCode: number | undefined }> {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: path,
      method: method,
      agent: false, // Use a new agent for each request to prevent connection reuse issues
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ data, statusCode: res.statusCode });
      });
    });
    req.on('error', (e) => reject(e));
    req.end();
  });
}

// Test for starting and stopping the server
test('CortexHttpServer should start and stop', async () => {
  const server = new CortexHttpServer(PORT);
  await server.start();
  assert.ok(server.isRunning(), 'Server should be running after start');
  await server.stop();
  assert.ok(!server.isRunning(), 'Server should not be running after stop');
});

// Test for 404 for unknown routes
test('CortexHttpServer should return 404 for unknown routes', async () => {
  const server = new CortexHttpServer(PORT);
  await server.start();
  try {
    const { statusCode } = await makeRequest('/unknown');
    assert.strictEqual(statusCode, 404, 'Response for unknown route should be 404');
  } finally {
    await server.stop();
  }
});

// Test for routing to a specific path and method
test('CortexHttpServer should route to a specific path and method', async () => {
  const server = new CortexHttpServer(PORT);
  let handlerCalled = false;
  server.get('/test', (req: http.IncomingMessage, res: http.ServerResponse) => {
    handlerCalled = true;
    res.end('OK');
  });
  await server.start();
  try {
    const { data, statusCode } = await makeRequest('/test');
    assert.strictEqual(statusCode, 200, 'Handler should return 200');
    assert.strictEqual(data, 'OK', 'Handler should return OK');
    assert.ok(handlerCalled, 'Handler should have been called');
  } finally {
    await server.stop();
  }
});

// Test to ensure the route handler's callback is triggered
test('CortexHttpServer should trigger the route handler callback', async () => {
  const server = new CortexHttpServer(PORT);
  let callbackTriggered = false;
  const mockCallback = () => { callbackTriggered = true; };
  server.get('/callback-test', (req: http.IncomingMessage, res: http.ServerResponse) => {
    mockCallback();
    res.end('Callback OK');
  });
  await server.start();
  try {
    await makeRequest('/callback-test');
    assert.ok(callbackTriggered, 'Callback should have been triggered');
  } finally {
    await server.stop();
  }
});

// Test for routing to a specific POST path and method
test('CortexHttpServer should route to a specific POST path and method', async () => {
  const server = new CortexHttpServer(PORT + 1); // Use a different port to avoid conflicts
  let handlerCalled = false;
  server.post('/post-test', (req: http.IncomingMessage, res: http.ServerResponse) => {
    handlerCalled = true;
    res.end('POST OK');
  });
  await server.start();
  try {
    const { data, statusCode } = await makeRequest('/post-test', 'POST', PORT + 1);
    assert.strictEqual(statusCode, 200, 'POST handler should return 200');
    assert.strictEqual(data, 'POST OK', 'POST handler should return POST OK');
    assert.ok(handlerCalled, 'POST handler should have been called');
  } finally {
    await server.stop();
  }
});