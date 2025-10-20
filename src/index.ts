import { EventBus } from './core/eventBus';
import { ActorSystem } from './core/actorSystem';
import { CortexHttpServer } from './core/httpServer';
import { PingNeuron } from './neurons/pingNeuron';
import { PongNeuron } from './neurons/pongNeuron';

const PORT = 3000; // Or any other suitable port

async function main() {
  console.log('Starting Cortex Framework...');

  // 1. Get the EventBus instance
  const eventBus = EventBus.getInstance();

  // 2. Create an ActorSystem instance
  const actorSystem = new ActorSystem(eventBus);

  // 3. Create instances of PingNeuron and PongNeuron
  const pingNeuron = actorSystem.createActor(PingNeuron, 'pingActor', eventBus);
  const pongNeuron = actorSystem.createActor(PongNeuron, 'pongActor', eventBus);

  // 4. Create an HttpServer instance
  const httpServer = new CortexHttpServer(PORT);

  // 5. Define a simple GET route for the HttpServer
  httpServer.get('/ping', async (req, res) => {
    console.log('Received /ping request. Dispatching start message to PingNeuron.');
    await actorSystem.dispatch('pingActor', { type: 'start' });
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Ping dispatched!');
  });

  // 6. Start the HttpServer
  await httpServer.start();
  console.log(`HTTP Server listening on port ${PORT}`);

  // Example of how to stop the server (e.g., on process exit)
  process.on('SIGINT', async () => {
    console.log('Stopping HTTP Server...');
    await httpServer.stop();
    console.log('HTTP Server stopped.');
    process.exit(0);
  });
}

main().catch(console.error);
