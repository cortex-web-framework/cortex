import { strict as assert } from 'assert';
import { FeatureActor, Feature } from '../src/backend/features/featureActor.js';

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

const featureActor = new FeatureActor();

(async () => {
  await test('FeatureActor: Get all features', async () => {
    const response = await featureActor.handle({
      type: 'get-features',
    });

    assert.strictEqual(response.success, true, 'Should succeed');
    assert.ok(Array.isArray(response.data), 'Should return array');
    assert.ok((response.data as Feature[]).length > 0, 'Should have features');
  });

  await test('FeatureActor: Filter features by category', async () => {
    const response = await featureActor.handle({
      type: 'get-features',
      category: 'core',
    });

    assert.strictEqual(response.success, true, 'Should succeed');
    const features = response.data as Feature[];
    features.forEach(f => {
      assert.strictEqual(f.category, 'core', 'All features should be core');
    });
  });

  await test('FeatureActor: List categories', async () => {
    const response = await featureActor.handle({
      type: 'list-categories',
    });

    assert.strictEqual(response.success, true, 'Should succeed');
    assert.ok(Array.isArray(response.data), 'Should return array');
    assert.ok(response.metadata?.categories, 'Should have category counts');
  });

  await test('FeatureActor: Get specific feature', async () => {
    // First get all features to get an ID
    const allResponse = await featureActor.handle({
      type: 'get-features',
    });

    const featureId = (allResponse.data as Feature[])[0].id;

    const response = await featureActor.handle({
      type: 'get-feature',
      id: featureId,
    });

    assert.strictEqual(response.success, true, 'Should succeed');
    const feature = response.data as Feature;
    assert.strictEqual(feature.id, featureId, 'Should return correct feature');
  });

  if (totalTests === passedTests) {
    console.log(`\nAll ${totalTests} tests passed.`);
    process.exit(0);
  } else {
    console.error(`\n${passedTests}/${totalTests} tests passed.`);
    process.exit(1);
  }
})();
