/**
 * Database Module for Cortex Framework
 *
 * Provides type-safe database abstraction with support for:
 * - Prisma ORM integration
 * - Repository pattern for data access
 * - Transaction management
 * - Connection pooling
 * - Migration support
 *
 * Usage:
 * ```typescript
 * import { Database, Entity, Column } from 'cortex';
 *
 * @Entity()
 * class User {
 *   @Column({ primary: true })
 *   id: string;
 *
 *   @Column()
 *   email: string;
 *
 *   @Column()
 *   name: string;
 * }
 *
 * const userRepo = database.getRepository(User);
 * const users = await userRepo.find({ where: { email: 'test@example.com' } });
 * ```
 */

import 'reflect-metadata';

/**
 * Database configuration options
 */
export interface DatabaseConfig {
  url: string;
  provider?: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'sqlserver';
  logging?: boolean;
  ssl?: boolean;
  maxConnections?: number;
  minConnections?: number;
  connectionTimeout?: number;
}

/**
 * Repository interface for data access operations
 */
export interface IRepository<T> {
  /**
   * Find all entities matching criteria
   */
  find(options?: FindOptions<T>): Promise<T[]>;

  /**
   * Find a single entity
   */
  findOne(options: FindOptions<T>): Promise<T | null>;

  /**
   * Find entity by ID
   */
  findById(id: any): Promise<T | null>;

  /**
   * Create a new entity
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Update an entity
   */
  update(id: any, data: Partial<T>): Promise<T>;

  /**
   * Delete an entity
   */
  delete(id: any): Promise<boolean>;

  /**
   * Count entities matching criteria
   */
  count(options?: FindOptions<T>): Promise<number>;

  /**
   * Delete entities matching criteria
   */
  deleteMany(options?: FindOptions<T>): Promise<number>;

  /**
   * Update entities matching criteria
   */
  updateMany(options: FindOptions<T>, data: Partial<T>): Promise<number>;
}

/**
 * Find options for database queries
 */
export interface FindOptions<T> {
  where?: Partial<T> | { [key: string]: any };
  select?: (keyof T)[];
  skip?: number;
  take?: number;
  orderBy?: { [key in keyof T]?: 'asc' | 'desc' };
}

/**
 * Entity decorator for marking classes as database entities
 *
 * @example
 * ```typescript
 * @Entity('users')
 * class User {
 *   id: string;
 *   email: string;
 * }
 * ```
 */
export function Entity(tableName?: string): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata('entity:name', tableName || target.name.toLowerCase(), target);
    Reflect.defineMetadata('entity:properties', {}, target);
  };
}

/**
 * Column decorator for entity properties
 *
 * @example
 * ```typescript
 * class User {
 *   @Column({ primary: true })
 *   id: string;
 *
 *   @Column({ type: 'String', unique: true })
 *   email: string;
 * }
 * ```
 */
export interface ColumnOptions {
  name?: string;
  type?: string;
  primary?: boolean;
  unique?: boolean;
  nullable?: boolean;
  default?: any;
  length?: number;
}

export function Column(options?: ColumnOptions): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol | undefined) => {
    const properties = Reflect.getOwnMetadata('entity:properties', target.constructor) || {};
    properties[propertyKey as string] = options || {};
    Reflect.defineMetadata('entity:properties', properties, target.constructor);
  };
}

/**
 * Relation decorator for entity relationships
 *
 * @example
 * ```typescript
 * class User {
 *   @Relation(() => Post, 'user')
 *   posts: Post[];
 * }
 * ```
 */
export interface RelationOptions {
  target: () => Function;
  foreignKey?: string;
  type?: 'one-to-many' | 'many-to-one' | 'one-to-one' | 'many-to-many';
}

export function Relation(relationOptions: RelationOptions): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol | undefined) => {
    const relations = Reflect.getOwnMetadata('entity:relations', target.constructor) || {};
    relations[propertyKey as string] = relationOptions;
    Reflect.defineMetadata('entity:relations', relations, target.constructor);
  };
}

/**
 * Primary database class for managing connections and repositories
 */
export class Database {
  private config: DatabaseConfig;
  private repositories: Map<Function, IRepository<any>> = new Map();
  private isConnected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Connect to the database
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      // This will be implemented by specific adapters (Prisma, TypeORM, etc.)
      this.isConnected = true;
      console.log(`[Database] Connected to ${this.config.provider || 'database'}`);
    } catch (error) {
      throw new Error(`[Database] Failed to connect: ${error}`);
    }
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      this.repositories.clear();
      this.isConnected = false;
      console.log('[Database] Disconnected');
    } catch (error) {
      throw new Error(`[Database] Failed to disconnect: ${error}`);
    }
  }

  /**
   * Get a repository for an entity
   */
  getRepository<T>(entity: Function): IRepository<T> {
    if (!this.repositories.has(entity)) {
      // This will be implemented by specific adapters
      throw new Error(`[Database] Repository not found for ${entity.name}`);
    }
    return this.repositories.get(entity)!;
  }

  /**
   * Register a repository for an entity
   */
  registerRepository<T>(entity: Function, repository: IRepository<T>): void {
    this.repositories.set(entity, repository);
  }

  /**
   * Check if connected
   */
  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  /**
   * Get database configuration
   */
  getConfig(): DatabaseConfig {
    return this.config;
  }
}

/**
 * Transaction context for managing database transactions
 */
export interface TransactionContext {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

/**
 * Transaction manager for handling database transactions
 */
export class TransactionManager {
  private activeTransactions: Map<string, TransactionContext> = new Map();

  /**
   * Begin a new transaction
   */
  async beginTransaction(): Promise<TransactionContext> {
    // Implementation will be provided by specific adapters
    throw new Error('[TransactionManager] Not implemented');
  }

  /**
   * Get active transaction
   */
  getActiveTransaction(id: string): TransactionContext | undefined {
    return this.activeTransactions.get(id);
  }

  /**
   * Register active transaction
   */
  registerTransaction(id: string, context: TransactionContext): void {
    this.activeTransactions.set(id, context);
  }

  /**
   * Remove transaction
   */
  removeTransaction(id: string): void {
    this.activeTransactions.delete(id);
  }
}

export default Database;
