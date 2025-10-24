/**
 * Simple, zero-dependency test runner
 * No Jest, Mocha, Vitest - just pure TypeScript
 */

import { AssertionError } from './assertions.js';

interface TestCase {
  name: string;
  fn: () => void | Promise<void>;
  skip?: boolean;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
  beforeEachFn?: () => void | Promise<void>;
  afterEachFn?: () => void | Promise<void>;
  skip?: boolean;
}

interface TestResult {
  passed: boolean;
  total: number;
  failed: number;
  skipped: number;
  duration: number;
  failures: FailureDetail[];
}

interface FailureDetail {
  suite: string;
  test: string;
  error: string;
  stack?: string;
}

/**
 * Global test registry
 */
let currentSuite: TestSuite | null = null;
const suites: TestSuite[] = [];
let beforeEachFn: (() => void | Promise<void>) | null = null;
let afterEachFn: (() => void | Promise<void>) | null = null;

/**
 * Register a test suite
 * @param name Suite name
 * @param fn Suite function
 */
export function describe(name: string, fn: () => void): void {
  const suite: TestSuite = {
    name,
    tests: [],
    beforeEachFn,
    afterEachFn,
  };

  const previousSuite = currentSuite;
  currentSuite = suite;

  fn();

  currentSuite = previousSuite;
  suites.push(suite);
}

/**
 * Skip a test suite
 * @param name Suite name
 * @param fn Suite function
 */
export function describe_skip(name: string, fn: () => void): void {
  const suite: TestSuite = {
    name,
    tests: [],
    skip: true,
  };

  suites.push(suite);
}

/**
 * Register a test case
 * @param name Test name
 * @param fn Test function
 */
export function test(name: string, fn: () => void | Promise<void>): void {
  if (!currentSuite) {
    throw new Error('test() must be called inside describe()');
  }

  currentSuite.tests.push({ name, fn });
}

/**
 * Skip a test case
 * @param name Test name
 * @param fn Test function
 */
export function test_skip(name: string, fn: () => void | Promise<void>): void {
  if (!currentSuite) {
    throw new Error('test_skip() must be called inside describe()');
  }

  currentSuite.tests.push({ name, fn, skip: true });
}

/**
 * Register a before-each hook
 * @param fn Hook function
 */
export function beforeEach(fn: () => void | Promise<void>): void {
  if (currentSuite) {
    currentSuite.beforeEachFn = fn;
  } else {
    beforeEachFn = fn;
  }
}

/**
 * Register an after-each hook
 * @param fn Hook function
 */
export function afterEach(fn: () => void | Promise<void>): void {
  if (currentSuite) {
    currentSuite.afterEachFn = fn;
  } else {
    afterEachFn = fn;
  }
}

/**
 * Run all tests
 */
export async function run(): Promise<TestResult> {
  const startTime = performance.now();
  const failures: FailureDetail[] = [];
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  console.log('\n' + '═'.repeat(70));
  console.log('🧪 Running Tests...\n');

  for (const suite of suites) {
    if (suite.skip) {
      console.log(`⏭️  ${suite.name} (skipped)`);
      for (const test of suite.tests) {
        skipped++;
      }
      continue;
    }

    console.log(`📋 ${suite.name}`);

    for (const testCase of suite.tests) {
      if (testCase.skip) {
        console.log(`  ⏭️  ${testCase.name}`);
        skipped++;
        continue;
      }

      try {
        // Run before-each hook
        if (suite.beforeEachFn) {
          await suite.beforeEachFn();
        }

        // Run test
        await testCase.fn();

        // Run after-each hook
        if (suite.afterEachFn) {
          await suite.afterEachFn();
        }

        console.log(`  ✅ ${testCase.name}`);
        passed++;
      } catch (error) {
        const err = error as Error;
        console.log(`  ❌ ${testCase.name}`);
        console.log(`     ${err.message}`);

        failed++;
        failures.push({
          suite: suite.name,
          test: testCase.name,
          error: err.message,
          stack: err.stack,
        });
      }
    }

    console.log();
  }

  const duration = performance.now() - startTime;
  const total = passed + failed + skipped;

  console.log('═'.repeat(70));
  console.log('\n📊 Test Results:\n');
  console.log(`  Total:   ${total}`);
  console.log(`  Passed:  ${passed} ✅`);
  console.log(`  Failed:  ${failed} ❌`);
  console.log(`  Skipped: ${skipped} ⏭️`);
  console.log(`  Time:    ${duration.toFixed(2)}ms\n`);

  if (failures.length > 0) {
    console.log('❌ Failures:\n');
    failures.forEach((failure) => {
      console.log(`  ${failure.suite} > ${failure.test}`);
      console.log(`  ${failure.error}\n`);
    });
  }

  if (failed === 0 && passed > 0) {
    console.log('🎉 All tests passed!\n');
  }

  console.log('═'.repeat(70) + '\n');

  return {
    passed,
    total,
    failed,
    skipped,
    duration,
    failures,
  };
}

/**
 * Exit with appropriate code
 * @param result Test result
 */
export function exit(result: TestResult): void {
  process.exit(result.failed > 0 ? 1 : 0);
}

/**
 * Run tests and exit
 */
export async function runAndExit(): Promise<void> {
  const result = await run();
  exit(result);
}

/**
 * Clear all tests (for testing the test runner itself)
 */
export function clear(): void {
  suites.length = 0;
  currentSuite = null;
  beforeEachFn = null;
  afterEachFn = null;
}

/**
 * Get all registered suites (for introspection)
 */
export function getSuites(): TestSuite[] {
  return [...suites];
}

/**
 * Get test count
 */
export function getTestCount(): number {
  return suites.reduce((count, suite) => count + suite.tests.length, 0);
}
