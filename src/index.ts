import { EventBus } from './core/eventBus';
import { ActorSystem } from './core/actorSystem';
import { CortexHttpServer } from './core/httpServer';
import { PingNeuron } from './neurons/pingNeuron';
import { PongNeuron } from './neurons/pongNeuron';
import { Config } from './core/config';
import http from 'node:http'; // Import http for IncomingMessage and ServerResponse types

async function main(): Promise<void> {
  console.log('Starting Cortex Framework...');

  const config = Config.getInstance();
  const port: number = config.get<number>('app.port', 3000)!; // Non-null assertion as default is provided

  // 1. Get the EventBus instance
  const eventBus = EventBus.getInstance();

  // 2. Create an ActorSystem instance
  const actorSystem = new ActorSystem(eventBus);

  // 3. Create instances of PingNeuron and PongNeuron
  actorSystem.createActor(PingNeuron, 'pingActor', eventBus);
  actorSystem.createActor(PongNeuron, 'pongActor', eventBus);

  // 4. Create an HttpServer instance
  const httpServer = new CortexHttpServer(port);

  // 5. Define a simple GET route for the HttpServer
  httpServer.get('/ping', async (_req: http.IncomingMessage, res: http.ServerResponse) => {
    console.log('Received /ping request. Dispatching start message to PingNeuron.');
    await actorSystem.dispatch('pingActor', { type: 'start' });
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Ping dispatched!');
  });

  // 6. Start the HttpServer
  await httpServer.start();
  console.log(`HTTP Server listening on port ${port}`);

  // Example of how to stop the server (e.g., on process exit)
  process.on('SIGINT', async () => {
    console.log('Stopping HTTP Server...');
    await httpServer.stop();
    console.log('HTTP Server stopped.');
    process.exit(0);
  });
}

main().catch(console.error);
