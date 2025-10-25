/**
 * TDD Test Framework - Zero Dependencies
 * Super Clean Code with Strict TypeScript
 */

interface TestResult {
  readonly name: string;
  readonly passed: boolean;
  readonly error?: string;
  readonly duration: number;
}

interface TestSuite {
  readonly name: string;
  readonly tests: TestResult[];
  readonly totalDuration: number;
  readonly passed: number;
  readonly failed: number;
}

class TestFramework {
  private tests: Array<() => void> = [];
  private currentTestName: string = '';
  private results: TestResult[] = [];

  describe(suiteName: string, testFunction: () => void): void {
    console.log(`\n🧪 Test Suite: ${suiteName}`);
    this.tests = [];
    this.results = [];
    
    testFunction();
    
    this.runTests(suiteName);
  }

  it(testName: string, testFunction: () => void): void {
    this.tests.push(() => {
      this.currentTestName = testName;
      const startTime = performance.now();
      
      try {
        testFunction();
        const endTime = performance.now();
        this.results.push({
          name: testName,
          passed: true,
          duration: endTime - startTime
        });
        console.log(`  ✅ ${testName} (${(endTime - startTime).toFixed(2)}ms)`);
      } catch (error) {
        const endTime = performance.now();
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.results.push({
          name: testName,
          passed: false,
          error: errorMessage,
          duration: endTime - startTime
        });
        console.log(`  ❌ ${testName} - ${errorMessage} (${(endTime - startTime).toFixed(2)}ms)`);
      }
    });
  }

  private runTests(suiteName: string): void {
    this.tests.forEach(test => test());
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`\n📊 ${suiteName} Results:`);
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  ⏱️  Total Duration: ${totalDuration.toFixed(2)}ms`);
    
    if (failed > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }
  }

  // Assertion Methods
  expect(actual: unknown): AssertionMethods {
    const assertion = new AssertionMethods(actual, this.currentTestName);
    return assertion;
  }
}

class AssertionMethods {
  constructor(
    private readonly actual: unknown,
    private readonly testName: string,
    private readonly isNot: boolean = false
  ) {}

  toBe(expected: unknown): void {
    const isEqual = this.actual === expected;
    if (this.isNot ? isEqual : !isEqual) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'not ' : ''}to be ${expected}`);
    }
  }

  toEqual(expected: unknown): void {
    const isEqual = JSON.stringify(this.actual) === JSON.stringify(expected);
    if (this.isNot ? isEqual : !isEqual) {
      throw new Error(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'not ' : ''}to equal ${JSON.stringify(expected)}`);
    }
  }

  toBeTruthy(): void {
    const isTruthy = !!this.actual;
    if (this.isNot ? isTruthy : !isTruthy) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'not ' : ''}to be truthy`);
    }
  }

  toBeFalsy(): void {
    const isFalsy = !this.actual;
    if (this.isNot ? isFalsy : !isFalsy) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'not ' : ''}to be falsy`);
    }
  }

  toContain(expected: unknown): void {
    if (Array.isArray(this.actual)) {
      const contains = this.actual.includes(expected as never);
      if (this.isNot ? contains : !contains) {
        throw new Error(`Expected array ${this.isNot ? 'not ' : ''}to contain ${expected}`);
      }
    } else if (typeof this.actual === 'string') {
      const contains = this.actual.includes(String(expected));
      if (this.isNot ? contains : !contains) {
        throw new Error(`Expected string ${this.isNot ? 'not ' : ''}to contain ${expected}`);
      }
    } else {
      throw new Error(`Expected ${typeof this.actual} ${this.isNot ? 'not ' : ''}to contain ${expected}`);
    }
  }

  toThrow(expectedError?: string): void {
    if (typeof this.actual !== 'function') {
      throw new Error(`Expected function to throw, but got ${typeof this.actual}`);
    }
    
    try {
      (this.actual as () => void)();
      throw new Error(`Expected function to throw`);
    } catch (error) {
      if (expectedError && error instanceof Error && !error.message.includes(expectedError)) {
        throw new Error(`Expected error message to contain "${expectedError}", but got "${error.message}"`);
      }
    }
  }

  toBeUndefined(): void {
    if (this.actual !== undefined) {
      throw new Error(`Expected ${this.actual} to be undefined`);
    }
  }

  toBeDefined(): void {
    if (this.actual === undefined) {
      throw new Error(`Expected ${this.actual} to be defined`);
    }
  }

  toBeGreaterThan(expected: number): void {
    if (typeof this.actual !== 'number') {
      throw new Error(`Expected ${this.actual} to be a number`);
    }
    const isGreater = this.actual > expected;
    if (this.isNot ? isGreater : !isGreater) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'not ' : ''}to be greater than ${expected}`);
    }
  }

  toBeLessThan(expected: number): void {
    if (typeof this.actual !== 'number') {
      throw new Error(`Expected ${this.actual} to be a number`);
    }
    const isLess = this.actual < expected;
    if (this.isNot ? isLess : !isLess) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'not ' : ''}to be less than ${expected}`);
    }
  }

  toMatch(regex: RegExp): void {
    if (typeof this.actual !== 'string') {
      throw new Error(`Expected ${this.actual} to be a string`);
    }
    const matches = regex.test(this.actual);
    if (this.isNot ? matches : !matches) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'not ' : ''}to match ${regex}`);
    }
  }

  get not(): AssertionMethods {
    return new AssertionMethods(this.actual, this.testName, true);
  }
}

// Global test framework instance
const test = new TestFramework();

// Export for use in test files
export { test, TestFramework, type TestResult, type TestSuite };