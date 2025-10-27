/**
 * Prisma Adapter for Cortex Database Module
 *
 * Provides Prisma ORM integration with:
 * - Type-safe query building
 * - Automatic schema generation
 * - Migration management
 * - Connection pooling
 * - Transaction support
 *
 * Setup:
 * 1. npm install @prisma/client
 * 2. npm install -D prisma
 * 3. npx prisma init
 * 4. Update .env with DATABASE_URL
 * 5. npx prisma migrate dev --name init
 */

import 'reflect-metadata';
import { Database, DatabaseConfig, IRepository, FindOptions } from './database.js';

/**
 * Prisma adapter configuration
 */
export interface PrismaConfig extends DatabaseConfig {
  provider: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'sqlserver';
  shadowDatabaseUrl?: string;
}

/**
 * Prisma repository implementation
 */
export class PrismaRepository<T> implements IRepository<T> {
  constructor(
    private prismaClient: any, // PrismaClient type
    private model: string,
  ) {}

  /**
   * Find all entities matching criteria
   */
  async find(options?: FindOptions<T>): Promise<T[]> {
    const query: any = {};

    if (options?.where) {
      query.where = options.where;
    }
    if (options?.select) {
      query.select = options.select.reduce((acc, field) => {
        acc[field as string] = true;
        return acc;
      }, {} as any);
    }
    if (options?.skip !== undefined) {
      query.skip = options.skip;
    }
    if (options?.take !== undefined) {
      query.take = options.take;
    }
    if (options?.orderBy) {
      query.orderBy = options.orderBy;
    }

    return this.prismaClient[this.model].findMany(query);
  }

  /**
   * Find a single entity
   */
  async findOne(options: FindOptions<T>): Promise<T | null> {
    const query: any = {};

    if (options.where) {
      query.where = options.where;
    }
    if (options.select) {
      query.select = options.select.reduce((acc, field) => {
        acc[field as string] = true;
        return acc;
      }, {} as any);
    }

    return this.prismaClient[this.model].findFirst(query);
  }

  /**
   * Find entity by ID
   */
  async findById(id: any): Promise<T | null> {
    return this.prismaClient[this.model].findUnique({
      where: { id },
    });
  }

  /**
   * Create a new entity
   */
  async create(data: Partial<T>): Promise<T> {
    return this.prismaClient[this.model].create({
      data,
    });
  }

  /**
   * Update an entity
   */
  async update(id: any, data: Partial<T>): Promise<T> {
    return this.prismaClient[this.model].update({
      where: { id },
      data,
    });
  }

  /**
   * Delete an entity
   */
  async delete(id: any): Promise<boolean> {
    const result = await this.prismaClient[this.model].delete({
      where: { id },
    });
    return !!result;
  }

  /**
   * Count entities matching criteria
   */
  async count(options?: FindOptions<T>): Promise<number> {
    const query: any = {};

    if (options?.where) {
      query.where = options.where;
    }

    return this.prismaClient[this.model].count(query);
  }

  /**
   * Delete entities matching criteria
   */
  async deleteMany(options?: FindOptions<T>): Promise<number> {
    const query: any = {};

    if (options?.where) {
      query.where = options.where;
    }

    const result = await this.prismaClient[this.model].deleteMany(query);
    return result.count;
  }

  /**
   * Update entities matching criteria
   */
  async updateMany(options: FindOptions<T>, data: Partial<T>): Promise<number> {
    const query: any = { data };

    if (options.where) {
      query.where = options.where;
    }

    const result = await this.prismaClient[this.model].updateMany(query);
    return result.count;
  }
}

/**
 * Prisma Database implementation
 */
export class PrismaDatabase extends Database {
  private prismaClient: any;

  constructor(config: PrismaConfig) {
    super(config);
    // Lazy load Prisma client
  }

  /**
   * Initialize Prisma client
   */
  private async initPrismaClient() {
    if (!this.prismaClient) {
      try {
        // Dynamically import Prisma client to avoid hard dependency
        // Users must install @prisma/client separately
        // @ts-ignore - Prisma is optional dependency
        const prismaModule = await import('@prisma/client');
        const { PrismaClient } = prismaModule;
        this.prismaClient = new PrismaClient({
          datasources: {
            db: {
              url: this.getConfig().url,
            },
          },
          log: this.getConfig().logging ? ['query', 'error', 'warn'] : [],
        });
      } catch (error) {
        throw new Error(
          `[Prisma] Failed to initialize Prisma client. Make sure to install @prisma/client: npm install @prisma/client`,
        );
      }
    }
  }

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    await this.initPrismaClient();
    await this.prismaClient.$connect();
    console.log('[Prisma] Connected to database');
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    if (this.prismaClient) {
      await this.prismaClient.$disconnect();
      console.log('[Prisma] Disconnected from database');
    }
  }

  /**
   * Get repository for entity
   */
  getRepository<T>(entity: Function): PrismaRepository<T> {
    const entityName = Reflect.getMetadata('entity:name', entity) || entity.name.toLowerCase();
    return new PrismaRepository<T>(this.prismaClient, entityName);
  }

  /**
   * Execute raw SQL query
   */
  async raw(sql: string, params?: any[]): Promise<any> {
    if (!this.prismaClient) {
      throw new Error('[Prisma] Not connected to database');
    }
    return this.prismaClient.$queryRawUnsafe(sql, ...(params || []));
  }

  /**
   * Execute transaction
   */
  async transaction<T>(callback: (db: PrismaDatabase) => Promise<T>): Promise<T> {
    if (!this.prismaClient) {
      throw new Error('[Prisma] Not connected to database');
    }

    return this.prismaClient.$transaction(async () => {
      return callback(this);
    });
  }

  /**
   * Get underlying Prisma client
   */
  getPrismaClient(): any {
    if (!this.prismaClient) {
      throw new Error('[Prisma] Not connected to database');
    }
    return this.prismaClient;
  }
}

export default PrismaDatabase;
