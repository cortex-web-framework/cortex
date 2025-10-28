/**
 * Generate command implementation
 * Scaffolds new components for Cortex projects
 * Zero dependencies, strictest TypeScript configuration
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { colors } from '../utils/colors.js';
import { processOps } from '../utils/process.js';
import type { CLICommand } from '../types.js';

/**
 * Generate command with subcommands
 */
export const generateCommand: CLICommand = {
  name: 'generate',
  description: 'Generate new components (actor, service, route)',
  options: [],
  action: async (args, _options) => {
    if (args.length === 0) {
      console.log('');
      console.log(colors.bold('🏗️  Cortex Generator'));
      console.log('');
      console.log(colors.info('Usage: cortex generate <type> <name> [options]'));
      console.log('');
      console.log(colors.bold('Available types:'));
      console.log('  ' + colors.cyan('actor  ') + ' - Create a new actor');
      console.log('  ' + colors.cyan('service') + ' - Create a new service');
      console.log('  ' + colors.cyan('route  ') + ' - Create a new route');
      console.log('');
      console.log(colors.bold('Examples:'));
      console.log('  cortex generate actor UserActor');
      console.log('  cortex generate service EmailService');
      console.log('  cortex generate route /api/users');
      console.log('');
      return;
    }

    const type = args[0];
    const name = args[1];

    if (!name) {
      console.error(colors.error('Error: Component name is required'));
      processOps.exit(1);
    }

    const cwd = processOps.cwd();
    const packageJsonPath = join(cwd, 'package.json');

    if (!existsSync(packageJsonPath)) {
      console.error(colors.error('Error: package.json not found. Are you in a Cortex project directory?'));
      processOps.exit(1);
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const usesTypescript = existsSync(join(cwd, 'tsconfig.json'));
    const ext = usesTypescript ? 'ts' : 'js';

    switch (type) {
      case 'actor':
        await generateActor(name, cwd, ext);
        break;
      case 'service':
        await generateService(name, cwd, ext);
        break;
      case 'route':
        await generateRoute(name, cwd, ext);
        break;
      default:
        console.error(colors.error(`Error: Unknown generator type '${type}'`));
        console.log('');
        console.log('Available types: actor, service, route');
        processOps.exit(1);
    }
  },
};

/**
 * Generate an actor
 */
async function generateActor(name: string, cwd: string, ext: string): Promise<void> {
  console.log('');
  console.log(colors.bold(`🎭 Generating Actor: ${name}`));
  console.log('');

  const actorsDir = join(cwd, 'src', 'actors');
  if (!existsSync(actorsDir)) {
    mkdirSync(actorsDir, { recursive: true });
  }

  const fileName = `${name}.${ext}`;
  const filePath = join(actorsDir, fileName);

  if (existsSync(filePath)) {
    console.error(colors.error(`Error: ${fileName} already exists`));
    processOps.exit(1);
  }

  const template = ext === 'ts' ? generateActorTypeScript(name) : generateActorJavaScript(name);

  writeFileSync(filePath, template);
  console.log(colors.success(`✅ Created ${filePath}`));

  // Generate test file
  const testFileName = `${name}.test.${ext}`;
  const testFilePath = join(actorsDir, testFileName);
  const testTemplate = ext === 'ts' ? generateActorTestTypeScript(name) : generateActorTestJavaScript(name);

  writeFileSync(testFilePath, testTemplate);
  console.log(colors.success(`✅ Created ${testFilePath}`));

  console.log('');
  console.log(colors.info('📝 Next steps:'));
  console.log(`  1. Implement the receive method in ${fileName}`);
  console.log(`  2. Add tests in ${testFileName}`);
  console.log(`  3. Register the actor in your ActorSystem`);
  console.log('');
}

/**
 * Generate a service
 */
async function generateService(name: string, cwd: string, ext: string): Promise<void> {
  console.log('');
  console.log(colors.bold(`⚙️  Generating Service: ${name}`));
  console.log('');

  const servicesDir = join(cwd, 'src', 'services');
  if (!existsSync(servicesDir)) {
    mkdirSync(servicesDir, { recursive: true });
  }

  const fileName = `${name}.${ext}`;
  const filePath = join(servicesDir, fileName);

  if (existsSync(filePath)) {
    console.error(colors.error(`Error: ${fileName} already exists`));
    processOps.exit(1);
  }

  const template = ext === 'ts' ? generateServiceTypeScript(name) : generateServiceJavaScript(name);

  writeFileSync(filePath, template);
  console.log(colors.success(`✅ Created ${filePath}`));

  // Generate test file
  const testFileName = `${name}.test.${ext}`;
  const testFilePath = join(servicesDir, testFileName);
  const testTemplate = ext === 'ts' ? generateServiceTestTypeScript(name) : generateServiceTestJavaScript(name);

  writeFileSync(testFilePath, testTemplate);
  console.log(colors.success(`✅ Created ${testFilePath}`));

  console.log('');
  console.log(colors.info('📝 Next steps:'));
  console.log(`  1. Implement service methods in ${fileName}`);
  console.log(`  2. Add tests in ${testFileName}`);
  console.log(`  3. Import and use the service in your application`);
  console.log('');
}

/**
 * Generate a route
 */
async function generateRoute(name: string, cwd: string, ext: string): Promise<void> {
  console.log('');
  console.log(colors.bold(`🛣️  Generating Route: ${name}`));
  console.log('');

  const routesDir = join(cwd, 'src', 'routes');
  if (!existsSync(routesDir)) {
    mkdirSync(routesDir, { recursive: true });
  }

  // Convert route name to file name (e.g., /api/users -> api-users)
  const fileName = name.replace(/^\//, '').replace(/\//g, '-') + `.${ext}`;
  const filePath = join(routesDir, fileName);

  if (existsSync(filePath)) {
    console.error(colors.error(`Error: ${fileName} already exists`));
    processOps.exit(1);
  }

  const template = ext === 'ts' ? generateRouteTypeScript(name) : generateRouteJavaScript(name);

  writeFileSync(filePath, template);
  console.log(colors.success(`✅ Created ${filePath}`));

  // Generate test file
  const testFileName = fileName.replace(`.${ext}`, `.test.${ext}`);
  const testFilePath = join(routesDir, testFileName);
  const testTemplate = ext === 'ts' ? generateRouteTestTypeScript(name) : generateRouteTestJavaScript(name);

  writeFileSync(testFilePath, testTemplate);
  console.log(colors.success(`✅ Created ${testFilePath}`));

  console.log('');
  console.log(colors.info('📝 Next steps:'));
  console.log(`  1. Implement route handlers in ${fileName}`);
  console.log(`  2. Add tests in ${testFileName}`);
  console.log(`  3. Register the route in your HTTP server`);
  console.log('');
}

// Template generators

function generateActorTypeScript(name: string): string {
  return `/**
 * ${name} Actor
 * Generated by Cortex CLI
 */

export interface ${name}Message {
  type: string;
  data?: unknown;
}

export interface ${name}State {
  // Define actor state here
}

export class ${name} {
  private state: ${name}State;

  constructor() {
    this.state = {};
  }

  async receive(message: ${name}Message): Promise<unknown> {
    switch (message.type) {
      case 'INIT':
        return this.handleInit();
      default:
        throw new Error(\`Unknown message type: \${message.type}\`);
    }
  }

  private async handleInit(): Promise<{ status: string }> {
    // Implement initialization logic
    return { status: 'initialized' };
  }
}
`;
}

function generateActorJavaScript(name: string): string {
  return `/**
 * ${name} Actor
 * Generated by Cortex CLI
 */

export class ${name} {
  constructor() {
    this.state = {};
  }

  async receive(message) {
    switch (message.type) {
      case 'INIT':
        return this.handleInit();
      default:
        throw new Error(\`Unknown message type: \${message.type}\`);
    }
  }

  async handleInit() {
    // Implement initialization logic
    return { status: 'initialized' };
  }
}
`;
}

function generateActorTestTypeScript(name: string): string {
  return `/**
 * ${name} Actor Tests
 * Generated by Cortex CLI
 */

import { describe, it, expect } from 'vitest';
import { ${name} } from './${name}.js';

describe('${name}', () => {
  it('should handle INIT message', async () => {
    const actor = new ${name}();
    const result = await actor.receive({ type: 'INIT' });
    expect(result).toEqual({ status: 'initialized' });
  });

  it('should throw error for unknown message type', async () => {
    const actor = new ${name}();
    await expect(actor.receive({ type: 'UNKNOWN' })).rejects.toThrow();
  });
});
`;
}

function generateActorTestJavaScript(name: string): string {
  return `/**
 * ${name} Actor Tests
 * Generated by Cortex CLI
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { ${name} } from './${name}.js';

test('${name} - should handle INIT message', async () => {
  const actor = new ${name}();
  const result = await actor.receive({ type: 'INIT' });
  assert.deepStrictEqual(result, { status: 'initialized' });
});

test('${name} - should throw error for unknown message type', async () => {
  const actor = new ${name}();
  await assert.rejects(
    () => actor.receive({ type: 'UNKNOWN' }),
    /Unknown message type/
  );
});
`;
}

function generateServiceTypeScript(name: string): string {
  return `/**
 * ${name} Service
 * Generated by Cortex CLI
 */

export interface ${name}Config {
  // Define service configuration
}

export class ${name} {
  private config: ${name}Config;

  constructor(config: ${name}Config = {}) {
    this.config = config;
  }

  async execute(): Promise<unknown> {
    // Implement service logic
    return { success: true };
  }
}
`;
}

function generateServiceJavaScript(name: string): string {
  return `/**
 * ${name} Service
 * Generated by Cortex CLI
 */

export class ${name} {
  constructor(config = {}) {
    this.config = config;
  }

  async execute() {
    // Implement service logic
    return { success: true };
  }
}
`;
}

function generateServiceTestTypeScript(name: string): string {
  return `/**
 * ${name} Service Tests
 * Generated by Cortex CLI
 */

import { describe, it, expect } from 'vitest';
import { ${name} } from './${name}.js';

describe('${name}', () => {
  it('should execute successfully', async () => {
    const service = new ${name}();
    const result = await service.execute();
    expect(result).toEqual({ success: true });
  });
});
`;
}

function generateServiceTestJavaScript(name: string): string {
  return `/**
 * ${name} Service Tests
 * Generated by Cortex CLI
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { ${name} } from './${name}.js';

test('${name} - should execute successfully', async () => {
  const service = new ${name}();
  const result = await service.execute();
  assert.deepStrictEqual(result, { success: true });
});
`;
}

function generateRouteTypeScript(name: string): string {
  return `/**
 * ${name} Route
 * Generated by Cortex CLI
 */

import type { IncomingMessage, ServerResponse } from 'http';

export async function handleGet(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'GET ${name}' }));
}

export async function handlePost(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'POST ${name}' }));
}

export async function handlePut(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'PUT ${name}' }));
}

export async function handleDelete(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'DELETE ${name}' }));
}
`;
}

function generateRouteJavaScript(name: string): string {
  return `/**
 * ${name} Route
 * Generated by Cortex CLI
 */

export async function handleGet(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'GET ${name}' }));
}

export async function handlePost(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'POST ${name}' }));
}

export async function handlePut(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'PUT ${name}' }));
}

export async function handleDelete(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'DELETE ${name}' }));
}
`;
}

function generateRouteTestTypeScript(name: string): string {
  return `/**
 * ${name} Route Tests
 * Generated by Cortex CLI
 */

import { describe, it, expect, vi } from 'vitest';
import { handleGet, handlePost, handlePut, handleDelete } from './${name.replace(/^\//, '').replace(/\//g, '-')}.js';

describe('${name} Routes', () => {
  it('should handle GET request', async () => {
    const req = {} as any;
    const res = {
      writeHead: vi.fn(),
      end: vi.fn(),
    } as any;

    await handleGet(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
    expect(res.end).toHaveBeenCalled();
  });

  it('should handle POST request', async () => {
    const req = {} as any;
    const res = {
      writeHead: vi.fn(),
      end: vi.fn(),
    } as any;

    await handlePost(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
    expect(res.end).toHaveBeenCalled();
  });
});
`;
}

function generateRouteTestJavaScript(name: string): string {
  return `/**
 * ${name} Route Tests
 * Generated by Cortex CLI
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { handleGet, handlePost } from './${name.replace(/^\//, '').replace(/\//g, '-')}.js';

test('${name} - should handle GET request', async () => {
  const req = {};
  const res = {
    writeHead: () => {},
    end: (data) => {
      const parsed = JSON.parse(data);
      assert.strictEqual(parsed.message, 'GET ${name}');
    },
  };

  await handleGet(req, res);
});

test('${name} - should handle POST request', async () => {
  const req = {};
  const res = {
    writeHead: () => {},
    end: (data) => {
      const parsed = JSON.parse(data);
      assert.strictEqual(parsed.message, 'POST ${name}');
    },
  };

  await handlePost(req, res);
});
`;
}
