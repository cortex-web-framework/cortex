import { test } from 'node:test';
import assert from 'node:assert';
import { HealthCheckRegistry } from '../../../src/observability/health/healthRegistry.js';
import { HealthStatus } from '../../../src/observability/types.js';

// Mock health check for testing
class MockHealthCheck {
  public readonly name: string;
  private shouldFail = false;
  private shouldDegrade = false;

  constructor(name = 'mock-check', shouldFail = false, shouldDegrade = false) {
    this.name = name;
    this.shouldFail = shouldFail;
    this.shouldDegrade = shouldDegrade;
  }

  async check() {
    if (this.shouldFail) {
      throw new Error('Health check failed');
    }

    const status = this.shouldDegrade ? HealthStatus.DEGRADED : HealthStatus.UP;
    return {
      status,
      message: 'Mock health check',
      timestamp: Date.now(),
      details: { test: true },
    };
  }
}

test('HealthCheckRegistry should register health checks', () => {
  const registry = new HealthCheckRegistry();
  const check = new MockHealthCheck();

  registry.register(check);

  assert.strictEqual(registry.getChecks().length, 1);
  assert.strictEqual(registry.getCheckNames()[0], 'mock-check');
});

test('HealthCheckRegistry should throw error for duplicate registration', () => {
  const registry = new HealthCheckRegistry();
  const check1 = new MockHealthCheck();
  const check2 = new MockHealthCheck();

  registry.register(check1);

  assert.throws(() => {
    registry.register(check2);
  }, /already registered/);
});

test('HealthCheckRegistry should unregister health checks', () => {
  const registry = new HealthCheckRegistry();
  const check = new MockHealthCheck();

  registry.register(check);
  assert.strictEqual(registry.getChecks().length, 1);

  registry.unregister('mock-check');
  assert.strictEqual(registry.getChecks().length, 0);
});

test('HealthCheckRegistry should execute specific health check', async () => {
  const registry = new HealthCheckRegistry();
  const check = new MockHealthCheck();
  registry.register(check);

  const result = await registry.check('mock-check');

  assert.strictEqual(result.status, HealthStatus.UP);
  assert.strictEqual(result.message, 'Mock health check');
  assert.ok(result.timestamp);
});

test('HealthCheckRegistry should throw error for non-existent check', async () => {
  const registry = new HealthCheckRegistry();

  await assert.rejects(async () => {
    await registry.check('non-existent');
  }, /not found/);
});

test('HealthCheckRegistry should execute all health checks', async () => {
  const registry = new HealthCheckRegistry();
  const check1 = new MockHealthCheck('check1');
  const check2 = new MockHealthCheck('check2');
  
  registry.register(check1);
  registry.register(check2);

  const results = await registry.checkAll();

  assert.strictEqual(results.size, 2);
  assert.strictEqual(results.get('check1')?.status, HealthStatus.UP);
  assert.strictEqual(results.get('check2')?.status, HealthStatus.UP);
});

test('HealthCheckRegistry should handle failing health checks', async () => {
  const registry = new HealthCheckRegistry();
  const check = new MockHealthCheck('mock-check', true); // Should fail
  registry.register(check);

  const result = await registry.check('mock-check');

  assert.strictEqual(result.status, HealthStatus.DOWN);
  assert.strictEqual(result.message, 'Health check failed');
});

test('HealthCheckRegistry should calculate overall status correctly', async () => {
  const registry = new HealthCheckRegistry();
  
  // All UP
  const check1 = new MockHealthCheck('check1', false, false);
  registry.register(check1);

  let results = await registry.checkAll();
  let status = registry.getOverallStatus(results);
  assert.strictEqual(status, HealthStatus.UP);

  // One DEGRADED
  const check2 = new MockHealthCheck('check2', false, true);
  registry.register(check2);

  results = await registry.checkAll();
  status = registry.getOverallStatus(results);
  assert.strictEqual(status, HealthStatus.DEGRADED);

  // One DOWN
  const check3 = new MockHealthCheck('check3', true, false);
  registry.register(check3);

  results = await registry.checkAll();
  status = registry.getOverallStatus(results);
  assert.strictEqual(status, HealthStatus.DOWN);
});

test('HealthCheckRegistry should clear all checks', () => {
  const registry = new HealthCheckRegistry();
  const check = new MockHealthCheck();
  
  registry.register(check);
  assert.strictEqual(registry.getChecks().length, 1);

  registry.clear();
  assert.strictEqual(registry.getChecks().length, 0);
});
