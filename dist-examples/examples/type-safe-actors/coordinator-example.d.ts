/**
 * Coordinator/Fan-Out-Fan-In Pattern Example
 *
 * Demonstrates coordinating multiple worker actors
 */
import { TypeSafeActor } from '../../src/core/typeSafeActorSystem.js';
type WorkerMessage = {
    type: 'work';
    taskId: string;
    data: number;
} | {
    type: 'shutdown';
};
interface WorkerState {
    name: string;
    processed: number;
}
declare class WorkerActor extends TypeSafeActor<WorkerState, WorkerMessage> {
    protected receive(message: WorkerMessage): void;
}
interface WorkResult {
    workerId: string;
    result: number;
}
type CoordinatorMessage = {
    type: 'start-task';
    taskId: string;
    data: number[];
} | {
    type: 'work-complete';
    taskId: string;
    workerId: string;
    result: number;
} | {
    type: 'stats';
};
interface CoordinatorState {
    activeWork: Map<string, WorkResult[]>;
    completedTasks: number;
}
declare class CoordinatorActor extends TypeSafeActor<CoordinatorState, CoordinatorMessage> {
    private workerIds;
    protected receive(message: CoordinatorMessage): void;
    private startTask;
    private recordResult;
    private printStats;
}
declare function coordinatorExample(): Promise<void>;
export { coordinatorExample, CoordinatorActor, WorkerActor, CoordinatorMessage, WorkerMessage, };
