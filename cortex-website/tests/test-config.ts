import { strict as assert } from 'assert';
import config from '../src/backend/config.js'; // Import the config instance

let totalTests = 0;
let passedTests = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const result = fn();
    if (result instanceof Promise) {
      await result;
    }
    console.log(`✓ ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
(async () => {
  await test('Config returns undefined for non-existent keys by default', () => {
    assert.strictEqual(config.get('nonExistentKey'), undefined, 'Should return undefined for non-existent key');
  });

  // To test actual config values, we would need to provide config files.
  // For now, we'll rely on the default values being handled by the consumers (e.g., server.ts)

  // Exit cleanly after all tests
  if (totalTests === passedTests) {
    console.log(`\nAll ${totalTests} tests passed.`);
    process.exit(0);
  } else {
    console.error(`\n${passedTests}/${totalTests} tests passed. Some tests failed.`);
    process.exit(1);
  }
})();