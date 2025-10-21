import { test } from 'node:test';
import assert from 'node:assert';
import { GrpcServer, GrpcClient, defineProto, generateGrpcCode } from '../../src/api/grpc';
import * as http from 'node:http';

// Mock http.Server for GrpcServer testing
class MockHttpServer {
  public listenCalled: boolean = false;
  public closeCalled: boolean = false;
  public port: number = 0;
  private _listenCallback: (() => void) | null = null;
  private _requestListener: http.RequestListener | undefined;

  constructor(requestListener?: http.RequestListener) {
    this._requestListener = requestListener;
  }

  listen(port?: number, callback?: (() => void)): this {
    this.listenCalled = true;
    this.port = port || 0;
    this._listenCallback = callback || null;
    if (this._listenCallback) {
      this._listenCallback();
    }
    return this;
  }

  close(callback?: (err?: Error) => void): this {
    this.closeCalled = true;
    if (callback) {
      callback();
    }
    return this;
  }

  // Simulate a request for testing
  simulateRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    if (this._requestListener) {
      this._requestListener(req, res);
    }
  }
}

// @ts-ignore
const originalCreateServer = http.createServer;
// @ts-ignore
http.createServer = (requestListener?: http.RequestListener) => new MockHttpServer(requestListener);

test('GrpcServer should start and stop', async () => {
  const server = new GrpcServer();
  const port = 50051;

  await server.start(port);
  // @ts-ignore
  assert.strictEqual(server['server'].listenCalled, true, 'Server listen should be called');
  // @ts-ignore
  assert.strictEqual(server['server'].port, port, 'Server should listen on the correct port');

  await server.stop();
  // @ts-ignore
  assert.strictEqual(server['server'].closeCalled, true, 'Server close should be called');
});

test('GrpcServer should add a service', () => {
  const server = new GrpcServer();
  const serviceDefinition = { name: 'MyService' };
  const serviceImplementation = { myMethod: () => {} };

  server.addService(serviceDefinition, serviceImplementation);
  // @ts-ignore
  assert.ok(server['services'].has('MyService'), 'Service should be added to the map');
});

test('GrpcClient should call a method and return a simulated response', async () => {
  const serviceDefinition = { name: 'MyService' };
  const address = 'localhost:50051';
  const client = new GrpcClient(serviceDefinition, address);

  const methodName = 'myMethod';
  const request = { id: 1 };

  const response = await client.callMethod(methodName, request);

  assert.deepStrictEqual(response, { message: `Response from ${methodName}` }, 'Should return simulated response');
});

test('defineProto should log proto content', () => {
  const protoContent = 'syntax = "proto3"; package mypackage; message MyMessage {}';
  const consoleSpy = test.mock.method(console, 'log');

  const result = defineProto(protoContent);

  assert.ok((consoleSpy as any).calledWith('Defining .proto content (manual step):', protoContent), 'console.log should be called with proto content');
  assert.deepStrictEqual(result, { name: 'ManualProtoDefinition', content: protoContent }, 'Should return a manual proto definition object');
  (consoleSpy as any).restore();
});

test('generateGrpcCode should log proto definition', () => {
  const protoDefinition = { name: 'ManualProtoDefinition', content: '...' };
  const consoleSpy = test.mock.method(console, 'log');

  const result = generateGrpcCode(protoDefinition);

  assert.ok((consoleSpy as any).calledWith('Generating gRPC code (manual step) for:', protoDefinition), 'console.log should be called with proto definition');
  assert.deepStrictEqual(result, { client: 'GeneratedClient', server: 'GeneratedServer' }, 'Should return generated client and server placeholders');
  (consoleSpy as any).restore();
});

test.after(() => {
  // Restore original http.createServer after all tests are done
  // @ts-ignore
  http.createServer = originalCreateServer;
});
