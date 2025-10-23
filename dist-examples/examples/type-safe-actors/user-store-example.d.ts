/**
 * User Store Actor Example
 *
 * Demonstrates state management with complex types and querying
 */
import { TypeSafeActor } from '../../src/core/typeSafeActorSystem.js';
interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}
interface UserStoreState {
    users: Map<string, User>;
    totalCreated: number;
    totalDeleted: number;
}
type UserStoreMessage = {
    type: 'create';
    id: string;
    name: string;
    email: string;
} | {
    type: 'update';
    id: string;
    name?: string;
    email?: string;
} | {
    type: 'delete';
    id: string;
} | {
    type: 'get';
    id: string;
} | {
    type: 'list';
} | {
    type: 'stats';
};
declare class UserStoreActor extends TypeSafeActor<UserStoreState, UserStoreMessage> {
    protected receive(message: UserStoreMessage): void;
    private createUser;
    private updateUser;
    private deleteUser;
    private getUser;
    private listUsers;
    private printStats;
}
declare function userStoreExample(): Promise<void>;
export { userStoreExample, UserStoreActor, UserStoreMessage, User };
