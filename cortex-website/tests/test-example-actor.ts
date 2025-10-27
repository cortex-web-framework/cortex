import { strict as assert } from 'assert';
import { ExampleActor, CodeExample } from '../src/backend/examples/exampleActor.js';

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

const exampleActor = new ExampleActor();

(async () => {
  await test('ExampleActor: Get all examples', async () => {
    const response = await exampleActor.handle({
      type: 'get-examples',
    });

    assert.strictEqual(response.success, true, 'Should succeed');
    assert.ok(Array.isArray(response.data), 'Should return array');
    assert.ok((response.data as CodeExample[]).length > 0, 'Should have examples');
  });

  await test('ExampleActor: Filter examples by category', async () => {
    const response = await exampleActor.handle({
      type: 'get-examples',
      category: 'actor',
    });

    assert.strictEqual(response.success, true, 'Should succeed');
    const examples = response.data as CodeExample[];
    examples.forEach(e => {
      assert.strictEqual(e.category, 'actor', 'All examples should be actor category');
    });
  });

  await test('ExampleActor: Get specific example', async () => {
    const allResponse = await exampleActor.handle({
      type: 'get-examples',
    });

    const exampleId = (allResponse.data as CodeExample[])[0].id;

    const response = await exampleActor.handle({
      type: 'get-example',
      id: exampleId,
    });

    assert.strictEqual(response.success, true, 'Should succeed');
    const example = response.data as CodeExample;
    assert.strictEqual(example.id, exampleId, 'Should return correct example');
    assert.ok(example.code, 'Should have code');
    assert.ok(example.expectedOutput, 'Should have expected output');
  });

  await test('ExampleActor: Run example', async () => {
    const allResponse = await exampleActor.handle({
      type: 'get-examples',
    });

    const exampleId = (allResponse.data as CodeExample[])[0].id;

    const response = await exampleActor.handle({
      type: 'run-example',
      id: exampleId,
    });

    assert.strictEqual(response.success, true, 'Should succeed');
    assert.ok(response.output, 'Should return output');
    assert.ok(response.message, 'Should have success message');
  });

  await test('ExampleActor: Search examples', async () => {
    const response = await exampleActor.handle({
      type: 'search',
      query: 'actor',
    });

    assert.strictEqual(response.success, true, 'Should succeed');
    assert.ok(Array.isArray(response.data), 'Should return array');
  });

  await test('ExampleActor: List categories', async () => {
    const response = await exampleActor.handle({
      type: 'list-categories',
    });

    assert.strictEqual(response.success, true, 'Should succeed');
    assert.ok(Array.isArray(response.data), 'Should return array');
    assert.ok(response.metadata?.categories, 'Should have category counts');
  });

  if (totalTests === passedTests) {
    console.log(`\nAll ${totalTests} tests passed.`);
    process.exit(0);
  } else {
    console.error(`\n${passedTests}/${totalTests} tests passed.`);
    process.exit(1);
  }
})();
