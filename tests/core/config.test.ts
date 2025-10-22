import { test } from 'node:test';
import assert from 'node:assert';
import { Config } from '../../src/core/config.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_CONFIG_DIR = path.join(__dirname, 'temp_config');

// Helper to create temporary config files
const createConfigFile = (filename: string, content: any) => {
  if (!fs.existsSync(TEST_CONFIG_DIR)) {
    fs.mkdirSync(TEST_CONFIG_DIR);
  }
  fs.writeFileSync(path.join(TEST_CONFIG_DIR, filename), JSON.stringify(content));
};

// Helper to clean up temporary config files
const cleanupConfigFiles = () => {
  if (fs.existsSync(TEST_CONFIG_DIR)) {
    fs.rmSync(TEST_CONFIG_DIR, { recursive: true, force: true });
  }
};

test.beforeEach(() => {
  cleanupConfigFiles();
  // Clear process.env for consistent testing
  for (const key in process.env) {
    if (key.startsWith('CORTEX_')) {
      delete process.env[key];
    }
  }
  // Reset the singleton instance of Config
  (Config as any).instance = undefined;
});

test.afterEach(() => {
  cleanupConfigFiles();
  // Reset the singleton instance of Config
  (Config as any).instance = undefined;
});

test('Config should load from default.json', () => {
  createConfigFile('default.json', { app: { port: 3000 } });
  const config = Config.getInstance(TEST_CONFIG_DIR);
  assert.strictEqual(config.get('app.port'), 3000, 'Should load port from default.json');
});

test('Config should load from environment-specific file', () => {
  process.env["NODE_ENV"] = 'development';
  createConfigFile('default.json', { app: { port: 3000 } });
  createConfigFile('development.json', { app: { port: 4000 } });
  const config = Config.getInstance(TEST_CONFIG_DIR);
  assert.strictEqual(config.get('app.port'), 4000, 'Should load port from development.json');
});

test('Config should prioritize environment variables', () => {
  process.env["NODE_ENV"] = 'production';
  process.env["CORTEX_APP_PORT"] = '5000'; // Environment variable
  createConfigFile('default.json', { app: { port: 3000 } });
  createConfigFile('production.json', { app: { port: 4000 } });
  const config = Config.getInstance(TEST_CONFIG_DIR);
  assert.strictEqual(config.get('app.port'), '5000', 'Should prioritize environment variable');
});

test('Config should return undefined for non-existent key', () => {
  const config = Config.getInstance(TEST_CONFIG_DIR);
  assert.strictEqual(config.get('non.existent.key'), undefined, 'Should return undefined for non-existent key');
});

test('Config should return default value for non-existent key', () => {
  const config = Config.getInstance(TEST_CONFIG_DIR);
  assert.strictEqual(config.get('non.existent.key', 'default'), 'default', 'Should return provided default value');
});

test('Config should handle nested properties', () => {
  createConfigFile('default.json', { db: { host: 'localhost', port: 5432 } });
  const config = Config.getInstance(TEST_CONFIG_DIR);
  assert.strictEqual(config.get('db.host'), 'localhost', 'Should get nested host');
  assert.strictEqual(config.get('db.port'), 5432, 'Should get nested port');
});

test('Config should merge configurations correctly', () => {
  createConfigFile('default.json', { app: { name: 'Cortex' }, db: { host: 'localhost' } });
  process.env["NODE_ENV"] = 'development';
  createConfigFile('development.json', { app: { version: '1.0' }, db: { port: 5432 } });
  const config = Config.getInstance(TEST_CONFIG_DIR);
  assert.strictEqual(config.get('app.name'), 'Cortex', 'Should get app.name from default');
  assert.strictEqual(config.get('app.version'), '1.0', 'Should get app.version from development');
  assert.strictEqual(config.get('db.host'), 'localhost', 'Should get db.host from default');
  assert.strictEqual(config.get('db.port'), 5432, 'Should get db.port from development');
});
