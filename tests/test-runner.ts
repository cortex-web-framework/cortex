/**
 * Simple, zero-dependency test runner
 * No Jest, Mocha, Vitest - just pure TypeScript
 * Integrated with AST-based test serialization (ts-morph)
 */

import { AssertionError } from './assertions.js';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { generateJavaScriptTestCode, extractTestFunctionsFromFile } from './test-serializer.js';

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
  passed: number;
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
var suites: TestSuite[] = [];
var currentSuite: TestSuite | null = null;
let beforeEachFn: (() => void | Promise<void>) | undefined = undefined;
let afterEachFn: (() => void | Promise<void>) | undefined = undefined;

/**
 * Register a test suite
 * @param name Suite name
 * @param fn Suite function
 */
export function describe(name: string, fn: () => void): void {
  const suite: TestSuite = {
    name,
    tests: [],
    beforeEachFn: undefined,
    afterEachFn: undefined,
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

// Custom file discovery function
async function findTestFiles(dir: string): Promise<string[]> {
  let testFiles: string[] = [];
  const files = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      if (file.name !== 'node_modules' && file.name !== 'dist') {
        testFiles = testFiles.concat(await findTestFiles(res));
      }
    } else if (file.name.endsWith('.test.ts')) {
      testFiles.push(res);
    }
  }
  return testFiles;
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

  // Dynamically import all test files
  const testFiles = await findTestFiles(process.cwd());
  for (const file of testFiles) {
    // Convert absolute path to relative path for import
    const relativePath = path.relative(process.cwd(), file);
    await import(`./${relativePath}`);
  }

  let jsCode = '';

  // Map test files to their extracted test functions using AST parsing
  const testFileMap = new Map<string, Map<string, string>>();

  for (const file of testFiles) {
    try {
      const extractedTests = extractTestFunctionsFromFile(file);
      const testMap = new Map<string, string>();

      for (const extracted of extractedTests) {
        testMap.set(extracted.name, extracted.sourceCode);
      }

      testFileMap.set(file, testMap);
    } catch (error) {
      console.warn(`⚠️  Failed to parse test file ${file}: ${error}`);
    }
  }

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

      // Try to find the test body from the extracted test functions
      let testBody = '';
      let foundTest = false;

      for (const [_file, testMap] of testFileMap) {
        if (testMap.has(testCase.name)) {
          testBody = testMap.get(testCase.name) || '';
          foundTest = true;
          break;
        }
      }

      if (!foundTest) {
        // Fallback: use a placeholder if we can't extract the test body
        testBody = `console.warn("Test body not extracted for ${testCase.name}");`;
      }

      // Generate JavaScript code for each test case using the serializer
      jsCode += generateJavaScriptTestCode(testCase.name, testBody, suite.name);
    }
  }

  const rustBrowserProcess = spawn('./cortex-browser-env/target/debug/cortex-browser-env', [jsCode]);

  let stdout = '';
  let stderr = '';

  rustBrowserProcess.stdout.on('data', (data) => {
    stdout += data.toString();
  });

  rustBrowserProcess.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  await new Promise<void>((resolve) => {
    rustBrowserProcess.on('close', (code) => {
      console.log(`Rust browser process exited with code ${code}`);
      if (code !== 0) {
        console.error(`Rust browser process failed: ${stderr}`);
        // If the Rust process itself fails, it's a critical error for all tests
        // For now, we'll just mark all tests as failed if the process exits with non-zero
        // This needs more sophisticated error handling later.
        failed = suites.reduce((acc, suite) => acc + suite.tests.length, 0);
        failures.push({
          suite: "Rust Browser Env",
          test: "Process Crash",
          error: `Rust browser process exited with code ${code}. Stderr: ${stderr}` || "Unknown error",
          stack: undefined,
        });
      }
      resolve();
    });
  });

  // Basic parsing of the output from the Rust browser env
  const lines = stdout.split('\n');
  for (const line of lines) {
    if (line.startsWith('Test Result: ')) {
      const parts = line.substring('Test Result: '.length).split(' - ');
      if (parts.length === 2) {
        const name = parts[0];
        const status = parts[1];
        if (status === 'PASSED') {
          passed++;
        } else if (status === 'FAILED') {
          failed++;
          failures.push({
            suite: "Rust Browser Env", // Placeholder
            test: name,
            error: "Test failed in Rust browser environment", // Placeholder
            stack: undefined,
          });
        }
      }
    }
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
 * @param result Test Result
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
  beforeEachFn = undefined;
  afterEachFn = undefined;
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
