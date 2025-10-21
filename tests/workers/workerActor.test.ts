import { test } from 'node:test';
import assert from 'node:assert';
import { WorkerActor } from '../../src/workers/workerActor';
import { ActorSystem } from '../../src/core/actorSystem';

// Mock ActorSystem for WorkerActor constructor
class MockActorSystem extends ActorSystem {
  constructor() {
    // @ts-ignore
    super(null); // Pass null for EventBus as it's not used in this test
  }
  public handleFailure(actor: any, error: any): void {
    console.error('MockActorSystem: Actor failed', actor.id, error);
  }
}

// Mock the Worker class
class MockWorker {
  public onmessage: ((e: MessageEvent) => void) | null = null;
  public onerror: ((e: ErrorEvent) => void) | null = null;
  public postedMessages: any[] = [];
  public terminated: boolean = false;

  constructor(_url: string | URL, _options?: WorkerOptions) {}

  postMessage(message: any, _transfer?: Transferable[]): void {
    this.postedMessages.push(message);
    // Simulate worker response for init message
    if (message.type === 'init' && this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: { type: 'initialized', actorId: message.actorId } }));
    }
  }

  terminate(): void {
    this.terminated = true;
  }
}

// @ts-ignore
global.Worker = MockWorker;

test('WorkerActor should initialize and post init message to worker', async () => {
  const mockSystem = new MockActorSystem();
  const actor = new WorkerActor('test-actor-1', mockSystem);

  // @ts-ignore
  const mockWorkerInstance = actor['worker'] as MockWorker;
  assert.strictEqual(mockWorkerInstance.postedMessages.length, 1, 'Should post one message to worker');
  assert.deepStrictEqual(mockWorkerInstance.postedMessages[0].type, 'init', 'First message should be init type');
  assert.deepStrictEqual(mockWorkerInstance.postedMessages[0].actorId, 'test-actor-1', 'Init message should contain actorId');
  assert.ok(mockWorkerInstance.onmessage, 'onmessage handler should be set');
  assert.ok(mockWorkerInstance.onerror, 'onerror handler should be set');
});

test('WorkerActor should post messages to worker', async () => {
  const mockSystem = new MockActorSystem();
  const actor = new WorkerActor('test-actor-2', mockSystem);
  const message = { type: 'data', payload: 123 };

  actor.receive(message);

  // @ts-ignore
  const mockWorkerInstance = actor['worker'] as MockWorker;
  assert.strictEqual(mockWorkerInstance.postedMessages.length, 2, 'Should post two messages to worker (init + data)');
  assert.deepStrictEqual(mockWorkerInstance.postedMessages[1].type, 'message', 'Second message should be message type');
  assert.deepStrictEqual(mockWorkerInstance.postedMessages[1].message, message, 'Second message should contain the correct payload');
});

test('WorkerActor should terminate worker on postStop', async () => {
  const mockSystem = new MockActorSystem();
  const actor = new WorkerActor('test-actor-3', mockSystem);

  actor.postStop();

  // @ts-ignore
  const mockWorkerInstance = actor['worker'] as MockWorker;
  assert.strictEqual(mockWorkerInstance.terminated, true, 'Worker should be terminated');
});

test('WorkerActor with Wasm support should pass wasmModuleUrl to worker', async () => {
  const mockSystem = new MockActorSystem();
  const wasmUrl = 'http://localhost/my.wasm';
  const actor = new WorkerActor('test-actor-4', mockSystem, wasmUrl);

  // @ts-ignore
  const mockWorkerInstance = actor['worker'] as MockWorker;
  assert.strictEqual(mockWorkerInstance.postedMessages.length, 1, 'Should post one message to worker');
  assert.deepStrictEqual(mockWorkerInstance.postedMessages[0].type, 'init', 'First message should be init type');
  assert.deepStrictEqual(mockWorkerInstance.postedMessages[0].wasmModuleUrl, wasmUrl, 'Init message should contain wasmModuleUrl');
});
