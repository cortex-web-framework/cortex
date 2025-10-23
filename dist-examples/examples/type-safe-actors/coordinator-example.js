/**
 * Coordinator/Fan-Out-Fan-In Pattern Example
 *
 * Demonstrates coordinating multiple worker actors
 */
import { TypeSafeActor, createTypeSafeActorSystem, } from '../../src/core/typeSafeActorSystem.js';
// Worker implementation
class WorkerActor extends TypeSafeActor {
    receive(message) {
        if (message.type === 'work') {
            // Simulate work
            const result = message.data * 2;
            this.state.processed++;
            console.log(`[${this.state.name}] Processed task ${message.taskId}: ${message.data} → ${result}`);
            // Send result back to coordinator
            const coordinator = this.system.getActor('coordinator');
            if (coordinator) {
                coordinator.postMessage({
                    type: 'work-complete',
                    taskId: message.taskId,
                    workerId: this.getId(),
                    result,
                });
            }
        }
        else if (message.type === 'shutdown') {
            console.log(`[${this.state.name}] Shutting down (processed: ${this.state.processed})`);
        }
    }
}
// Coordinator implementation
class CoordinatorActor extends TypeSafeActor {
    constructor() {
        super(...arguments);
        this.workerIds = ['worker-1', 'worker-2', 'worker-3'];
    }
    receive(message) {
        switch (message.type) {
            case 'start-task':
                this.startTask(message.taskId, message.data);
                break;
            case 'work-complete':
                this.recordResult(message.taskId, message.workerId, message.result);
                break;
            case 'stats':
                this.printStats();
                break;
        }
    }
    startTask(taskId, data) {
        console.log(`\n📋 Starting task ${taskId} with ${data.length} items`);
        this.state.activeWork.set(taskId, []);
        // Fan-out: send work to workers
        data.forEach((item, index) => {
            const workerId = this.workerIds[index % this.workerIds.length];
            const worker = this.system.getActor(workerId);
            if (worker) {
                worker.postMessage({
                    type: 'work',
                    taskId,
                    data: item,
                });
            }
        });
    }
    recordResult(taskId, workerId, result) {
        // Fan-in: collect results
        const results = this.state.activeWork.get(taskId);
        if (!results) {
            console.log(`❌ Unknown task ${taskId}`);
            return;
        }
        results.push({ workerId, result });
        console.log(`[Coordinator] Received result for task ${taskId}: ${result} (${results.length} collected)`);
        // Check if all work is complete
        // For simplicity, we just log when we have results
        if (results.length > 0) {
            const allSum = results.reduce((sum, r) => sum + r.result, 0);
            console.log(`[Coordinator] Task ${taskId} partial sum: ${allSum}`);
        }
    }
    printStats() {
        console.log('\n📊 Coordinator Statistics:');
        console.log(`  Active tasks: ${this.state.activeWork.size}`);
        console.log(`  Completed tasks: ${this.state.completedTasks}`);
    }
}
// Usage example
async function coordinatorExample() {
    const system = createTypeSafeActorSystem();
    console.log('=== Coordinator/Fan-Out-Fan-In Example ===\n');
    // Create coordinator
    const coordinator = system.createActor(CoordinatorActor, 'coordinator', {
        activeWork: new Map(),
        completedTasks: 0,
    });
    // Create workers
    const workerIds = ['worker-1', 'worker-2', 'worker-3'];
    workerIds.forEach((id) => {
        system.createActor(WorkerActor, id, {
            name: `Worker-${id.split('-')[1]}`,
            processed: 0,
        });
    });
    console.log('✅ Created 3 worker actors\n');
    // Start a task with multiple items
    coordinator.tell({
        type: 'start-task',
        taskId: 'task-1',
        data: [10, 20, 30, 40, 50],
    });
    // Start another task
    coordinator.tell({
        type: 'start-task',
        taskId: 'task-2',
        data: [5, 15, 25],
    });
    // Request stats
    coordinator.tell({ type: 'stats' });
    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Shutdown
    console.log('\n🛑 Shutting down...');
    workerIds.forEach((id) => {
        const worker = system.getActor(id);
        if (worker) {
            worker.postMessage({ type: 'shutdown' });
        }
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    system.shutdown();
}
// Export for testing
export { coordinatorExample, CoordinatorActor, WorkerActor, };
