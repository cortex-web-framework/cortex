# Testing Troubleshooting Matrix

Quick reference guide for debugging compile-first testing issues.

---

## Symptom-Based Diagnosis

### 🔴 Compilation Errors

| Error Message | Cause | Solution | Command |
|--------------|-------|----------|---------|
| `error TS2307: Cannot find module './foo.js'` | Import uses `.js` but file is `.ts` | This is correct for ESM - TypeScript resolves it | No action needed |
| `error TS2307: Cannot find module './foo'` | Missing file extension | Add `.js` to import | `sed -i "s/from '\.\/foo'/from '\.\/foo.js'/g" file.ts` |
| `error TS2304: Cannot find name 'test'` | Missing node test import | Add `import { test } from 'node:test'` | Check imports |
| `error TS2304: Cannot find name 'assert'` | Missing assert import | Add `import assert from 'node:assert'` | Check imports |
| `error TS6059: File is not under 'rootDir'` | rootDir misconfigured | Set `"rootDir": "."` in tsconfig.test.json | Edit config |
| `error TS5055: Cannot write file ... overwrites input` | outDir equals src directory | Change outDir to `dist-tests` | Edit config |

**Diagnostic Commands:**
```bash
# Check compilation with detailed errors
npx tsc --project tsconfig.test.json --listFiles --extendedDiagnostics

# Trace module resolution
npx tsc --project tsconfig.test.json --traceResolution | grep "error\|foo"

# Validate tsconfig syntax
npx tsc --project tsconfig.test.json --showConfig
```

---

### 🔴 Runtime Errors (ERR_MODULE_NOT_FOUND)

| Error Location | Cause | Solution | Verification |
|---------------|-------|----------|-------------|
| `Cannot find module '/path/to/src/foo.js'` | Source not compiled | Add `"src/**/*.ts"` to include | `ls dist-tests/src/` |
| `Cannot find module '../../src/foo.js'` | Wrong relative path in compiled code | Check import paths in source | `grep "from.*src" tests/foo.test.ts` |
| `Cannot find module 'node:test'` | Node version too old | Upgrade to Node.js 18+ | `node --version` |
| `Cannot find module '@/foo.js'` | Path alias not resolved | Configure paths in tsconfig | Check `compilerOptions.paths` |

**Diagnostic Commands:**
```bash
# Check what was compiled
find dist-tests -name "*.js" -type f | sort

# Check import statements in compiled code
grep -r "^import.*from" dist-tests/tests/foo.test.js

# Test module resolution manually
node -e "import('./dist-tests/tests/foo.test.js').catch(console.error)"

# Verify source files exist
ls -la dist-tests/src/
```

---

### 🔴 Test Execution Errors

| Symptom | Cause | Solution | Command |
|---------|-------|----------|---------|
| Tests pass individually, fail together | Global state pollution | Isolate tests with beforeEach/afterEach | `node --test file.test.js` |
| "Cannot read property of undefined" | Race condition | Add `await` to async operations | Review test code |
| Tests hang indefinitely | Unclosed resources (servers, timers) | Add cleanup in afterEach | Check for `server.stop()` |
| Random test failures | Parallel execution conflicts | Run serially: `--test-concurrency=1` | Update test script |

**Diagnostic Commands:**
```bash
# Run single test in isolation
node --test dist-tests/tests/environment.test.js

# Run with verbose output
node --test --test-reporter spec dist-tests/tests/**/*.test.js

# Run serially (not parallel)
node --test --test-concurrency=1 dist-tests/tests/**/*.test.js

# Debug a specific test
node --inspect-brk --test dist-tests/tests/foo.test.js
```

---

### 🔴 Performance Issues

| Symptom | Cause | Solution | Impact |
|---------|-------|----------|--------|
| Compilation takes >30s | Too many files | Use incremental compilation | Add `"incremental": true` |
| Tests slower than baseline | Non-optimized TypeScript config | Enable optimizations | See config below |
| Re-compilation on every change | No incremental mode | Enable watch mode | `npm run test:watch` |
| CI/CD too slow | Recompiling every time | Cache dist-tests directory | Add to CI config |

**Optimization Config:**
```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./dist-tests/.tsbuildinfo",
    "skipLibCheck": true,
    "assumeChangesOnlyAffectDirectDependencies": true
  }
}
```

**Diagnostic Commands:**
```bash
# Profile compilation
npx tsc --project tsconfig.test.json --diagnostics

# Measure execution time
time npm run test:run

# Compare with baseline
time npm run test:old  # If ts-node still available
```

---

### 🔴 Debugging Issues

| Problem | Cause | Solution | Command |
|---------|-------|----------|---------|
| Stack traces show wrong line numbers | Source maps not working | Enable sourceMap in tsconfig | Add `"sourceMap": true` |
| Can't set breakpoints in VSCode | Launch config wrong | Use dist-tests path in debugger | See config below |
| Error messages not helpful | No source maps | Enable Node.js source map support | `node --enable-source-maps` |
| Console.log not showing file:line | Source maps disabled | Check .map files exist | `ls dist-tests/**/*.js.map` |

**VSCode Launch Config:**
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Test",
  "program": "${workspaceFolder}/node_modules/.bin/node",
  "args": [
    "--test",
    "--enable-source-maps",
    "${workspaceFolder}/dist-tests/tests/environment.test.js"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

**Diagnostic Commands:**
```bash
# Verify source maps generated
ls dist-tests/tests/*.test.js.map | wc -l

# Check source map content
cat dist-tests/tests/environment.test.js.map | jq '.sources'

# Run with source maps enabled
node --enable-source-maps --test dist-tests/tests/foo.test.js
```

---

### 🔴 Git/Merge Conflicts

| Issue | Cause | Solution | Prevention |
|-------|-------|----------|-----------|
| dist-tests in version control | Not gitignored | Add to .gitignore | `echo "dist-tests/" >> .gitignore` |
| tsconfig.test.json conflicts | Merge collision | Accept both changes | Use merge tool |
| Test scripts overwritten | Package.json conflict | Carefully merge scripts | Review before commit |

**.gitignore additions:**
```
# Testing artifacts
dist-tests/
*.tsbuildinfo
```

---

## Quick Diagnostic Workflow

```bash
# 1. Verify configuration
cat tsconfig.test.json
cat package.json | grep -A 5 '"scripts"'

# 2. Clean build
rm -rf dist-tests
npm run test:compile

# 3. Check compilation output
find dist-tests -name "*.js" | wc -l  # Should be ~80-100 files
find dist-tests/tests -name "*.test.js" | wc -l  # Should be 37

# 4. Test single file
node --test dist-tests/tests/environment.test.js

# 5. Run full suite
npm run test:run

# 6. If failures, run serially
node --test --test-concurrency=1 dist-tests/tests/**/*.test.js
```

---

## Error Code Quick Reference

### TypeScript Error Codes

| Code | Meaning | Quick Fix |
|------|---------|-----------|
| TS2307 | Cannot find module | Check import path, add .js extension |
| TS2304 | Cannot find name | Add import statement |
| TS2339 | Property doesn't exist | Check typing, add type assertion |
| TS2345 | Argument type mismatch | Fix type or add type cast |
| TS5055 | Output overwrites input | Fix outDir in tsconfig |
| TS6059 | File not under rootDir | Fix rootDir in tsconfig |

### Node.js Error Codes

| Code | Meaning | Quick Fix |
|------|---------|-----------|
| ERR_MODULE_NOT_FOUND | Can't find JS file | Check compiled output exists |
| ERR_UNSUPPORTED_ESM_URL_SCHEME | Wrong import format | Use file:// or relative path |
| ERR_UNKNOWN_FILE_EXTENSION | Wrong file type | Check .js extension |
| ERR_TEST_FAILURE | Test assertions failed | Debug test logic |

---

## Environment-Specific Issues

### Issue: Different behavior in CI vs Local

**Checklist:**
```bash
# 1. Verify Node versions match
node --version  # Local
# Compare with CI logs

# 2. Check environment variables
env | grep NODE

# 3. Verify dependencies
npm list typescript
npm list ts-node  # Should not be used anymore

# 4. Check file system case sensitivity
# Linux/CI is case-sensitive, macOS/Windows often not
find dist-tests -name "*.test.js" | sort
```

### Issue: Works on Developer Machine, Fails in CI

**Common Causes:**
- Different Node.js versions
- Missing compiled artifacts (dist-tests not generated)
- File path case sensitivity
- Missing environment variables

**Solution Template for CI:**
```yaml
# .github/workflows/test.yml (example)
- name: Compile Tests
  run: npm run test:compile

- name: Run Tests
  run: npm run test:run

- name: Cache compiled tests (optional)
  uses: actions/cache@v3
  with:
    path: dist-tests
    key: ${{ runner.os }}-tests-${{ hashFiles('tests/**/*.ts', 'src/**/*.ts') }}
```

---

## Validation Checklist

Use this to verify everything works:

```bash
# ✅ Configuration valid
npx tsc --project tsconfig.test.json --showConfig | jq '.compilerOptions.outDir'
# Expected: "./dist-tests"

# ✅ Compilation succeeds
npx tsc --project tsconfig.test.json && echo "✅ PASS" || echo "❌ FAIL"

# ✅ Correct number of files
test $(find dist-tests/tests -name "*.test.js" | wc -l) -eq 37 && echo "✅ PASS" || echo "❌ FAIL"

# ✅ Source maps generated
test $(find dist-tests/tests -name "*.test.js.map" | wc -l) -eq 37 && echo "✅ PASS" || echo "❌ FAIL"

# ✅ Single test runs
node --test dist-tests/tests/environment.test.js && echo "✅ PASS" || echo "❌ FAIL"

# ✅ No experimental warnings
node --test dist-tests/tests/environment.test.js 2>&1 | grep -c "ExperimentalWarning" | grep -q "^0$" && echo "✅ PASS" || echo "❌ FAIL"

# ✅ Full suite runs
npm test && echo "✅ PASS" || echo "❌ FAIL"

# ✅ Correct test counts
npm test 2>&1 | grep "# tests 262" && echo "✅ PASS" || echo "❌ FAIL"
npm test 2>&1 | grep "# pass 251" && echo "✅ PASS" || echo "❌ FAIL"
```

---

## Emergency Rollback

If nothing works and you need to revert immediately:

```bash
#!/bin/bash
# emergency-rollback.sh

echo "🚨 EMERGENCY ROLLBACK INITIATED"

# Stop any running processes
killall node 2>/dev/null

# Restore backups
if [ -f /tmp/cortex-validation/package.json.backup ]; then
  cp /tmp/cortex-validation/package.json.backup package.json
  echo "✅ Restored package.json"
fi

if [ -f /tmp/cortex-validation/tsconfig.json.backup ]; then
  cp /tmp/cortex-validation/tsconfig.json.backup tsconfig.json
  echo "✅ Restored tsconfig.json"
fi

# Remove new files
rm -f tsconfig.test.json
rm -rf dist-tests
echo "✅ Cleaned up new files"

# Verify rollback
npm test > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ ROLLBACK SUCCESSFUL - Tests running with ts-node"
else
  echo "❌ ROLLBACK FAILED - Manual intervention required"
  echo "Check: npm install, node_modules, package.json"
fi
```

---

## Contact/Support

If issues persist after trying all troubleshooting steps:

1. **Check baseline works:**
   ```bash
   cp /tmp/cortex-validation/package.json.backup package.json
   npm test
   ```

2. **Document the issue:**
   ```bash
   # Capture full error output
   npm test > /tmp/issue-report.txt 2>&1

   # Include configuration
   cat tsconfig.test.json >> /tmp/issue-report.txt
   cat package.json >> /tmp/issue-report.txt

   # Include environment
   node --version >> /tmp/issue-report.txt
   npm --version >> /tmp/issue-report.txt
   npx tsc --version >> /tmp/issue-report.txt
   ```

3. **Create minimal reproduction:**
   - Isolate the failing test
   - Test with minimal tsconfig
   - Document exact steps to reproduce

---

## Success Indicators

When everything is working correctly, you should see:

```bash
$ npm test

> cortex@1.0.0 test
> npm run test:compile && npm run test:run

> cortex@1.0.0 test:compile
> tsc --project tsconfig.test.json

✓ Compilation successful (no output = success)

> cortex@1.0.0 test:run
> node --test dist-tests/tests/**/*.test.js

TAP version 13
# (No ExperimentalWarnings!)
# Subtest: ...
ok 1 - ...
...
1..262
# tests 262
# pass 251
# fail 11
# duration_ms ~10000
```

**Key success markers:**
- ✅ No compilation errors
- ✅ No ExperimentalWarnings
- ✅ 262 tests executed
- ✅ 251 tests passing
- ✅ Clean TAP output
- ✅ Execution time ≤ 15 seconds

---

**End of Troubleshooting Matrix**
