import { test } from 'node:test';
import assert from 'node:assert';
import { GrpcServer } from '../../src/api/grpc.js';

test('GrpcServer should start and stop', async () => {
  const server = new GrpcServer();
  await server.start(8080);
  await server.stop();
});