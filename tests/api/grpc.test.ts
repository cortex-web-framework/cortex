import { test } from 'node:test';
import assert from 'node:assert';
import { GrpcServer } from '../../src/api/grpc.js';

test('GrpcServer should start and stop', async () => {
  const server = new GrpcServer();
  // Use a random port to avoid conflicts when tests run in parallel
  const port = 9000 + Math.floor(Math.random() * 1000);
  await server.start(port);
  await server.stop();
  // Give the server time to fully close before proceeding
  await new Promise(resolve => setTimeout(resolve, 10));
});