# Compile-First Testing - Quick Validation Checklist

## Pre-Flight Check (5 minutes)

```bash
# 1. Setup validation workspace
mkdir -p /tmp/cortex-validation
cd /home/matthias/projects/cortex

# 2. Capture baseline
npm test 2>&1 | tee /tmp/cortex-validation/baseline.txt

# 3. Backup critical files
cp package.json /tmp/cortex-validation/package.json.backup
cp tsconfig.json /tmp/cortex-validation/tsconfig.json.backup

# 4. Extract baseline metrics
echo "Baseline metrics:"
grep "# tests\|# pass\|# fail\|# duration_ms" /tmp/cortex-validation/baseline.txt
grep -c "ExperimentalWarning" /tmp/cortex-validation/baseline.txt
```

**Expected:** 262 tests, 251 pass, 11 fail, 37 warnings

---

## Implementation (10 minutes)

### Step 1: Create tsconfig.test.json

```bash
cat > tsconfig.test.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist-tests",
    "rootDir": ".",
    "noEmit": false,
    "sourceMap": true
  },
  "include": ["tests/**/*.test.ts", "src/**/*.ts"],
  "exclude": ["node_modules", "dist", "dist-tests"]
}
EOF
```

**Validate:**
```bash
npx tsc --project tsconfig.test.json --noEmit
```
✅ Should complete without errors

### Step 2: Test Compilation

```bash
npx tsc --project tsconfig.test.json
```

**Validate:**
```bash
find dist-tests/tests -name "*.test.js" | wc -l
```
✅ Should output: 37

### Step 3: Single Test Validation

```bash
node --test dist-tests/tests/environment.test.js
```

✅ Should pass with 0 ExperimentalWarnings

### Step 4: Update package.json

```javascript
// Add to scripts section:
{
  "test:compile": "tsc --project tsconfig.test.json",
  "test:run": "node --test dist-tests/tests/**/*.test.js",
  "test": "npm run test:compile && npm run test:run",
  "test:watch": "tsc --project tsconfig.test.json --watch"
}
```

**Manual Edit or Use:**
```bash
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
```

---

## Validation (10 minutes)

### Full Suite Test

```bash
rm -rf dist-tests
npm test 2>&1 | tee /tmp/cortex-validation/new-approach.txt
```

### Metrics Comparison

```bash
echo "=== COMPARISON ==="
echo -n "Baseline: "; grep "# tests\|# pass\|# fail" /tmp/cortex-validation/baseline.txt
echo -n "New:      "; grep "# tests\|# pass\|# fail" /tmp/cortex-validation/new-approach.txt
echo ""
echo "Baseline warnings: $(grep -c "ExperimentalWarning" /tmp/cortex-validation/baseline.txt)"
echo "New warnings:      $(grep -c "ExperimentalWarning" /tmp/cortex-validation/new-approach.txt)"
```

### Success Criteria

- [ ] ✅ Tests: 262 (same as baseline)
- [ ] ✅ Pass: 251 (same as baseline)
- [ ] ✅ Fail: 11 (same as baseline)
- [ ] ✅ ExperimentalWarnings: 0 (was 37)
- [ ] ✅ Duration: ≤ baseline time
- [ ] ✅ No new test failures

---

## Rollback (If Needed)

```bash
# Quick rollback
cp /tmp/cortex-validation/package.json.backup package.json
rm -f tsconfig.test.json
rm -rf dist-tests
npm test  # Should work with ts-node again
```

---

## Common Issues

### Issue: Compilation fails with "Cannot find module"

**Fix:** Check import paths use `.js` extension:
```bash
grep -r "from.*\.ts['\"]" tests/  # Find problematic imports
```

### Issue: Tests fail with ERR_MODULE_NOT_FOUND

**Fix:** Ensure source files are included in compilation:
```json
// tsconfig.test.json
"include": ["tests/**/*.test.ts", "src/**/*.ts"]
```

### Issue: Performance is slower

**Fix:** Enable incremental compilation:
```json
// tsconfig.test.json
"compilerOptions": {
  "incremental": true,
  "tsBuildInfoFile": "./dist-tests/.tsbuildinfo"
}
```

---

## Quick Commands Reference

```bash
# Full test suite
npm test

# Compile only
npm run test:compile

# Run pre-compiled tests
npm run test:run

# Watch mode (development)
npm run test:watch

# Run specific test
node --test dist-tests/tests/environment.test.js

# Clean rebuild
rm -rf dist-tests && npm test

# Check for warnings
npm test 2>&1 | grep -i "warning"
```

---

## Validation Complete

Once all checkboxes are checked, you're ready to commit:

```bash
git add tsconfig.test.json package.json
git commit -m "feat(tests): Migrate to compile-first testing approach

- Create tsconfig.test.json for test compilation
- Update npm test script to compile-first approach
- Eliminate 37 ExperimentalWarnings from ts-node/esm loader
- Improve test execution performance
- Maintain 100% test compatibility (251 passing tests)

Testing: All 262 tests execute, 251 pass (same as baseline)"
```

---

## Performance Benchmark

**Quick benchmark:**
```bash
time (rm -rf dist-tests && npm test)
```

**Expected results:**
- First run (with compilation): ~15-20s
- Subsequent runs (pre-compiled): ~7-10s
- Baseline (ts-node/esm): ~20-25s

---

## Done!

You've successfully migrated to compile-first testing approach! 🎉

**Benefits achieved:**
- ✅ Zero ExperimentalWarnings
- ✅ Faster test execution
- ✅ Better CI/CD caching
- ✅ Future-proof (no deprecated APIs)
- ✅ Production-ready approach

**Next steps:**
- Consider fixing the 11 baseline test failures (separate task)
- Set up test coverage reporting with c8
- Configure CI/CD to cache dist-tests directory
