/**
 * User Store Actor Example
 *
 * Demonstrates state management with complex types and querying
 */

import {
  TypeSafeActor,
  createTypeSafeActorSystem,
} from '../../src/core/typeSafeActorSystem.js';

// Domain types
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

// Message types
type UserStoreMessage =
  | { type: 'create'; id: string; name: string; email: string }
  | { type: 'update'; id: string; name?: string; email?: string }
  | { type: 'delete'; id: string }
  | { type: 'get'; id: string }
  | { type: 'list' }
  | { type: 'stats' };

// User store actor
class UserStoreActor extends TypeSafeActor<UserStoreState, UserStoreMessage> {
  protected receive(message: UserStoreMessage): void {
    switch (message.type) {
      case 'create':
        this.createUser(message.id, message.name, message.email);
        break;

      case 'update':
        this.updateUser(message.id, message.name, message.email);
        break;

      case 'delete':
        this.deleteUser(message.id);
        break;

      case 'get':
        this.getUser(message.id);
        break;

      case 'list':
        this.listUsers();
        break;

      case 'stats':
        this.printStats();
        break;
    }
  }

  private createUser(id: string, name: string, email: string): void {
    if (this.state.users.has(id)) {
      console.log(`❌ User ${id} already exists`);
      return;
    }

    const user: User = {
      id,
      name,
      email,
      createdAt: new Date(),
    };

    this.state.users.set(id, user);
    this.state.totalCreated++;
    console.log(`✅ Created user: ${id}`);
  }

  private updateUser(
    id: string,
    name?: string,
    email?: string
  ): void {
    const user = this.state.users.get(id);

    if (!user) {
      console.log(`❌ User ${id} not found`);
      return;
    }

    if (name) user.name = name;
    if (email) user.email = email;

    console.log(`✅ Updated user: ${id}`);
  }

  private deleteUser(id: string): void {
    if (!this.state.users.has(id)) {
      console.log(`❌ User ${id} not found`);
      return;
    }

    this.state.users.delete(id);
    this.state.totalDeleted++;
    console.log(`✅ Deleted user: ${id}`);
  }

  private getUser(id: string): void {
    const user = this.state.users.get(id);

    if (!user) {
      console.log(`❌ User ${id} not found`);
      return;
    }

    console.log(
      `✅ User ${id}: ${user.name} <${user.email}> (created: ${user.createdAt})`
    );
  }

  private listUsers(): void {
    if (this.state.users.size === 0) {
      console.log('No users');
      return;
    }

    console.log('\n📋 Users:');
    for (const [id, user] of this.state.users) {
      console.log(`  ${id}: ${user.name} <${user.email}>`);
    }
  }

  private printStats(): void {
    console.log('\n📊 Store Statistics:');
    console.log(`  Total created: ${this.state.totalCreated}`);
    console.log(`  Total deleted: ${this.state.totalDeleted}`);
    console.log(`  Current count: ${this.state.users.size}`);
  }
}

// Usage example
async function userStoreExample() {
  const system = createTypeSafeActorSystem();

  const store = system.createActor(UserStoreActor, 'user-store', {
    users: new Map(),
    totalCreated: 0,
    totalDeleted: 0,
  });

  console.log('=== User Store Example ===\n');

  // Create users
  store.tell({
    type: 'create',
    id: 'alice',
    name: 'Alice Johnson',
    email: 'alice@example.com',
  });

  store.tell({
    type: 'create',
    id: 'bob',
    name: 'Bob Smith',
    email: 'bob@example.com',
  });

  store.tell({
    type: 'create',
    id: 'charlie',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
  });

  // List all users
  store.tell({ type: 'list' });

  // Update a user
  store.tell({
    type: 'update',
    id: 'alice',
    name: 'Alice Johnson-Smith',
    email: 'alice.johnson@example.com',
  });

  // Get a specific user
  store.tell({ type: 'get', id: 'alice' });

  // Delete a user
  store.tell({ type: 'delete', id: 'bob' });

  // Show stats
  store.tell({ type: 'stats' });

  // Wait for processing
  await new Promise((resolve) => setTimeout(resolve, 100));

  system.shutdown();
}

// Export for testing
export { userStoreExample, UserStoreActor, UserStoreMessage, User };
