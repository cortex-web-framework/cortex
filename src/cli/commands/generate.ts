/**
 * Generate command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { writeFileSync } from 'fs';
import type { CLICommand } from '../types.js';
import { colors } from '../utils/colors.js';
import { fileUtils } from '../utils/fs.js';

/**
 * Generate actor template
 */
function generateActor(name: string): void {
  const className = name.charAt(0).toUpperCase() + name.slice(1);
  const actorContent = `/**
 * ${className} Actor
 */

import { EventBus } from 'cortex';

export class ${className} {
  private readonly eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Handle incoming messages
   */
  async receive(message: any): Promise<any> {
    console.log('${className} received:', message);

    switch (message.type) {
      case 'EXAMPLE':
        return this.handleExample(message);
      default:
        throw new Error(\`Unknown message type: \${message.type}\`);
    }
  }

  /**
   * Handle example message
   */
  private async handleExample(message: any): Promise<any> {
    // Implement your logic here
    return {
      status: 'success',
      data: message.data,
    };
  }
}
`;

  const testContent = `/**
 * ${className} Actor Tests
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { EventBus } from 'cortex';
import { ${className} } from './${name}.js';

describe('${className}', () => {
  let eventBus: EventBus;
  let actor: ${className};

  before(() => {
    eventBus = EventBus.getInstance();
    actor = new ${className}(eventBus);
  });

  it('should handle EXAMPLE message', async () => {
    const message = {
      type: 'EXAMPLE',
      data: { test: true },
    };

    const result = await actor.receive(message);

    assert.strictEqual(result.status, 'success');
    assert.deepStrictEqual(result.data, message.data);
  });

  it('should throw error for unknown message type', async () => {
    const message = {
      type: 'UNKNOWN',
      data: {},
    };

    await assert.rejects(
      async () => actor.receive(message),
      {
        message: 'Unknown message type: UNKNOWN',
      }
    );
  });
});
`;

  // Create actor file
  const actorDir = 'src/actors';
  fileUtils.ensureDir(actorDir);
  writeFileSync(`${actorDir}/${name}.ts`, actorContent);

  // Create test file
  const testDir = 'tests/actors';
  fileUtils.ensureDir(testDir);
  writeFileSync(`${testDir}/${name}.test.ts`, testContent);

  console.log(colors.success(`✅ Created actor: ${name}`));
  console.log(colors.info(`   Actor: src/actors/${name}.ts`));
  console.log(colors.info(`   Test:  tests/actors/${name}.test.ts`));
}

/**
 * Generate service template
 */
function generateService(name: string): void {
  const className = name.charAt(0).toUpperCase() + name.slice(1) + 'Service';
  const serviceContent = `/**
 * ${className}
 */

export class ${className} {
  /**
   * Initialize service
   */
  async initialize(): Promise<void> {
    console.log('${className} initialized');
  }

  /**
   * Execute service operation
   */
  async execute(params: any): Promise<any> {
    // Implement your service logic here
    return {
      status: 'success',
      result: params,
    };
  }

  /**
   * Shutdown service
   */
  async shutdown(): Promise<void> {
    console.log('${className} shutdown');
  }
}
`;

  const testContent = `/**
 * ${className} Tests
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { ${className} } from './${name}.js';

describe('${className}', () => {
  let service: ${className};

  before(async () => {
    service = new ${className}();
    await service.initialize();
  });

  after(async () => {
    await service.shutdown();
  });

  it('should execute operation successfully', async () => {
    const params = { test: true };
    const result = await service.execute(params);

    assert.strictEqual(result.status, 'success');
    assert.deepStrictEqual(result.result, params);
  });

  it('should initialize without errors', async () => {
    const newService = new ${className}();
    await assert.doesNotReject(async () => {
      await newService.initialize();
      await newService.shutdown();
    });
  });
});
`;

  // Create service file
  const serviceDir = 'src/services';
  fileUtils.ensureDir(serviceDir);
  writeFileSync(`${serviceDir}/${name}.ts`, serviceContent);

  // Create test file
  const testDir = 'tests/services';
  fileUtils.ensureDir(testDir);
  writeFileSync(`${testDir}/${name}.test.ts`, testContent);

  console.log(colors.success(`✅ Created service: ${name}`));
  console.log(colors.info(`   Service: src/services/${name}.ts`));
  console.log(colors.info(`   Test:    tests/services/${name}.test.ts`));
}

/**
 * Generate route template
 */
function generateRoute(name: string): void {
  const routeName = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  const routeContent = `/**
 * ${name} Routes
 */

import type { CortexHttpServer } from 'cortex';

/**
 * Register ${name} routes
 */
export function register${name}Routes(server: CortexHttpServer): void {
  // GET route
  server.get('/${routeName}', async (_req: any) => {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '${name} GET endpoint',
        timestamp: new Date().toISOString(),
      }),
    };
  });

  // POST route
  server.post('/${routeName}', async (req: any) => {
    return {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '${name} POST endpoint',
        data: req.body,
        timestamp: new Date().toISOString(),
      }),
    };
  });

  // GET by ID route
  server.get('/${routeName}/:id', async (req: any) => {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '${name} GET by ID endpoint',
        id: req.params.id,
        timestamp: new Date().toISOString(),
      }),
    };
  });

  // PUT by ID route
  server.put('/${routeName}/:id', async (req: any) => {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '${name} PUT endpoint',
        id: req.params.id,
        data: req.body,
        timestamp: new Date().toISOString(),
      }),
    };
  });

  // DELETE by ID route
  server.delete('/${routeName}/:id', async (req: any) => {
    return {
      status: 204,
      headers: {},
      body: '',
    };
  });
}
`;

  const testContent = `/**
 * ${name} Routes Tests
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { CortexHttpServer, EventBus } from 'cortex';
import { register${name}Routes } from './${name}.js';

describe('${name} Routes', () => {
  let server: CortexHttpServer;
  let eventBus: EventBus;

  before(async () => {
    eventBus = EventBus.getInstance();
    server = new CortexHttpServer(eventBus, undefined, 0);
    register${name}Routes(server);
    await server.listen();
  });

  after(async () => {
    await server.close();
  });

  it('should handle GET /${routeName}', async () => {
    const response = await fetch(\`http://localhost:\${server.getPort()}/${routeName}\`);
    assert.strictEqual(response.status, 200);

    const data = await response.json();
    assert.strictEqual(data.message, '${name} GET endpoint');
    assert.ok(data.timestamp);
  });

  it('should handle POST /${routeName}', async () => {
    const testData = { test: true };
    const response = await fetch(\`http://localhost:\${server.getPort()}/${routeName}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    assert.strictEqual(response.status, 201);

    const data = await response.json();
    assert.strictEqual(data.message, '${name} POST endpoint');
    assert.deepStrictEqual(data.data, testData);
  });

  it('should handle GET /${routeName}/:id', async () => {
    const testId = '123';
    const response = await fetch(\`http://localhost:\${server.getPort()}/${routeName}/\${testId}\`);
    assert.strictEqual(response.status, 200);

    const data = await response.json();
    assert.strictEqual(data.message, '${name} GET by ID endpoint');
    assert.strictEqual(data.id, testId);
  });

  it('should handle PUT /${routeName}/:id', async () => {
    const testId = '123';
    const testData = { updated: true };
    const response = await fetch(\`http://localhost:\${server.getPort()}/${routeName}/\${testId}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    assert.strictEqual(response.status, 200);

    const data = await response.json();
    assert.strictEqual(data.message, '${name} PUT endpoint');
    assert.strictEqual(data.id, testId);
    assert.deepStrictEqual(data.data, testData);
  });

  it('should handle DELETE /${routeName}/:id', async () => {
    const testId = '123';
    const response = await fetch(\`http://localhost:\${server.getPort()}/${routeName}/\${testId}\`, {
      method: 'DELETE',
    });
    assert.strictEqual(response.status, 204);
  });
});
`;

  // Create route file
  const routeDir = 'src/routes';
  fileUtils.ensureDir(routeDir);
  writeFileSync(`${routeDir}/${name}.ts`, routeContent);

  // Create test file
  const testDir = 'tests/routes';
  fileUtils.ensureDir(testDir);
  writeFileSync(`${testDir}/${name}.test.ts`, testContent);

  console.log(colors.success(`✅ Created routes: ${name}`));
  console.log(colors.info(`   Routes: src/routes/${name}.ts`));
  console.log(colors.info(`   Test:   tests/routes/${name}.test.ts`));
}

/**
 * Generate command
 */
export const generateCommand: CLICommand = {
  name: 'generate',
  description: 'Generate code from templates',
  options: [
    {
      name: 'type',
      description: 'Type of code to generate (actor, service, route)',
      type: 'string',
      required: true,
    },
    {
      name: 'name',
      description: 'Name of the component',
      type: 'string',
      required: true,
    },
  ],
  action: async (args: string[], options: Record<string, unknown>): Promise<void> => {
    try {
      const type = args[0] as string;
      const name = args[1] as string;

      if (!type || !name) {
        throw new Error('Usage: cortex generate <type> <name>\n  Types: actor, service, route');
      }

      // Validate name
      if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
        throw new Error('Name must start with a letter and contain only letters and numbers');
      }

      console.log(colors.blue(`🔧 Generating ${type}...`));
      console.log();

      switch (type) {
        case 'actor':
          generateActor(name);
          break;
        case 'service':
          generateService(name);
          break;
        case 'route':
          generateRoute(name);
          break;
        default:
          throw new Error(`Unknown type: ${type}\nAvailable types: actor, service, route`);
      }

      console.log();
      console.log(colors.success('🎉 Generation complete!'));
      console.log();
      console.log(colors.info('Next steps:'));
      console.log(colors.cyan(`  1. Review the generated files`));
      console.log(colors.cyan(`  2. Customize the implementation`));
      console.log(colors.cyan(`  3. Run tests: cortex test`));
      console.log();

    } catch (error) {
      console.error(colors.error('❌ Generation failed:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  },
};
