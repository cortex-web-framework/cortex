import { strict as assert } from 'assert';
import { BlogServiceActor } from '../src/backend/blog/blogServiceActor.js';

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

// Initialize a test service actor
const service = new BlogServiceActor();

(async () => {
  // Initialize sample data first
  await test('BlogServiceActor: Initialize sample data', async () => {
    const response = await service.handle({
      type: 'init-sample-data',
    });

    assert.strictEqual(response.success, true, 'Initialization should succeed');
  });

  // Test: Get categories
  await test('BlogServiceActor: Get categories', async () => {
    const response = await service.handle({
      type: 'categories',
    });

    assert.strictEqual(response.success, true, 'Getting categories should succeed');
    assert.ok(Array.isArray(response.data), 'Response should contain categories array');
    assert.ok(response.metadata?.categories, 'Should have category counts');
  });

  // Test: Get featured posts
  await test('BlogServiceActor: Get featured posts', async () => {
    const response = await service.handle({
      type: 'featured',
      count: 3,
    });

    assert.strictEqual(response.success, true, 'Getting featured posts should succeed');
    assert.ok(Array.isArray(response.data), 'Response should contain posts array');
  });

  // Test: Get latest posts
  await test('BlogServiceActor: Get latest posts', async () => {
    const response = await service.handle({
      type: 'latest',
      count: 5,
    });

    assert.strictEqual(response.success, true, 'Getting latest posts should succeed');
    assert.ok(Array.isArray(response.data), 'Response should contain posts array');
  });

  // Test: Get trending posts
  await test('BlogServiceActor: Get trending posts', async () => {
    const response = await service.handle({
      type: 'trending',
      count: 5,
    });

    assert.strictEqual(response.success, true, 'Getting trending posts should succeed');
    assert.ok(Array.isArray(response.data), 'Response should contain posts array');
  });

  // Test: Search posts
  await test('BlogServiceActor: Search posts', async () => {
    const response = await service.handle({
      type: 'search',
      query: {
        search: 'Cortex',
        limit: 10,
        offset: 0,
      },
    });

    assert.strictEqual(response.success, true, 'Search should succeed');
    assert.ok(Array.isArray(response.data), 'Response should contain posts array');
    assert.ok(response.metadata?.total !== undefined, 'Should have total count');
  });

  // Test: Filter by category
  await test('BlogServiceActor: Filter by category', async () => {
    const response = await service.handle({
      type: 'search',
      query: {
        category: 'tutorial',
        limit: 10,
      },
    });

    assert.strictEqual(response.success, true, 'Category filter should succeed');
    assert.ok(Array.isArray(response.data), 'Response should contain posts');
  });

  // Test: Pagination
  await test('BlogServiceActor: Pagination', async () => {
    const response = await service.handle({
      type: 'search',
      query: {
        limit: 2,
        offset: 0,
      },
    });

    assert.strictEqual(response.success, true, 'Pagination should succeed');
    assert.ok(response.metadata?.limit === 2, 'Should respect limit');
    assert.ok(response.metadata?.offset === 0, 'Should respect offset');
  });

  // Test: Sorting
  await test('BlogServiceActor: Sort by date', async () => {
    const response = await service.handle({
      type: 'search',
      query: {
        sortBy: 'date',
        sortOrder: 'desc',
      },
    });

    assert.strictEqual(response.success, true, 'Sorting should succeed');
    assert.ok(Array.isArray(response.data), 'Response should contain posts');
  });

  // Exit after all tests
  if (totalTests === passedTests) {
    console.log(`\nAll ${totalTests} tests passed.`);
    process.exit(0);
  } else {
    console.error(`\n${passedTests}/${totalTests} tests passed. Some tests failed.`);
    process.exit(1);
  }
})();
