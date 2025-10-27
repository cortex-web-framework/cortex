import { strict as assert } from 'assert';
import { server } from '../src/backend/server.js'; // Import the server instance
import * as http from 'http';
import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let totalTests = 0;
let passedTests = 0;

async function runTest(name: string, fn: () => void | Promise<void>, timeoutMs: number = 5000) {
  totalTests++;
  const timeoutId = setTimeout(() => {
    console.error(`✗ ${name} (Timed out after ${timeoutMs}ms)`);
    process.exit(1);
  }, timeoutMs);

  try {
    const result = fn();
    if (result instanceof Promise) {
      await result; // Await the promise
    }
    clearTimeout(timeoutId);
    console.log(`✓ ${name}`);
    passedTests++;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`✗ ${name}`);
    console.error(error);
    process.exit(1);
  }
}

// Test definitions
runTest('Server initializes correctly', () => {
  assert.ok(server, 'CortexHttpServer should be initialized');
});

/*
runTest('Serves static files correctly', async () => {
  const testPort = 3002; // Use a different port for this test
  const testServer = server; // Use the exported server instance
  // Temporarily change the port for this test
  (testServer as any).port = testPort;

  await testServer.start();
  console.log(`Test server listening on port ${testPort}`);

  try {
    const response = await new Promise<string>((resolve, reject) => {
      http.get(`http://localhost:${testPort}/test.html`, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
        res.on('error', (err) => {
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
    assert.strictEqual(response.trim(), '<h1>Test Static File</h1>', 'Static file content should match');
  } finally {
    await testServer.stop();
    console.log(`Test server closed on port ${testPort}`);
  }
});
*/

// After all tests are defined, run them and exit
(async () => {
  // This is a placeholder for running all tests.
  // In a real test runner, you'd collect all test functions and run them sequentially or in parallel.
  // For now, we're just calling the defined tests directly.
  // The `runTest` function already handles `process.exit(1)` on failure.
  // If we reach here, all tests defined so far have passed.
  if (totalTests === passedTests) {
    console.log(`\nAll ${totalTests} tests passed.`);
    // Stop the server if it was started by any test
    try {
      await server.stop();
      console.log('CortexHttpServer stopped successfully.');
    } catch (error) {
      console.error('Error stopping CortexHttpServer:', error);
    }
    process.exit(0);
  } else {
    console.error(`\n${passedTests}/${totalTests} tests passed. Some tests failed.`);
    // Stop the server if it was started by any test
    try {
      await server.stop();
      console.log('CortexHttpServer stopped successfully.');
    } catch (error) {
      console.error('Error stopping CortexHttpServer:', error);
    }
    process.exit(1);
  }
})();