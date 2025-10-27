// Core framework exports
export * from './core/actorSystem.js';
export * from './core/eventBus.js';
export * from './core/logger.js';
export * from './core/config.js';
export * from './core/httpServer.js';
export * from './core/errors.js';
export * from './core/middleware.js';
export * from './core/container.js';

// Neurons exports
export * from './neurons/pingNeuron.js';
export * from './neurons/pongNeuron.js';

// API exports
export * from './api/graphql.js';
export * from './api/grpc.js';

// Observability exports
export * from './observability/index.js';

// Resilience exports
export * from './resilience/circuitBreaker.js';
export * from './resilience/retryExecutor.js';
export * from './resilience/bulkhead.js';
export * from './resilience/timeout.js';
export * from './resilience/compositePolicy.js';
export * from './resilience/errors.js';
export * from './resilience/types.js';

// Performance exports
export * from './performance/compression.js';
export * from './performance/httpCache.js';

// Security exports
export * from './security/csp.js';
export * from './security/rateLimiter.js';

// Workers exports
export * from './workers/workerActor.js';
export * from './workers/workerPool.js';

// Web3 exports
export * from './web3/smartContracts.js';
export * from './web3/ipfs.js';

// WebAssembly exports
export * from './wasm/memoryManager.js';
export * from './wasm/utils.js';

// CLI exports
export * from './cli/index.js';

// Entry point for demo/testing
import { EventBus } from './core/eventBus.js';
import { ActorSystem } from './core/actorSystem.js';
import { CortexHttpServer } from './core/httpServer.js';
import { PingNeuron } from './neurons/pingNeuron.js';
import { PongNeuron } from './neurons/pongNeuron.js';
import { Config } from './core/config.js';
import * as http from 'node:http';

async function main(): Promise<void> {
  console.log('Starting Cortex Framework...');

  const config = Config.getInstance();
  const port: number = config.get<number>('app.port', 3000)!;

  const eventBus = EventBus.getInstance();
  const actorSystem = new ActorSystem(eventBus);

  actorSystem.createActor(PingNeuron, 'pingActor', eventBus);
  actorSystem.createActor(PongNeuron, 'pongActor', eventBus);

  const httpServer = new CortexHttpServer(port);

  httpServer.get('/ping', async (_req: http.IncomingMessage, res: http.ServerResponse) => {
    console.log('Received /ping request. Dispatching start message to PingNeuron.');
    await actorSystem.dispatch('pingActor', { type: 'start' });
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Ping dispatched!');
  });

  await httpServer.start();
  console.log(`HTTP Server listening on port ${port}`);

  process.on('SIGINT', async () => {
    console.log('Stopping HTTP Server...');
    await httpServer.stop();
    console.log('HTTP Server stopped.');
    process.exit(0);
  });
}

main().catch(console["error"]);
