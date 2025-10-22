# Compile-First Testing Approach - Comprehensive Validation Strategy

## Executive Summary

This document provides a complete validation strategy for transitioning from `ts-node/esm` loader-based testing to a compile-first approach using TypeScript's native compilation.

**Current State:**
- 37 test files
- 262 tests total (55 suites)
- 251 passing, 11 failing (baseline failures, not related to compile approach)
- Using `node --loader ts-node/esm --test` (deprecated loader)
- Significant ExperimentalWarning noise

**Target State:**
- Pre-compile TypeScript tests to JavaScript
- Run compiled tests with native Node.js test runner
- Eliminate experimental loader warnings
- Maintain or improve test execution speed
- All 251 currently passing tests continue to pass

---

## 1. PRE-IMPLEMENTATION VALIDATION

### 1.1 Baseline State Capture

**Purpose:** Establish a known good state to compare against after implementation.

#### Commands (Copy-Paste Ready):

```bash
# 1. Create validation workspace
mkdir -p /tmp/cortex-validation
cd /home/matthias/projects/cortex

# 2. Capture current git state
git status --porcelain > /tmp/cortex-validation/git-status-before.txt
git diff > /tmp/cortex-validation/git-diff-before.txt
git log -1 --oneline > /tmp/cortex-validation/git-commit-before.txt

# 3. Run baseline test suite and capture output
npm test 2>&1 | tee /tmp/cortex-validation/baseline-test-output.txt

# 4. Extract baseline metrics
echo "=== BASELINE METRICS ===" > /tmp/cortex-validation/baseline-metrics.txt
grep "# tests" /tmp/cortex-validation/baseline-test-output.txt >> /tmp/cortex-validation/baseline-metrics.txt
grep "# pass" /tmp/cortex-validation/baseline-test-output.txt >> /tmp/cortex-validation/baseline-metrics.txt
grep "# fail" /tmp/cortex-validation/baseline-test-output.txt >> /tmp/cortex-validation/baseline-metrics.txt
grep "# duration_ms" /tmp/cortex-validation/baseline-test-output.txt >> /tmp/cortex-validation/baseline-metrics.txt

# 5. Count experimental warnings
grep -c "ExperimentalWarning" /tmp/cortex-validation/baseline-test-output.txt > /tmp/cortex-validation/baseline-warning-count.txt

# 6. Identify currently failing tests
grep "not ok.*\.test\.ts" /tmp/cortex-validation/baseline-test-output.txt | grep -oP "/home/matthias/projects/cortex/tests/[^\s]+" | sort > /tmp/cortex-validation/baseline-failing-tests.txt

# 7. Count test files
find tests -name "*.test.ts" -type f | wc -l > /tmp/cortex-validation/baseline-test-file-count.txt

# 8. Backup critical files
cp package.json /tmp/cortex-validation/package.json.backup
cp tsconfig.json /tmp/cortex-validation/tsconfig.json.backup

# 9. Display baseline summary
echo -e "\n=== BASELINE SUMMARY ==="
echo "Git commit: $(cat /tmp/cortex-validation/git-commit-before.txt)"
echo "Test files: $(cat /tmp/cortex-validation/baseline-test-file-count.txt)"
echo "Experimental warnings: $(cat /tmp/cortex-validation/baseline-warning-count.txt)"
cat /tmp/cortex-validation/baseline-metrics.txt
```

#### Expected Output:

```
=== BASELINE SUMMARY ===
Git commit: 1d07625 feat(observability): Add metrics module exports
Test files: 37
Experimental warnings: 37
=== BASELINE METRICS ===
# tests 262
# pass 251
# fail 11
# duration_ms 13486.46285
```

#### Success Criteria:
- ✅ All commands execute without errors
- ✅ Baseline metrics captured: 262 tests, 251 passing, 11 failing
- ✅ 37 ExperimentalWarnings documented
- ✅ 11 failing tests identified (known baseline failures)
- ✅ All backup files created successfully

#### Failure Indicators:
- ❌ Test execution crashes or hangs
- ❌ Unable to parse test output
- ❌ Backup creation fails (disk space issue)

### 1.2 TypeScript Configuration Validation

**Purpose:** Verify TypeScript is properly configured and can compile the test files.

#### Commands:

```bash
# 1. Check TypeScript version
npx tsc --version

# 2. Verify current tsconfig.json excludes tests
cat tsconfig.json | grep -A 1 "exclude"

# 3. Test compilation of a single test file (without creating output)
npx tsc --noEmit tests/environment.test.ts

# 4. Check for TypeScript errors in source code
npx tsc --noEmit

# 5. Verify all test files have .ts extension
find tests -name "*.test.js" -type f | wc -l  # Should be 0
find tests -name "*.test.ts" -type f | wc -l  # Should be 37
```

#### Expected Output:

```
Version 5.9.3
"exclude": ["node_modules", "tests", "dist"]
(no output for noEmit checks = success)
0
37
```

#### Success Criteria:
- ✅ TypeScript 5.9.3 or higher installed
- ✅ Tests currently excluded from main compilation
- ✅ Source code compiles without errors
- ✅ All test files are TypeScript (.ts)

#### Failure Indicators:
- ❌ TypeScript version too old (< 5.0)
- ❌ Compilation errors in source code
- ❌ Mixed .js and .ts test files

### 1.3 Module Resolution Validation

**Purpose:** Ensure import paths are compatible with ESM compilation.

#### Commands:

```bash
# 1. Check for problematic import patterns
echo "=== Checking for bare .ts imports (should be .js) ==="
grep -r "from.*\.ts['\"]" tests/ | head -20

# 2. Check for relative imports without extensions
echo -e "\n=== Checking for missing extensions ==="
grep -r "from '\.\./.*[^\.js|\.ts]'" tests/ | head -20

# 3. Check for node: protocol usage
echo -e "\n=== Checking node: imports ==="
grep -r "from 'node:" tests/ | wc -l

# 4. Verify package.json type is module
echo -e "\n=== Verifying ESM configuration ==="
cat package.json | grep '"type"'
```

#### Expected Output:

```
=== Checking for bare .ts imports (should be .js) ===
(Multiple lines expected - this is a known issue that will be fixed)

=== Checking for missing extensions ===
(Some lines may appear)

=== Checking node: imports ===
37

=== Verifying ESM configuration ===
  "type": "module",
```

#### Success Criteria:
- ✅ Package.json has `"type": "module"`
- ✅ node: protocol imports identified
- ✅ Import patterns documented for review

#### Failure Indicators:
- ❌ Missing `"type": "module"`
- ❌ CommonJS require() statements found

---

## 2. IMPLEMENTATION VALIDATION

### Phase 2.1: Create tsconfig.test.json

**Purpose:** Create a separate TypeScript configuration for compiling tests.

#### Commands:

```bash
# 1. Create tsconfig.test.json
cat > tsconfig.test.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist-tests",
    "rootDir": ".",
    "noEmit": false
  },
  "include": ["tests/**/*.test.ts", "src/**/*.ts"],
  "exclude": ["node_modules", "dist", "dist-tests"]
}
EOF

# 2. Verify file was created
ls -lh tsconfig.test.json

# 3. Validate JSON syntax
npx tsc --project tsconfig.test.json --noEmit --listFiles | head -20

# 4. Count files that will be compiled
npx tsc --project tsconfig.test.json --listFiles --noEmit 2>&1 | grep -c "\.ts$"
```

#### Expected Output:

```
-rw-r--r-- 1 user user 230 Oct 22 10:00 tsconfig.test.json
(List of TypeScript files being processed)
(Number between 80-150 files)
```

#### Success Criteria:
- ✅ tsconfig.test.json created successfully
- ✅ Valid JSON syntax
- ✅ Extends base tsconfig.json
- ✅ Includes both tests and src files
- ✅ No TypeScript compilation errors

#### Failure Indicators:
- ❌ JSON syntax error
- ❌ File not created
- ❌ TypeScript errors during validation

### Phase 2.2: Test Compilation (Dry Run)

**Purpose:** Verify TypeScript can compile tests without errors.

#### Commands:

```bash
# 1. Attempt compilation (create dist-tests directory)
npx tsc --project tsconfig.test.json

# 2. Check compilation succeeded
echo "Exit code: $?"

# 3. Verify output directory structure
ls -la dist-tests/tests/ | head -20

# 4. Count compiled test files
find dist-tests/tests -name "*.test.js" -type f | wc -l

# 5. Check for source maps
find dist-tests/tests -name "*.test.js.map" -type f | wc -l

# 6. Inspect a compiled test file
head -20 dist-tests/tests/environment.test.js

# 7. Verify import paths are correct (.js extensions)
grep "from.*\.js" dist-tests/tests/environment.test.js
```

#### Expected Output:

```
Exit code: 0
(Directory listing showing compiled files)
37
37
(Compiled JavaScript code)
import ... from '../../src/...js';
```

#### Success Criteria:
- ✅ Compilation succeeds (exit code 0)
- ✅ dist-tests directory created
- ✅ 37 .test.js files generated
- ✅ 37 .test.js.map files generated
- ✅ Import paths have .js extensions
- ✅ Source code also compiled to dist-tests/src

#### Failure Indicators:
- ❌ Compilation errors (exit code 1)
- ❌ Missing output files
- ❌ Import paths incorrect (.ts instead of .js)
- ❌ Source maps missing

### Phase 2.3: Single Test Execution

**Purpose:** Validate compiled tests can be executed with Node.js native test runner.

#### Commands:

```bash
# 1. Run a single simple test file
node --test dist-tests/tests/environment.test.js

# 2. Check exit code
echo "Exit code: $?"

# 3. Verify no experimental warnings
node --test dist-tests/tests/environment.test.js 2>&1 | grep -c "ExperimentalWarning"

# 4. Try a more complex test
node --test dist-tests/tests/core/eventBus.test.js

# 5. Try a test with imports
node --test dist-tests/tests/observability/metrics/counter.test.js

# 6. Capture output for comparison
node --test dist-tests/tests/environment.test.js 2>&1 | tee /tmp/cortex-validation/single-test-output.txt
```

#### Expected Output:

```
TAP version 13
# Subtest: NodeEnvironment should check if we're in Node.js
ok 1 - NodeEnvironment should check if we're in Node.js
...
1..1
# tests 1
# pass 1
# fail 0
Exit code: 0
0 (no experimental warnings)
```

#### Success Criteria:
- ✅ Test executes successfully
- ✅ No ExperimentalWarnings
- ✅ TAP output is clean
- ✅ Exit code is 0 for passing tests
- ✅ Imports resolve correctly

#### Failure Indicators:
- ❌ Module resolution errors (Cannot find module)
- ❌ Experimental warnings still present
- ❌ Runtime errors
- ❌ Test failures that don't occur with ts-node

### Phase 2.4: Update package.json Scripts

**Purpose:** Replace the test script with compile-first approach.

#### Commands:

```bash
# 1. Backup current package.json (already done in pre-validation)
cp package.json /tmp/cortex-validation/package.json.before-script-change

# 2. Create new test scripts
# Manually edit package.json or use this automated approach:
cat > /tmp/update-scripts.js << 'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts['test:compile'] = 'tsc --project tsconfig.test.json';
pkg.scripts['test:run'] = 'node --test dist-tests/tests/**/*.test.js';
pkg.scripts['test'] = 'npm run test:compile && npm run test:run';
pkg.scripts['test:watch'] = 'tsc --project tsconfig.test.json --watch';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
EOF

node /tmp/update-scripts.js

# 3. Verify changes
git diff package.json

# 4. Display new scripts
cat package.json | grep -A 5 '"scripts"'
```

#### Expected Output:

```diff
-    "test": "node --loader ts-node/esm --test $(find tests -name '*.test.ts' -not -path 'tests/web3/smartContracts.test.ts' | tr '\n' ' ')"
+    "test:compile": "tsc --project tsconfig.test.json",
+    "test:run": "node --test dist-tests/tests/**/*.test.js",
+    "test": "npm run test:compile && npm run test:run",
+    "test:watch": "tsc --project tsconfig.test.json --watch"
```

#### Success Criteria:
- ✅ New scripts added to package.json
- ✅ Valid JSON maintained
- ✅ Old test script preserved in backup
- ✅ Scripts are properly formatted

#### Failure Indicators:
- ❌ Invalid JSON syntax
- ❌ Scripts not added correctly

---

## 3. POST-IMPLEMENTATION VALIDATION

### Phase 3.1: Full Test Suite Execution

**Purpose:** Execute the complete test suite with the new approach.

#### Commands:

```bash
# 1. Clean previous compilation artifacts
rm -rf dist-tests

# 2. Run full test suite with new approach
npm test 2>&1 | tee /tmp/cortex-validation/new-approach-output.txt

# 3. Check exit code
echo "Exit code: $?"

# 4. Extract new metrics
echo "=== NEW APPROACH METRICS ===" > /tmp/cortex-validation/new-metrics.txt
grep "# tests" /tmp/cortex-validation/new-approach-output.txt >> /tmp/cortex-validation/new-metrics.txt
grep "# pass" /tmp/cortex-validation/new-approach-output.txt >> /tmp/cortex-validation/new-metrics.txt
grep "# fail" /tmp/cortex-validation/new-approach-output.txt >> /tmp/cortex-validation/new-metrics.txt
grep "# duration_ms" /tmp/cortex-validation/new-approach-output.txt >> /tmp/cortex-validation/new-metrics.txt

# 5. Count experimental warnings (should be 0)
grep -c "ExperimentalWarning" /tmp/cortex-validation/new-approach-output.txt > /tmp/cortex-validation/new-warning-count.txt

# 6. Identify failing tests
grep "not ok.*\.test\.js" /tmp/cortex-validation/new-approach-output.txt | grep -oP "dist-tests/tests/[^\s]+" | sort > /tmp/cortex-validation/new-failing-tests.txt

# 7. Compare metrics side-by-side
echo -e "\n=== BASELINE VS NEW COMPARISON ==="
paste <(cat /tmp/cortex-validation/baseline-metrics.txt) <(cat /tmp/cortex-validation/new-metrics.txt)

# 8. Compare failing tests
echo -e "\n=== FAILING TESTS COMPARISON ==="
echo "Baseline failures: $(wc -l < /tmp/cortex-validation/baseline-failing-tests.txt)"
echo "New failures: $(wc -l < /tmp/cortex-validation/new-failing-tests.txt)"

# 9. Check for new failures
comm -13 <(basename -a $(cat /tmp/cortex-validation/baseline-failing-tests.txt) | sort) <(basename -a $(cat /tmp/cortex-validation/new-failing-tests.txt) | sort) | tee /tmp/cortex-validation/new-regression-tests.txt
```

#### Expected Output:

```
=== NEW APPROACH METRICS ===
# tests 262
# pass 251
# fail 11
# duration_ms 8000-12000

Exit code: 0 (or 1 if tests fail, but that's expected for the 11 baseline failures)

=== BASELINE VS NEW COMPARISON ===
# tests 262                      # tests 262
# pass 251                       # pass 251
# fail 11                        # fail 11
# duration_ms 13486.46285       # duration_ms ~10000

=== FAILING TESTS COMPARISON ===
Baseline failures: 11
New failures: 11

(No new regression tests listed)
```

#### Success Criteria:
- ✅ Compilation completes successfully
- ✅ All 262 tests executed
- ✅ 251 tests passing (same as baseline)
- ✅ 11 tests failing (same as baseline)
- ✅ 0 ExperimentalWarnings
- ✅ No new test failures introduced
- ✅ Execution time similar or faster than baseline

#### Failure Indicators:
- ❌ Compilation fails
- ❌ More than 11 test failures
- ❌ New test failures not in baseline
- ❌ ExperimentalWarnings still present
- ❌ Significantly slower execution (>20% slower)

### Phase 3.2: Individual Test File Validation

**Purpose:** Verify each test file can be run independently.

#### Commands:

```bash
# 1. Create a test runner script
cat > /tmp/test-individual-files.sh << 'EOF'
#!/bin/bash
echo "Testing individual test files..."
failed_files=()
passed_files=()

for testfile in dist-tests/tests/**/*.test.js; do
  echo "Testing: $testfile"
  if node --test "$testfile" > /dev/null 2>&1; then
    passed_files+=("$testfile")
    echo "  ✓ PASS"
  else
    failed_files+=("$testfile")
    echo "  ✗ FAIL"
  fi
done

echo ""
echo "=== SUMMARY ==="
echo "Passed: ${#passed_files[@]}"
echo "Failed: ${#failed_files[@]}"
echo ""
echo "Failed files:"
printf '%s\n' "${failed_files[@]}"
EOF

chmod +x /tmp/test-individual-files.sh

# 2. Run the script
/tmp/test-individual-files.sh | tee /tmp/cortex-validation/individual-test-results.txt

# 3. Extract summary
tail -20 /tmp/cortex-validation/individual-test-results.txt
```

#### Expected Output:

```
=== SUMMARY ===
Passed: 26
Failed: 11
```

#### Success Criteria:
- ✅ Each test file can be run independently
- ✅ Same 11 files fail as in baseline
- ✅ No new failures

#### Failure Indicators:
- ❌ Tests that pass in full suite fail individually
- ❌ More than 11 files failing
- ❌ Different files failing than baseline

### Phase 3.3: Performance Comparison

**Purpose:** Measure and compare execution speed.

#### Commands:

```bash
# 1. Time the baseline approach (if ts-node still available)
echo "=== BASELINE TIMING (ts-node) ===" | tee /tmp/cortex-validation/timing-comparison.txt
time npm run test:old 2>&1 | grep "real\|user\|sys" >> /tmp/cortex-validation/timing-comparison.txt

# 2. Time the new approach (multiple runs for accuracy)
echo -e "\n=== NEW APPROACH TIMING ===" >> /tmp/cortex-validation/timing-comparison.txt
for i in {1..3}; do
  echo "Run $i:" >> /tmp/cortex-validation/timing-comparison.txt
  rm -rf dist-tests
  time npm test 2>&1 | grep "real\|user\|sys" >> /tmp/cortex-validation/timing-comparison.txt
done

# 3. Compare compilation vs execution time
echo -e "\n=== COMPILATION TIME ===" >> /tmp/cortex-validation/timing-comparison.txt
time npm run test:compile 2>&1 | grep "real\|user\|sys" >> /tmp/cortex-validation/timing-comparison.txt

echo -e "\n=== EXECUTION TIME (pre-compiled) ===" >> /tmp/cortex-validation/timing-comparison.txt
time npm run test:run 2>&1 | grep "real\|user\|sys" >> /tmp/cortex-validation/timing-comparison.txt

# 4. Display results
cat /tmp/cortex-validation/timing-comparison.txt
```

#### Expected Output:

```
=== BASELINE TIMING (ts-node) ===
real    0m20.123s
user    0m35.456s
sys     0m2.789s

=== NEW APPROACH TIMING ===
Run 1:
real    0m15.234s
user    0m28.123s
sys     0m2.123s

=== COMPILATION TIME ===
real    0m8.123s
user    0m18.456s
sys     0m1.234s

=== EXECUTION TIME (pre-compiled) ===
real    0m7.111s
user    0m9.667s
sys     0m0.889s
```

#### Success Criteria:
- ✅ New approach is equal or faster than baseline
- ✅ Pre-compiled execution is significantly faster (for subsequent runs)
- ✅ Total time (compile + execute) is competitive

#### Failure Indicators:
- ❌ New approach is >20% slower than baseline
- ❌ Compilation takes excessively long (>30s)

### Phase 3.4: Error Message Quality Validation

**Purpose:** Ensure error messages and stack traces are useful for debugging.

#### Commands:

```bash
# 1. Run a failing test and capture output
node --test dist-tests/tests/api/grpc.test.js 2>&1 | tee /tmp/cortex-validation/error-output.txt

# 2. Check for source map support
echo "=== Checking for source file references ==="
grep "\.ts:" /tmp/cortex-validation/error-output.txt | head -5

# 3. Verify stack traces are readable
echo -e "\n=== Stack trace sample ==="
grep -A 5 "Error:" /tmp/cortex-validation/error-output.txt | head -20

# 4. Test with source maps disabled (compare)
node --disable-source-maps --test dist-tests/tests/api/grpc.test.js 2>&1 | head -30
```

#### Expected Output:

```
=== Checking for source file references ===
(Should show .js files in dist-tests, but with correct line numbers)

=== Stack trace sample ===
Error: ...
    at file:///home/matthias/projects/cortex/dist-tests/tests/api/grpc.test.js:10:15
    at ...
```

#### Success Criteria:
- ✅ Stack traces point to correct files
- ✅ Line numbers are accurate
- ✅ Error messages are clear
- ✅ Source maps work correctly

#### Failure Indicators:
- ❌ Stack traces point to wrong locations
- ❌ Line numbers are off
- ❌ No stack traces available

---

## 4. SUCCESS CRITERIA CHECKLIST

### 4.1 Functional Requirements

- [ ] **All 262 tests execute**: Test suite runs to completion
- [ ] **251 tests pass**: Same pass rate as baseline
- [ ] **11 tests fail**: Only baseline failures, no new regressions
- [ ] **No uncaught exceptions**: No test runner crashes
- [ ] **No experimental loader warnings**: Zero ExperimentalWarnings in output
- [ ] **Clear error messages**: Stack traces are useful for debugging
- [ ] **Source maps work**: Error line numbers are accurate

### 4.2 Performance Requirements

- [ ] **Faster or equal total time**: New approach ≤ baseline time
- [ ] **Fast incremental runs**: Pre-compiled tests execute in <10s
- [ ] **Reasonable compile time**: Initial compilation <30s
- [ ] **CI/CD compatible**: Works in automated environments

### 4.3 Maintainability Requirements

- [ ] **Clear documentation**: Strategy and commands documented
- [ ] **Rollback plan tested**: Can revert changes if needed
- [ ] **Git history clean**: Changes are atomic and reversible
- [ ] **No breaking changes**: Existing workflows still work

---

## 5. ROLLBACK STRATEGY

### 5.1 Immediate Rollback (If Critical Issues)

**Purpose:** Quickly revert to working state if new approach fails.

#### Commands:

```bash
# 1. Stop any running tests
# Ctrl+C if needed

# 2. Restore package.json
cp /tmp/cortex-validation/package.json.backup package.json

# 3. Remove new files
rm -f tsconfig.test.json
rm -rf dist-tests

# 4. Verify restoration
git diff package.json  # Should show no changes

# 5. Test baseline works
npm test

# 6. Verify restoration successful
echo "Rollback complete. Baseline restored."
```

#### Expected Output:

```
(Test suite runs with ts-node/esm loader)
Rollback complete. Baseline restored.
```

#### Success Criteria:
- ✅ Original package.json restored
- ✅ New files removed
- ✅ Tests run with ts-node again
- ✅ No permanent changes made

### 5.2 Partial Rollback (Keep Files, Revert Scripts)

**Purpose:** Keep the infrastructure but revert to old test command.

#### Commands:

```bash
# 1. Restore only package.json
cp /tmp/cortex-validation/package.json.backup package.json

# 2. Keep tsconfig.test.json and dist-tests for investigation

# 3. Verify tests work with old approach
npm test

# 4. Document issues for debugging
echo "Issues found:" > /tmp/cortex-validation/rollback-reason.txt
echo "- [Describe issue]" >> /tmp/cortex-validation/rollback-reason.txt
```

### 5.3 Git Rollback (If Committed)

**Purpose:** Revert committed changes.

#### Commands:

```bash
# 1. Check commit history
git log --oneline -5

# 2. Revert the commit (keep history)
git revert HEAD

# 3. Or reset to previous commit (destructive)
# git reset --hard HEAD^

# 4. Verify rollback
npm test
```

---

## 6. INCREMENTAL TESTING STRATEGY

### 6.1 Subset Testing (Reduce Risk)

**Purpose:** Test with a small subset of tests first before full suite.

#### Commands:

```bash
# 1. Create minimal test config
cat > tsconfig.test.minimal.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist-tests-minimal",
    "rootDir": ".",
    "noEmit": false
  },
  "include": [
    "tests/environment.test.ts",
    "tests/core/eventBus.test.ts",
    "tests/observability/metrics/counter.test.ts",
    "src/**/*.ts"
  ],
  "exclude": ["node_modules", "dist", "dist-tests"]
}
EOF

# 2. Compile minimal subset
npx tsc --project tsconfig.test.minimal.json

# 3. Run minimal tests
node --test dist-tests-minimal/tests/environment.test.js
node --test dist-tests-minimal/tests/core/eventBus.test.js
node --test dist-tests-minimal/tests/observability/metrics/counter.test.js

# 4. Verify success
echo "Exit code: $?"

# 5. If successful, expand to more tests
# Add more files to include array and repeat
```

#### Expected Output:

```
(Successful compilation and test execution)
Exit code: 0
```

#### Success Criteria:
- ✅ Minimal subset compiles
- ✅ Tests execute successfully
- ✅ Can incrementally add more tests

### 6.2 Module-by-Module Testing

**Purpose:** Test one module at a time to isolate issues.

#### Commands:

```bash
# Test each module independently
for module in cli core observability performance resilience security wasm workers api web3; do
  echo "=== Testing module: $module ==="
  if [ -d "tests/$module" ]; then
    node --test dist-tests/tests/$module/*.test.js
    echo "Exit code: $?"
  fi
  echo ""
done
```

---

## 7. TROUBLESHOOTING GUIDE

### Issue 7.1: Compilation Fails

**Symptoms:**
```
error TS2307: Cannot find module './foo.js'
```

**Diagnosis:**

```bash
# Check import statements
grep -r "from.*\.ts" tests/

# Check module resolution
npx tsc --project tsconfig.test.json --traceResolution | grep "foo"
```

**Solutions:**

1. **Update imports to use .js extension:**
   ```typescript
   // WRONG
   import { foo } from './foo';
   import { bar } from './bar.ts';

   // CORRECT
   import { foo } from './foo.js';
   import { bar } from './bar.js';
   ```

2. **Check tsconfig.json moduleResolution:**
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node"
     }
   }
   ```

### Issue 7.2: Runtime Module Not Found

**Symptoms:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
```

**Diagnosis:**

```bash
# Check compiled output
ls -la dist-tests/src/
cat dist-tests/tests/sometest.test.js | grep "import"

# Verify paths
node --trace-warnings --test dist-tests/tests/sometest.test.js
```

**Solutions:**

1. **Ensure source files are compiled:**
   ```bash
   # tsconfig.test.json should include src
   "include": ["tests/**/*.test.ts", "src/**/*.ts"]
   ```

2. **Check import paths in compiled code:**
   ```bash
   # Paths should be relative or absolute, not bare specifiers
   grep "from 'src/" dist-tests/tests/*.test.js  # WRONG
   grep "from '../../src/" dist-tests/tests/*.test.js  # CORRECT
   ```

### Issue 7.3: Tests Pass Individually But Fail Together

**Symptoms:**
- `node --test single.test.js` passes
- `npm test` fails

**Diagnosis:**

```bash
# Run with verbose output
node --test --test-reporter spec dist-tests/tests/**/*.test.js

# Check for shared state
grep -r "global\." tests/
grep -r "process\." tests/
```

**Solutions:**

1. **Isolate test files:**
   - Avoid global state
   - Use beforeEach/afterEach for cleanup

2. **Run tests in isolation mode:**
   ```json
   "test:run": "node --test --test-concurrency=1 dist-tests/tests/**/*.test.js"
   ```

### Issue 7.4: Performance Degradation

**Symptoms:**
- Tests take significantly longer than baseline

**Diagnosis:**

```bash
# Profile compilation
npx tsc --project tsconfig.test.json --diagnostics

# Profile execution
node --test --test-reporter tap dist-tests/tests/**/*.test.js | grep duration_ms
```

**Solutions:**

1. **Enable incremental compilation:**
   ```json
   {
     "compilerOptions": {
       "incremental": true,
       "tsBuildInfoFile": "./dist-tests/.tsbuildinfo"
     }
   }
   ```

2. **Use watch mode for development:**
   ```bash
   npm run test:watch
   ```

3. **Parallelize test execution:**
   ```json
   "test:run": "node --test --test-concurrency=4 dist-tests/tests/**/*.test.js"
   ```

### Issue 7.5: Source Maps Not Working

**Symptoms:**
- Stack traces show wrong line numbers
- Can't debug effectively

**Diagnosis:**

```bash
# Check source map generation
ls dist-tests/tests/*.test.js.map | wc -l  # Should equal number of test files

# Verify source map content
cat dist-tests/tests/environment.test.js.map | head
```

**Solutions:**

1. **Enable source maps in tsconfig:**
   ```json
   {
     "compilerOptions": {
       "sourceMap": true
     }
   }
   ```

2. **Ensure Node.js uses source maps:**
   ```bash
   # Node.js 12.12.0+ has built-in support
   node --enable-source-maps --test dist-tests/tests/sometest.test.js
   ```

---

## 8. VERIFICATION COMMANDS SUMMARY

**Quick Copy-Paste Checklist:**

```bash
# Pre-Implementation
✓ mkdir -p /tmp/cortex-validation
✓ npm test 2>&1 | tee /tmp/cortex-validation/baseline-test-output.txt
✓ cp package.json /tmp/cortex-validation/package.json.backup
✓ cp tsconfig.json /tmp/cortex-validation/tsconfig.json.backup

# Implementation
✓ Create tsconfig.test.json
✓ npx tsc --project tsconfig.test.json
✓ find dist-tests/tests -name "*.test.js" | wc -l  # Should be 37
✓ node --test dist-tests/tests/environment.test.js
✓ Update package.json scripts

# Post-Implementation
✓ rm -rf dist-tests && npm test
✓ grep -c "ExperimentalWarning" output.txt  # Should be 0
✓ Compare test counts: 262 total, 251 pass, 11 fail
✓ Verify no new test failures
✓ Check execution time is reasonable

# Success Confirmation
✓ All 251 tests passing
✓ Zero ExperimentalWarnings
✓ Faster or equal execution time
✓ Clean error messages
```

---

## 9. FINAL VALIDATION REPORT

**Generate Final Report:**

```bash
cat > /tmp/cortex-validation/final-report.txt << 'EOF'
# Compile-First Testing Implementation Report

## Summary
Date: $(date)
Branch: $(git branch --show-current)
Commit: $(git log -1 --oneline)

## Metrics Comparison
### Baseline (ts-node/esm)
- Tests: $(grep "# tests" /tmp/cortex-validation/baseline-metrics.txt)
- Pass: $(grep "# pass" /tmp/cortex-validation/baseline-metrics.txt)
- Fail: $(grep "# fail" /tmp/cortex-validation/baseline-metrics.txt)
- Duration: $(grep "# duration_ms" /tmp/cortex-validation/baseline-metrics.txt)
- Warnings: $(cat /tmp/cortex-validation/baseline-warning-count.txt)

### New Approach (compile-first)
- Tests: $(grep "# tests" /tmp/cortex-validation/new-metrics.txt)
- Pass: $(grep "# pass" /tmp/cortex-validation/new-metrics.txt)
- Fail: $(grep "# fail" /tmp/cortex-validation/new-metrics.txt)
- Duration: $(grep "# duration_ms" /tmp/cortex-validation/new-metrics.txt)
- Warnings: $(cat /tmp/cortex-validation/new-warning-count.txt)

## Changes Made
1. Created tsconfig.test.json
2. Updated package.json scripts
3. Compiled tests to dist-tests/

## Validation Results
✓ Compilation successful
✓ All tests execute
✓ No new failures
✓ No ExperimentalWarnings
✓ Performance acceptable

## Recommendation
[ ] Approved - Merge changes
[ ] Needs work - See issues below
[ ] Reject - Revert changes

## Issues (if any)
(List any issues found)

## Next Steps
(What to do next)
EOF

# Display report
cat /tmp/cortex-validation/final-report.txt
```

---

## APPENDIX A: Known Baseline Test Failures

The following 11 tests are known to fail in the baseline and should continue to fail (or be fixed separately):

1. `/home/matthias/projects/cortex/tests/api/grpc.test.ts`
2. `/home/matthias/projects/cortex/tests/integration/fullSystem.test.ts`
3. `/home/matthias/projects/cortex/tests/observability/tracing/tracer.test.ts`
4. `/home/matthias/projects/cortex/tests/performance/compression.test.ts`
5. `/home/matthias/projects/cortex/tests/performance/httpCache.test.ts`
6. `/home/matthias/projects/cortex/tests/resilience/retryExecutor.test.ts`
7. `/home/matthias/projects/cortex/tests/security/rateLimiter.test.ts`
8. `/home/matthias/projects/cortex/tests/wasm/memoryManager.test.ts`
9. `/home/matthias/projects/cortex/tests/wasm/utils.test.ts`
10. `/home/matthias/projects/cortex/tests/web3/smartContracts.ethers.test.ts`
11. `/home/matthias/projects/cortex/tests/workers/workerPool.test.ts`

**Note:** These failures are likely due to:
- Missing dependencies (gRPC, compression libraries)
- Uncaught exceptions in test code
- Environment-specific issues

These should be addressed separately and are not related to the compile-first approach.

---

## APPENDIX B: Reference Commands Quick Sheet

```bash
# Compilation
npx tsc --project tsconfig.test.json

# Run all tests
npm test

# Run specific test
node --test dist-tests/tests/environment.test.js

# Run with debugging
node --inspect-brk --test dist-tests/tests/sometest.test.js

# Watch mode
npx tsc --project tsconfig.test.json --watch

# Clean build
rm -rf dist-tests && npm run test:compile

# Performance profiling
time npm test

# Generate coverage (requires c8)
npx c8 npm run test:run

# List compiled files
find dist-tests -name "*.js" -type f

# Check for warnings
npm test 2>&1 | grep -i "warning"

# Validate TypeScript
npx tsc --project tsconfig.test.json --noEmit
```

---

## APPENDIX C: Decision Matrix

| Criteria | ts-node/esm (Baseline) | Compile-First (New) | Winner |
|----------|------------------------|---------------------|--------|
| Test Execution Speed | ~13.5s | ~10s (expected) | New |
| Warnings | 37 ExperimentalWarnings | 0 | New |
| Setup Complexity | Simple | Moderate | Baseline |
| CI/CD Speed | Slower | Faster (cached) | New |
| Development DX | Instant | Requires compile | Baseline |
| Production Ready | Deprecated API | Stable | New |
| Debugging | Direct TS | Source maps | Tie |
| Maintenance | Decreasing support | Standard approach | New |

**Recommendation:** Compile-first approach is superior for:
- Production stability (no deprecated APIs)
- CI/CD performance (compiled tests can be cached)
- Clean output (no warnings)
- Future-proofing (ts-node loader may be removed)

**Trade-off:** Requires compilation step, but `test:watch` mitigates this for development.

---

**End of Validation Strategy**
