/**
 * Comprehensive tests for Cortex Dependency Injection Container
 */

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  Container,
  DIScope,
  Injectable,
  Inject,
  CircularDependencyError,
  DependencyNotFoundError,
} from '../src/core/container.js';

// Test fixtures
class Logger {
  log(message: string): void {
    console.log(`[Logger] ${message}`);
  }
}

class Database {
  constructor(private logger: Logger) {}

  query(sql: string): any[] {
    this.logger.log(`Executing query: ${sql}`);
    return [];
  }
}

@Injectable()
class UserService {
  constructor(private db: Database, private logger: Logger) {}

  getUser(id: number) {
    this.logger.log(`Getting user ${id}`);
    return { id, name: 'User' };
  }
}

class ProductService {
  constructor(private db: Database) {}

  getProducts() {
    return [];
  }
}

// Tests

test('DI Container - Basic Singleton Registration', () => {
  const container = new Container();
  const logger = new Logger();

  container.registerSingleton(Logger, logger);

  const resolved1 = container.resolve<Logger>(Logger);
  const resolved2 = container.resolve<Logger>(Logger);

  assert.strictEqual(resolved1, resolved2);
  assert.strictEqual(resolved1, logger);
});

test('DI Container - Basic Class Registration', () => {
  const container = new Container();

  container.registerSingleton(Logger);
  const logger = container.resolve<Logger>(Logger);

  assert(logger instanceof Logger);
});

test('DI Container - Transient Scope Creates New Instances', () => {
  const container = new Container();

  container.registerTransient(Logger);

  const instance1 = container.resolve<Logger>(Logger);
  const instance2 = container.resolve<Logger>(Logger);

  assert(instance1 instanceof Logger);
  assert(instance2 instanceof Logger);
  assert.notStrictEqual(instance1, instance2);
});

test('DI Container - Constructor Injection', () => {
  const container = new Container();

  container.registerSingleton(Logger);
  container.registerSingleton(Database);
  container.registerSingleton(UserService);

  const userService = container.resolve<UserService>(UserService);

  assert(userService instanceof UserService);
  assert.strictEqual(typeof userService.getUser, 'function');
});

test('DI Container - Factory Provider', () => {
  const container = new Container();

  container.registerFactory(Logger, () => {
    const logger = new Logger();
    return logger;
  });

  const logger = container.resolve<Logger>(Logger);
  assert(logger instanceof Logger);
});

test('DI Container - Value Provider', () => {
  const container = new Container();
  const config = { apiUrl: 'https://api.example.com' };

  container.registerValue('config', config);

  const resolved = container.resolve<typeof config>('config');
  assert.strictEqual(resolved, config);
});

test('DI Container - Alias Provider', () => {
  const container = new Container();

  container.registerSingleton(Logger);
  container.registerAlias('logger', Logger);

  const resolved = container.resolve<Logger>('logger');
  assert(resolved instanceof Logger);
});

test('DI Container - Named Dependencies', () => {
  const container = new Container();

  const logger1 = new Logger();
  const logger2 = new Logger();

  container.registerValue(Logger, logger1, 'primary');
  container.registerValue(Logger, logger2, 'secondary');

  const primary = container.resolve<Logger>(Logger, 'primary');
  const secondary = container.resolve<Logger>(Logger, 'secondary');

  assert.strictEqual(primary, logger1);
  assert.strictEqual(secondary, logger2);
  assert.notStrictEqual(primary, secondary);
});

test('DI Container - Check Registered Dependencies', () => {
  const container = new Container();

  container.registerSingleton(Logger);
  container.registerSingleton(Database);

  assert(container.has(Logger));
  assert(container.has(Database));
  assert(!container.has(UserService));
});

test('DI Container - Dependency Not Found Error', () => {
  const container = new Container();

  assert.throws(
    () => container.resolve(Logger),
    DependencyNotFoundError
  );
});

test('DI Container - Circular Dependency Detection', () => {
  const container = new Container();

  // Create circular dependency: A depends on B, B depends on A
  class ServiceA {
    constructor(private serviceB: ServiceB) {}
  }

  class ServiceB {
    constructor(private serviceA: ServiceA) {}
  }

  container.registerSingleton(ServiceA);
  container.registerSingleton(ServiceB);

  // This should detect circular dependency
  assert.throws(
    () => container.resolve(ServiceA),
    CircularDependencyError
  );
});

test('DI Container - Container Statistics', () => {
  const container = new Container();

  container.registerSingleton(Logger);
  container.registerTransient(Database);
  container.registerSingleton(UserService);

  const stats = container.getStats();

  assert.strictEqual(stats.totalProviders, 3);
  assert.strictEqual(stats.singletonCount, 2);
  assert.strictEqual(stats.transientCount, 1);
});

test('DI Container - Clear Container', () => {
  const container = new Container();

  container.registerSingleton(Logger);
  const logger = container.resolve<Logger>(Logger);

  container.clear();

  assert(!container.has(Logger));
  assert.throws(
    () => container.resolve(Logger),
    DependencyNotFoundError
  );
});

test('DI Container - Global Container', () => {
  const container = new Container();

  container.registerSingleton(Logger);
  const logger = container.resolve<Logger>(Logger);

  assert(logger instanceof Logger);
});

test('DI Container - Request Scope Creation', () => {
  const container = new Container();

  container.registerSingleton(Logger);
  container.registerRequest(Database);

  const scope1 = container.createRequestScope();
  const scope2 = container.createRequestScope();

  assert.notStrictEqual(scope1, scope2);
});

test('DI Container - Multiple Dependency Chains', () => {
  const container = new Container();

  container.registerSingleton(Logger);
  container.registerSingleton(Database);
  container.registerSingleton(UserService);
  container.registerSingleton(ProductService);

  const userService = container.resolve<UserService>(UserService);
  const productService = container.resolve<ProductService>(ProductService);

  assert(userService instanceof UserService);
  assert(productService instanceof ProductService);
});

test('DI Container - Factory with Container Access', () => {
  const container = new Container();

  container.registerSingleton(Logger);
  container.registerFactory(Database, (c) => {
    const logger = c.resolve<Logger>(Logger);
    return new Database(logger);
  });

  const db = container.resolve<Database>(Database);
  assert(db instanceof Database);
});

test('DI Container - Debug Mode', () => {
  const container = new Container(true);

  container.registerSingleton(Logger);
  container.setDebug(true);

  // Should log debug messages
  const logger = container.resolve<Logger>(Logger);
  assert(logger instanceof Logger);
});

test('DI Container - Resolve Count Tracking', () => {
  const container = new Container();

  container.registerSingleton(Logger);

  // Resolve multiple times
  container.resolve(Logger);
  container.resolve(Logger);
  container.resolve(Logger);

  const stats = container.getStats();
  assert(stats.totalResolutions >= 3);
});

test('DI Container - Integration: Complex Service Graph', () => {
  const container = new Container();

  // Register entire service graph
  container.registerSingleton(Logger);
  container.registerSingleton(Database);
  container.registerSingleton(UserService);
  container.registerSingleton(ProductService);

  // Verify all can be resolved
  const logger = container.resolve<Logger>(Logger);
  const db = container.resolve<Database>(Database);
  const userService = container.resolve<UserService>(UserService);
  const productService = container.resolve<ProductService>(ProductService);

  assert(logger instanceof Logger);
  assert(db instanceof Database);
  assert(userService instanceof UserService);
  assert(productService instanceof ProductService);

  // Verify singleton behavior
  const logger2 = container.resolve<Logger>(Logger);
  assert.strictEqual(logger, logger2);
});

test('DI Container - Provider Metadata', () => {
  const container = new Container();

  container.registerSingleton(Logger);

  const providers = container.getProviders();
  assert(providers.length > 0);

  const loggerProvider = providers.find(p => p.token === Logger);
  assert(loggerProvider);
  assert.strictEqual(loggerProvider.scope, DIScope.SINGLETON);
  assert.strictEqual(loggerProvider.type, 'class');
});
