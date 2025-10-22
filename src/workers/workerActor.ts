import { Actor, ActorSystem } from '../core/actorSystem.js';

// This will be the content of the worker file
const workerCode = `
  import { loadWasmModule, instantiateWasmModule } from './wasmUtils.js'; // Assuming wasmUtils.js is accessible

  let actorInstance;
  let wasmInstance: WebAssembly.Instance | undefined;

  self.onmessage = async (e) => {
    const { type, message, actorId, system, wasmModuleUrl } = e.data;

    if (type === 'init') {
      console.log(\`Worker initialized for actor \${actorId}\`);
      if (wasmModuleUrl) {
        try {
          const wasmModule = await loadWasmModule(wasmModuleUrl);
          wasmInstance = await instantiateWasmModule(wasmModule);
          console.log(\`Wasm module loaded and instantiated for actor \${actorId}\`);
        } catch (error) {
          console.error(\`Failed to load Wasm module for actor \${actorId}:\`, error);
        }
      }
      // In a real scenario, you'd dynamically load the actor class
      // For now, we'll assume the actor class is available globally or passed
      // This is a simplified representation.
      // actorInstance = new ActorClass(actorId, system);
    } else if (type === 'message') {
      if (actorInstance && actorInstance.receive) {
        actorInstance.receive(message);
      } else if (wasmInstance && wasmInstance.exports.receive) { // Assuming a 'receive' export in Wasm
        // Example: calling a Wasm function
        const result = (wasmInstance.exports.receive as Function)(message);
        self.postMessage({ type: 'wasm_result', result });
      } else {
        console.warn(\`Actor instance or Wasm receive method not ready for \${actorId}\`);
      }
    }
  };
`;

const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(workerBlob);

export class WorkerActor extends Actor {
  private worker: Worker;

  constructor(id: string, system: ActorSystem, wasmModuleUrl?: string) {
    super(id, system);
    this.worker = new Worker(workerUrl);
    this.worker.postMessage({ type: 'init', actorId: this.id, system: 'TODO: Pass a proxy for ActorSystem', wasmModuleUrl });

    this.worker.onmessage = (e) => {
      // Handle messages from the worker if needed
      console.log(`Message from worker for ${this.id}:`, e.data);
    };

    this.worker.onerror = (error) => {
      console.error(`Worker error for ${this.id}:`, error);
      // Potentially handle failure via actor system
      // this.system.handleFailure(this, error);
    };
  }

  public receive(message: any): void {
    // Messages sent to WorkerActor are forwarded to the actual worker
    this.worker.postMessage({ type: 'message', message });
  }

  public postStop(): void {
    this.worker.terminate();
    super.postStop();
  }
}
