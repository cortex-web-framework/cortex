# CORTEX FRAMEWORK - GRANULAR IMPLEMENTATION ROADMAP

**Last Updated:** 2025-10-22
**Current Branch:** `feature/advanced-web-tech-todo`
**Status:** Phase 1 COMPLETE, Phase 2-5 IN PROGRESS

---

## CRITICAL: Ambiguity Callouts

⚠️ **AMBIGUITY #1**: The exact root cause of the 11 failing tests needs investigation. They may be interdependent.
⚠️ **AMBIGUITY #2**: Worker serialization issues in `workerActor.ts` are known but the exact scope is unclear.
⚠️ **AMBIGUITY #3**: WASM memory alignment requirements vary by architecture - testing needed across platforms.
⚠️ **AMBIGUITY #4**: Express type dependencies may require significant refactoring - estimate range is 2-8 hours.
⚠️ **AMBIGUITY #5**: Some failing tests may require new dependencies (gRPC), conflicting with zero-dependency goal.

---

# SECTION 1: EXECUTIVE TASK BREAKDOWN

## Quick Stats
- **Total Tasks:** 67 granular, actionable tasks
- **Total Estimated Time:** 52-112 hours (6.5-14 developer days)
- **Current Status:** 262 tests, 251 passing, 11 failing
- **Target:** All 262 tests passing, zero warnings, zero vulnerabilities

---

## Task Table (67 Tasks)

| Task ID | Task Name | Time Est | Dependencies | Acceptance Criteria | Code Changes Required |
|---------|-----------|----------|--------------|---------------------|----------------------|
| **PHASE 1: TESTING INFRASTRUCTURE (COMPLETE)** |||||
| IMPL-001 | ✅ Verify tsconfig.test.json exists | 2 min | None | File exists at `/home/matthias/projects/cortex/tsconfig.test.json` | None (verification only) |
| IMPL-002 | ✅ Verify npm test scripts updated | 2 min | None | `npm test` runs compile-first approach | None (verification only) |
| IMPL-003 | ✅ Run npm test and capture baseline | 3 min | IMPL-001, IMPL-002 | 262 tests run, 251 pass, 11 fail, 0 ExperimentalWarnings | None (verification only) |
| IMPL-004 | ✅ Add dist-tests to .gitignore | 1 min | None | `grep dist-tests .gitignore` returns match | `.gitignore` line 1 (already done) |
| **PHASE 2: ZERO-DEPENDENCY COMPLIANCE (HIGH PRIORITY)** |||||
| IMPL-005 | Identify all Express import locations | 5 min | IMPL-003 | List of 4 files confirmed | Run: `grep -r "from 'express'" src/` |
| IMPL-006 | Analyze Express usage in rateLimiter.ts | 10 min | IMPL-005 | Determine replacement types needed | Review `/home/matthias/projects/cortex/src/security/rateLimiter.ts:1` |
| IMPL-007 | Replace Express types in rateLimiter.ts | 20 min | IMPL-006 | No Express imports, uses node:http types | Replace lines 1-7 in `src/security/rateLimiter.ts` |
| IMPL-008 | Update rateLimiter tests for new types | 15 min | IMPL-007 | `tests/security/rateLimiter.test.ts` passes | Modify test file to match new interface |
| IMPL-009 | Analyze Express usage in httpCache.ts | 10 min | IMPL-005 | Determine replacement types needed | Review `/home/matthias/projects/cortex/src/performance/httpCache.ts:1` |
| IMPL-010 | Replace Express types in httpCache.ts | 20 min | IMPL-009 | No Express imports, uses node:http types | Replace lines 1-3 in `src/performance/httpCache.ts` |
| IMPL-011 | Update httpCache tests for new types | 15 min | IMPL-010 | `tests/performance/httpCache.test.ts` passes | Modify test file to match new interface |
| IMPL-012 | Analyze Express usage in csp.ts | 10 min | IMPL-005 | Determine replacement types needed | Review `/home/matthias/projects/cortex/src/security/csp.ts:1` |
| IMPL-013 | Replace Express types in csp.ts | 20 min | IMPL-012 | No Express imports, uses node:http types | Replace lines 1-2 in `src/security/csp.ts` |
| IMPL-014 | Update CSP tests for new types | 10 min | IMPL-013 | `tests/security/csp.test.ts` passes | Modify test file to match new interface |
| IMPL-015 | Analyze Express usage in project.ts | 10 min | IMPL-005 | Determine if Express needed (CLI generator) | Review `/home/matthias/projects/cortex/src/cli/generators/project.ts` |
| IMPL-016 | Remove or replace Express in project.ts | 30 min | IMPL-015 | No Express imports OR documented exception | Refactor CLI generator if needed |
| IMPL-017 | Run zero-dependency verification | 5 min | IMPL-008, IMPL-011, IMPL-014, IMPL-016 | `grep -r "from 'express'" src/` returns empty | Verification only |
| IMPL-018 | Check for circular dependencies | 10 min | IMPL-017 | No circular imports detected | Run: `npx madge --circular --extensions ts src/` |
| IMPL-019 | Fix any circular dependencies found | 30 min | IMPL-018 | Zero circular dependencies | Refactor imports as needed |
| IMPL-020 | Verify npm test still passes | 3 min | IMPL-019 | 251+ tests pass, no regressions | Run: `npm test` |
| **PHASE 3: FIX FAILING TESTS (HIGH PRIORITY)** |||||
| IMPL-021 | Analyze grpc.test.ts failure | 15 min | IMPL-020 | Root cause identified | Review `tests/api/grpc.test.ts` error output |
| IMPL-022 | Fix grpc.test.ts | 60 min | IMPL-021 | Test passes OR marked as skip with reason | Fix or add `test.skip()` with comment |
| IMPL-023 | Analyze fullSystem.test.ts failure | 20 min | IMPL-020 | Root cause identified | Review `tests/integration/fullSystem.test.ts` |
| IMPL-024 | Fix fullSystem.test.ts | 90 min | IMPL-023 | Test passes | Fix uncaught exception |
| IMPL-025 | Analyze tracer.test.ts failure | 15 min | IMPL-020 | Root cause identified | Review `tests/observability/tracing/tracer.test.ts` |
| IMPL-026 | Fix tracer.test.ts | 30 min | IMPL-025 | Test passes | Fix uncaught exception |
| IMPL-027 | Analyze compression.test.ts failure | 15 min | IMPL-020 | Root cause identified | Review `tests/performance/compression.test.ts` |
| IMPL-028 | Fix compression.test.ts | 45 min | IMPL-027 | Test passes | Fix uncaught exception, verify zlib usage |
| IMPL-029 | Analyze httpCache.test.ts failure | 10 min | IMPL-011 | Root cause identified | Review test after Express removal |
| IMPL-030 | Fix httpCache.test.ts | 30 min | IMPL-029 | Test passes | Fix issues from type changes |
| IMPL-031 | Analyze retryExecutor.test.ts failure | 15 min | IMPL-020 | Root cause identified | Review `tests/resilience/retryExecutor.test.ts` |
| IMPL-032 | Fix retryExecutor.test.ts | 30 min | IMPL-031 | Test passes | Fix uncaught exception |
| IMPL-033 | Analyze rateLimiter.test.ts failure | 10 min | IMPL-008 | Root cause identified | Review test after Express removal |
| IMPL-034 | Fix rateLimiter.test.ts | 30 min | IMPL-033 | Test passes | Fix issues from type changes |
| IMPL-035 | Analyze memoryManager.test.ts failure | 20 min | IMPL-020 | Root cause identified | Review `tests/wasm/memoryManager.test.ts` |
| IMPL-036 | Fix memoryManager.test.ts | 45 min | IMPL-035 | Test passes | Fix WASM memory issues |
| IMPL-037 | Analyze utils.test.ts (wasm) failure | 15 min | IMPL-020 | Root cause identified | Review `tests/wasm/utils.test.ts` |
| IMPL-038 | Fix utils.test.ts (wasm) | 30 min | IMPL-037 | Test passes | Fix issues found |
| IMPL-039 | Analyze smartContracts.ethers.test.ts failure | 15 min | IMPL-020 | Root cause identified | Review `tests/web3/smartContracts.ethers.test.ts` |
| IMPL-040 | Fix smartContracts.ethers.test.ts | 45 min | IMPL-039 | Test passes | Fix ethers mock issues |
| IMPL-041 | Analyze workerPool.test.ts failure | 20 min | IMPL-020 | Root cause identified | Review `tests/workers/workerPool.test.ts` |
| IMPL-042 | Fix workerPool.test.ts | 60 min | IMPL-041 | Test passes | Fix worker pool issues |
| IMPL-043 | Run full test suite verification | 5 min | IMPL-022, IMPL-024, IMPL-026, IMPL-028, IMPL-030, IMPL-032, IMPL-034, IMPL-036, IMPL-038, IMPL-040, IMPL-042 | All 262 tests pass | Run: `npm test` |
| IMPL-044 | Verify test coverage >= 95% | 10 min | IMPL-043 | Coverage report shows >= 95% | Run: `npx c8 npm run test:run` |
| **PHASE 4: RISK MITIGATION (HIGH PRIORITY)** |||||
| IMPL-045 | Document workerActor.ts serialization issue | 10 min | IMPL-043 | Issue documented in code comments | Add TODO comments in `src/workers/workerActor.ts:42-43` |
| IMPL-046 | Design worker message protocol | 30 min | IMPL-045 | Protocol specification documented | Create design doc or code comments |
| IMPL-047 | Implement structured cloning for workers | 60 min | IMPL-046 | Messages serialize correctly | Refactor `src/workers/workerActor.ts:71-74` |
| IMPL-048 | Add worker serialization tests | 30 min | IMPL-047 | Tests verify complex data types work | Add tests in `tests/workers/workerActor.test.ts` |
| IMPL-049 | Create WASM memory alignment tests | 45 min | IMPL-044 | Tests cover 16-byte, 32-byte, 64-byte alignment | Add tests in `tests/wasm/memoryManager.test.ts` |
| IMPL-050 | Test WASM on different architectures | 30 min | IMPL-049 | Tests pass on x64, arm64 (if available) | Run tests on CI or different machines |
| IMPL-051 | Add WASM memory overflow detection | 45 min | IMPL-050 | Memory limit errors caught gracefully | Add checks in `src/wasm/memoryManager.ts` |
| IMPL-052 | Verify no eval: true in codebase | 5 min | None | `grep -r "eval:" . --include="*.ts"` returns only docs | Verification only |
| IMPL-053 | Run security audit | 10 min | IMPL-052 | `npm audit` shows 0 vulnerabilities | Run: `npm audit` and fix if needed |
| IMPL-054 | Document known security exceptions | 15 min | IMPL-053 | All exceptions documented | Create/update SECURITY.md |
| **PHASE 5: NEW FEATURES (MEDIUM PRIORITY)** |||||
| IMPL-055 | Review observability system spec | 15 min | IMPL-044 | Requirements understood | Read relevant docs |
| IMPL-056 | Implement metrics collector | 120 min | IMPL-055 | Metrics can be collected | Implement in `src/observability/metrics/` |
| IMPL-057 | Write metrics collector tests | 60 min | IMPL-056 | Tests pass, coverage >= 95% | Add tests in `tests/observability/metrics/` |
| IMPL-058 | Implement distributed tracer | 180 min | IMPL-055 | Tracing works across actors | Implement in `src/observability/tracing/` |
| IMPL-059 | Write distributed tracer tests | 90 min | IMPL-058 | Tests pass, coverage >= 95% | Add tests in `tests/observability/tracing/` |
| IMPL-060 | Implement circuit breaker pattern | 90 min | IMPL-044 | Circuit breaker prevents cascading failures | Implement in `src/resilience/circuitBreaker.ts` |
| IMPL-061 | Write circuit breaker tests | 45 min | IMPL-060 | Tests pass, coverage >= 95% | Add tests in `tests/resilience/circuitBreaker.test.ts` |
| IMPL-062 | Implement retry with backoff | 60 min | IMPL-044 | Retries work with exponential backoff | Enhance `src/resilience/retryExecutor.ts` |
| IMPL-063 | Write retry mechanism tests | 30 min | IMPL-062 | Tests pass, coverage >= 95% | Enhance `tests/resilience/retryExecutor.test.ts` |
| IMPL-064 | Implement bulkhead pattern | 90 min | IMPL-044 | Resource isolation works | Implement in `src/resilience/bulkhead.ts` |
| IMPL-065 | Write bulkhead tests | 45 min | IMPL-064 | Tests pass, coverage >= 95% | Add tests in `tests/resilience/bulkhead.test.ts` |
| IMPL-066 | Integration test for all resilience patterns | 60 min | IMPL-061, IMPL-063, IMPL-065 | All patterns work together | Add test in `tests/integration/resilience.test.ts` |
| IMPL-067 | Final full system integration test | 30 min | All above | Complete system test passes | Run and verify `tests/integration/fullSystem.test.ts` |

---

# SECTION 2: PHASE-BY-PHASE BREAKDOWN

## Phase 1: Testing Infrastructure ✅ COMPLETE

**Goal:** Compile-first testing approach working without warnings
**Start State:** ts-node/esm loader with 37 ExperimentalWarnings
**End State:** TypeScript compile-first, 0 warnings, same test results

### Tasks
- ✅ IMPL-001: Verify tsconfig.test.json exists
- ✅ IMPL-002: Verify npm test scripts updated
- ✅ IMPL-003: Run baseline tests (262 tests, 251 pass, 11 fail)
- ✅ IMPL-004: Add dist-tests to .gitignore

### Validation
```bash
# Verify Phase 1 complete
npm test 2>&1 | grep -c "ExperimentalWarning"  # Should return: 0
npm test 2>&1 | grep "# tests"                  # Should show: 262
```

**Time Estimate:** 5 minutes (verification only - already complete)

---

## Phase 2: Zero-Dependency Compliance 🔴 HIGH PRIORITY

**Goal:** Remove all Express type dependencies from core modules
**Start State:** 4 files import Express types
**End State:** Zero Express imports, using only node:http types

### Tasks
- IMPL-005 through IMPL-020 (16 tasks)
- Focus: rateLimiter.ts, httpCache.ts, csp.ts, project.ts
- Includes: Refactoring + test updates + verification

### Validation
```bash
# Verify zero Express imports
grep -r "from 'express'" src/
# Expected: (empty output)

# Verify no circular dependencies
npx madge --circular --extensions ts src/
# Expected: ✔ No circular dependencies found!

# Verify tests still pass
npm test 2>&1 | grep "# pass"
# Expected: # pass 251 (or more)
```

**Time Estimate:** 2-4 hours
**Risk:** Medium - May uncover hidden dependencies

---

## Phase 3: Fix Failing Tests 🔴 HIGH PRIORITY

**Goal:** Fix all 11 baseline test failures
**Start State:** 11 tests failing (known issues)
**End State:** All 262 tests passing

### Failing Tests (in priority order)

1. **api/grpc.test.ts** - Import/dependency issue (60 min)
2. **integration/fullSystem.test.ts** - Uncaught exception (90 min)
3. **observability/tracing/tracer.test.ts** - Uncaught exception (30 min)
4. **performance/compression.test.ts** - Uncaught exception (45 min)
5. **performance/httpCache.test.ts** - Post-refactor fix (30 min)
6. **resilience/retryExecutor.test.ts** - Uncaught exception (30 min)
7. **security/rateLimiter.test.ts** - Post-refactor fix (30 min)
8. **wasm/memoryManager.test.ts** - Memory issues (45 min)
9. **wasm/utils.test.ts** - WASM loading (30 min)
10. **web3/smartContracts.ethers.test.ts** - Mock issues (45 min)
11. **workers/workerPool.test.ts** - Worker issues (60 min)

### Validation
```bash
# Run each fixed test individually
node --test dist-tests/tests/api/grpc.test.js
node --test dist-tests/tests/integration/fullSystem.test.js
# ... etc for all 11

# Verify all pass
npm test 2>&1 | grep "# fail"
# Expected: # fail 0
```

**Time Estimate:** 8-16 hours
**Risk:** High - May uncover systemic issues

---

## Phase 4: Risk Mitigation 🔴 HIGH PRIORITY

**Goal:** Address critical security and stability risks
**Start State:** Known issues documented
**End State:** All critical risks mitigated with tests

### Risk Areas

1. **Worker Serialization** (IMPL-045 to IMPL-048)
   - Issue: Messages may not serialize complex objects
   - Fix: Implement structured cloning
   - Time: 2.5 hours

2. **WASM Memory Safety** (IMPL-049 to IMPL-051)
   - Issue: Memory alignment varies by architecture
   - Fix: Add alignment tests + overflow detection
   - Time: 2 hours

3. **Security Audit** (IMPL-052 to IMPL-054)
   - Issue: Potential vulnerabilities
   - Fix: Audit + document exceptions
   - Time: 30 minutes

### Validation
```bash
# Verify no eval usage
grep -r "eval:" . --include="*.ts" --exclude-dir=node_modules
# Expected: (only in documentation)

# Security audit
npm audit
# Expected: 0 vulnerabilities

# Worker serialization tests
npm test -- dist-tests/tests/workers/workerActor.test.js
# Expected: All pass including new serialization tests

# WASM memory tests
npm test -- dist-tests/tests/wasm/memoryManager.test.js
# Expected: All pass including alignment tests
```

**Time Estimate:** 4-8 hours
**Risk:** Medium - Platform-specific issues may arise

---

## Phase 5: New Features 🟡 MEDIUM PRIORITY

**Goal:** Implement observability and resilience features
**Start State:** Basic framework complete
**End State:** Production-ready observability and resilience

### Feature Categories

1. **Observability System** (IMPL-055 to IMPL-059)
   - Metrics collector
   - Distributed tracing
   - Time: 7.5 hours

2. **Resilience Patterns** (IMPL-060 to IMPL-066)
   - Circuit breaker
   - Retry with backoff
   - Bulkhead isolation
   - Time: 6.5 hours

3. **Integration Testing** (IMPL-067)
   - Full system test
   - Time: 30 minutes

### Validation
```bash
# Verify observability works
npm test -- dist-tests/tests/observability/**/*.test.js
# Expected: All pass

# Verify resilience patterns work
npm test -- dist-tests/tests/resilience/**/*.test.js
# Expected: All pass

# Verify integration
npm test -- dist-tests/tests/integration/fullSystem.test.js
# Expected: Pass

# Check coverage
npx c8 npm run test:run
# Expected: >= 95% coverage
```

**Time Estimate:** 16-32 hours
**Risk:** Low - Non-critical features

---

# SECTION 3: DAILY STANDUP TEMPLATE

Copy this template for daily progress tracking:

```markdown
## Daily Standup - [DATE]

### Yesterday
- [IMPL-XXX]: ✅ COMPLETE - [Brief description]
- [IMPL-YYY]: 🟡 IN PROGRESS - [What was done]
- [IMPL-ZZZ]: ❌ BLOCKED - [Blocker description]

### Today
- [IMPL-AAA]: Starting work on [description]
- [IMPL-BBB]: Continue [description]
- [IMPL-CCC]: Review and test [description]

### Blockers
- [If any blockers, describe here]
- [Include: what's blocked, why, what's needed to unblock]

### Metrics
- Tests passing: XXX / 262
- Time spent: X hours
- Tasks completed: X / 67
- Current phase: Phase X

### Notes
- [Any important observations or decisions]
```

**Example:**

```markdown
## Daily Standup - 2025-10-22

### Yesterday
- IMPL-001: ✅ COMPLETE - Verified tsconfig.test.json exists
- IMPL-002: ✅ COMPLETE - Verified npm test scripts
- IMPL-003: ✅ COMPLETE - Baseline tests run (251/262 pass)
- IMPL-004: ✅ COMPLETE - Added dist-tests to .gitignore

### Today
- IMPL-005: Identify all Express import locations
- IMPL-006: Analyze Express usage in rateLimiter.ts
- IMPL-007: Replace Express types in rateLimiter.ts

### Blockers
- None

### Metrics
- Tests passing: 251 / 262
- Time spent: 0.5 hours (Phase 1 verification)
- Tasks completed: 4 / 67 (6%)
- Current phase: Phase 1 ✅ → Phase 2

### Notes
- Phase 1 complete, zero ExperimentalWarnings confirmed
- Ready to start Express type removal
```

---

# SECTION 4: COPY-PASTE COMMANDS

## Phase 1: Verify Testing Infrastructure

```bash
# Verify compile-first setup is working
cd /home/matthias/projects/cortex

# Check no experimental warnings
npm test 2>&1 | grep -c "ExperimentalWarning"
# Expected output: 0

# Verify test counts
npm test 2>&1 | grep "# tests\|# pass\|# fail"
# Expected:
# # tests 262
# # pass 251
# # fail 11

# Verify tsconfig.test.json exists
ls -la tsconfig.test.json
# Expected: File exists

# Verify scripts in package.json
cat package.json | grep -A 5 '"scripts"'
# Expected: Contains test:compile, test:run, test, test:watch
```

---

## Phase 2: Find and Remove Express Imports

```bash
# Find all Express imports
grep -r "from 'express'" src/
# Expected output (before fixes):
# src/security/rateLimiter.ts:import { Request, Response, NextFunction } from 'express';
# src/performance/httpCache.ts:import { Request, Response, NextFunction } from 'express';
# src/security/csp.ts:import { Request, Response, NextFunction } from 'express';
# src/cli/generators/project.ts:import { ... } from 'express';

# After completing IMPL-007, IMPL-010, IMPL-013, IMPL-016:
grep -r "from 'express'" src/
# Expected output: (empty)

# Check for circular dependencies
npx madge --circular --extensions ts src/
# Expected output: ✔ No circular dependencies found!

# Verify no regressions
npm test
# Expected: Same or more tests passing
```

---

## Phase 3: Run and Fix Failing Tests

```bash
# Run all tests and see failures
npm test 2>&1 | grep "not ok" -A 3

# Run individual failing tests for debugging
node --test dist-tests/tests/api/grpc.test.js
node --test dist-tests/tests/integration/fullSystem.test.js
node --test dist-tests/tests/observability/tracing/tracer.test.js
node --test dist-tests/tests/performance/compression.test.js
node --test dist-tests/tests/performance/httpCache.test.js
node --test dist-tests/tests/resilience/retryExecutor.test.js
node --test dist-tests/tests/security/rateLimiter.test.js
node --test dist-tests/tests/wasm/memoryManager.test.js
node --test dist-tests/tests/wasm/utils.test.js
node --test dist-tests/tests/web3/smartContracts.ethers.test.js
node --test dist-tests/tests/workers/workerPool.test.js

# After fixes, verify all tests pass
npm test 2>&1 | grep "# fail"
# Expected output: # fail 0

# Verify test count hasn't decreased
npm test 2>&1 | grep "# tests"
# Expected output: # tests 262
```

---

## Phase 4: Risk Mitigation Checks

```bash
# Check for eval usage (security risk)
grep -r "eval:" . --include="*.ts" --exclude-dir=node_modules
# Expected: Only in documentation files (*.md)

# Check for circular dependencies
npx madge --circular --extensions ts src/
# Expected: ✔ No circular dependencies found!

# Security audit
npm audit
# Expected: 0 vulnerabilities
# If vulnerabilities found: npm audit fix

# Run worker serialization tests
npm test -- dist-tests/tests/workers/workerActor.test.js
# Expected: All pass

# Run WASM memory tests
npm test -- dist-tests/tests/wasm/memoryManager.test.js
# Expected: All pass
```

---

## Phase 5: Feature Implementation Verification

```bash
# Test observability features
npm test -- dist-tests/tests/observability/**/*.test.js
# Expected: All pass

# Test resilience features
npm test -- dist-tests/tests/resilience/**/*.test.js
# Expected: All pass

# Run full integration test
npm test -- dist-tests/tests/integration/fullSystem.test.js
# Expected: Pass

# Check test coverage
npx c8 npm run test:run
# Expected: >= 95% coverage across all modules
```

---

## General Utility Commands

```bash
# Clean rebuild (when in doubt)
rm -rf dist-tests && npm test

# Count passing/failing tests
npm test 2>&1 | grep "# pass\|# fail"

# Run tests in watch mode (during development)
npm run test:watch

# Run single test file
node --test dist-tests/tests/environment.test.js

# Debug a specific test
node --inspect-brk --test dist-tests/tests/sometest.test.js

# Check TypeScript compilation without running tests
npm run test:compile

# List all compiled test files
find dist-tests/tests -name "*.test.js" | wc -l
# Expected: 37

# Search for specific pattern in source
grep -r "TODO\|FIXME\|XXX" src/

# Count source files
find src -name "*.ts" | wc -l
# Current: 55

# Count test files
find tests -name "*.test.ts" | wc -l
# Current: 37
```

---

# SECTION 5: RISK CHECKLIST

Copy this checklist and verify before proceeding to next phase:

```markdown
## Risk Mitigation Checklist

### Zero-Dependency Compliance
- [ ] No Express imports: `grep -r "from 'express'" src/` returns empty
- [ ] No external type dependencies in core modules
- [ ] All middleware uses node:http types only
- [ ] CLI generator is exception OR uses zero-dep approach

### Security
- [ ] No eval usage: `grep -r "eval:" . --include="*.ts"` shows only docs
- [ ] npm audit shows 0 vulnerabilities
- [ ] No dynamic code execution in core
- [ ] CSP headers properly configured

### Architecture
- [ ] No circular dependencies detected
- [ ] Module imports follow clean architecture
- [ ] Actor system isolated from implementation details
- [ ] Clear separation between core and features

### Testing
- [ ] All 262 tests execute
- [ ] Zero test failures
- [ ] Test coverage >= 95%
- [ ] No flaky tests (run 3x to verify)

### WASM Safety
- [ ] Memory alignment tests included
- [ ] Overflow detection implemented
- [ ] Platform-specific tests pass
- [ ] Memory limits enforced

### Worker Safety
- [ ] Serialization handles complex objects
- [ ] Structured cloning implemented
- [ ] Error handling in workers
- [ ] Proper worker cleanup

### Performance
- [ ] No performance regressions from baseline
- [ ] Compile time < 30 seconds
- [ ] Test execution < 15 seconds
- [ ] Memory usage reasonable

### Documentation
- [ ] All AMBIGUITY items resolved or documented
- [ ] Breaking changes documented
- [ ] Migration guide for Express removal
- [ ] Security exceptions documented
```

---

# SECTION 6: SUCCESS GATES

Clear gates between phases that MUST be met before proceeding:

## Gate: Phase 1 → Phase 2

**Requirements:**
- ✅ npm test runs without ExperimentalWarnings
- ✅ All 262 tests execute
- ✅ 251 tests pass (baseline maintained)
- ✅ Compile-first approach working
- ✅ dist-tests in .gitignore

**Verification:**
```bash
npm test 2>&1 | grep -c "ExperimentalWarning"  # Output: 0
npm test 2>&1 | grep "# tests"                 # Output: # tests 262
npm test 2>&1 | grep "# pass"                  # Output: # pass 251
```

**Status:** ✅ PASS - Proceed to Phase 2

---

## Gate: Phase 2 → Phase 3

**Requirements:**
- [ ] Zero Express imports in src/
- [ ] Zero circular dependencies
- [ ] npm test still shows 251+ passing
- [ ] No new test failures introduced
- [ ] All refactored tests pass

**Verification:**
```bash
grep -r "from 'express'" src/                 # Output: (empty)
npx madge --circular --extensions ts src/     # Output: No circular dependencies
npm test 2>&1 | grep "# pass"                 # Output: # pass 251 (or more)
```

**Status:** ⏳ PENDING - Must complete Phase 2

---

## Gate: Phase 3 → Phase 4

**Requirements:**
- [ ] All 262 tests pass (zero failures)
- [ ] Test coverage >= 95%
- [ ] No skipped tests (or documented why)
- [ ] All uncaught exceptions fixed
- [ ] Integration test passes

**Verification:**
```bash
npm test 2>&1 | grep "# fail"                 # Output: # fail 0
npm test 2>&1 | grep "# pass"                 # Output: # pass 262
npx c8 npm run test:run | grep "All files"   # Output: >= 95%
```

**Status:** ⏳ PENDING - Must complete Phase 3

---

## Gate: Phase 4 → Phase 5

**Requirements:**
- [ ] All critical risks mitigated
- [ ] No security vulnerabilities (npm audit)
- [ ] Worker serialization tested
- [ ] WASM memory safety tested
- [ ] Security audit complete

**Verification:**
```bash
npm audit                                      # Output: 0 vulnerabilities
grep -r "eval:" . --include="*.ts"            # Output: (only in docs)
npm test -- dist-tests/tests/workers/*.js     # Output: All pass
npm test -- dist-tests/tests/wasm/*.js        # Output: All pass
```

**Status:** ⏳ PENDING - Must complete Phase 4

---

## Gate: Phase 5 → Complete

**Requirements:**
- [ ] All observability features implemented and tested
- [ ] All resilience patterns implemented and tested
- [ ] Full system integration test passes
- [ ] Test coverage >= 95% overall
- [ ] Documentation complete

**Verification:**
```bash
npm test                                       # Output: # pass 262, # fail 0
npx c8 npm run test:run                       # Output: >= 95% coverage
npm test -- dist-tests/tests/integration/*.js # Output: All pass
```

**Status:** ⏳ PENDING - Must complete Phase 5

---

# SECTION 7: FILE-BY-FILE ACTION ITEMS

## Security Module

### src/security/rateLimiter.ts
- **Status:** ❌ Express dependency violation
- **Issues:**
  - Line 1: `import { Request, Response, NextFunction } from 'express';`
  - Uses Express types throughout
- **Changes Needed:**
  - Replace Express types with node:http equivalents
  - Update interface definitions
  - Refactor middleware function signature
- **Validation:** `tests/security/rateLimiter.test.ts` must pass
- **Test Count:** 8 tests (estimated)
- **Effort:** 20 minutes refactor + 15 minutes test update
- **Task IDs:** IMPL-006, IMPL-007, IMPL-008

### src/security/csp.ts
- **Status:** ❌ Express dependency violation
- **Issues:**
  - Line 1: `import { Request, Response, NextFunction } from 'express';`
  - CSPBuilder.middleware uses Express types
- **Changes Needed:**
  - Replace Express types with node:http
  - Update middleware method signature (line 19)
- **Validation:** `tests/security/csp.test.ts` must pass
- **Test Count:** 6 tests (estimated)
- **Effort:** 20 minutes refactor + 10 minutes test update
- **Task IDs:** IMPL-012, IMPL-013, IMPL-014

---

## Performance Module

### src/performance/httpCache.ts
- **Status:** ❌ Express dependency violation
- **Issues:**
  - Line 1: `import { Request, Response, NextFunction } from 'express';`
  - All exported functions use Express types
- **Changes Needed:**
  - Replace Express types (lines 1, 4, 9, 14, 18)
  - Update conditional GET middleware
- **Validation:** `tests/performance/httpCache.test.ts` must pass
- **Test Count:** 10 tests (estimated)
- **Effort:** 20 minutes refactor + 15 minutes test update
- **Task IDs:** IMPL-009, IMPL-010, IMPL-011

### src/performance/compression.ts
- **Status:** 🟡 Implementation incomplete
- **Issues:**
  - Placeholder implementation
  - Failing test: `tests/performance/compression.test.ts`
- **Changes Needed:**
  - Implement actual Brotli/Gzip compression
  - Use node:zlib module
  - Streaming implementation needed
- **Validation:** All compression tests pass
- **Test Count:** 8 tests (estimated)
- **Effort:** 45 minutes implementation + test fixes
- **Task IDs:** IMPL-027, IMPL-028

---

## Workers Module

### src/workers/workerActor.ts
- **Status:** 🟡 Serialization issues
- **Issues:**
  - Line 42-43: Passes ActorSystem proxy (not serializable)
  - Line 4-40: Worker code template uses string concatenation (fragile)
  - Line 52: TODO comment about ActorSystem proxy
- **Changes Needed:**
  - Implement structured cloning for messages
  - Design proper message protocol
  - Refactor worker initialization
- **Validation:** `tests/workers/workerActor.test.ts` passes with complex objects
- **Test Count:** 5 existing + 3 new tests
- **Effort:** 30 min design + 60 min implementation + 30 min tests
- **Task IDs:** IMPL-045, IMPL-046, IMPL-047, IMPL-048

### src/workers/workerPool.ts
- **Status:** 🟡 Implementation incomplete
- **Issues:**
  - Failing test: `tests/workers/workerPool.test.ts`
  - Worker pool management may have issues
- **Changes Needed:**
  - Debug worker pool failures
  - Fix worker lifecycle management
- **Validation:** All worker pool tests pass
- **Test Count:** 12 tests (estimated)
- **Effort:** 60 minutes debugging and fixes
- **Task IDs:** IMPL-041, IMPL-042

---

## WASM Module

### src/wasm/memoryManager.ts
- **Status:** ❌ Test failures
- **Issues:**
  - Failing test: `tests/wasm/memoryManager.test.ts`
  - Memory alignment issues
  - No overflow detection
- **Changes Needed:**
  - Add memory alignment checks
  - Implement overflow detection
  - Platform-specific handling
- **Validation:** All memory manager tests pass
- **Test Count:** 8 existing + 5 new alignment tests
- **Effort:** 45 minutes fixes + 45 minutes new tests
- **Task IDs:** IMPL-035, IMPL-036, IMPL-049, IMPL-051

### src/wasm/utils.ts
- **Status:** ❌ Test failures
- **Issues:**
  - Failing test: `tests/wasm/utils.test.ts`
  - WASM loading issues
- **Changes Needed:**
  - Debug and fix WASM loading
  - Handle error cases properly
- **Validation:** All WASM utils tests pass
- **Test Count:** 4 tests
- **Effort:** 30 minutes
- **Task IDs:** IMPL-037, IMPL-038

---

## Web3 Module

### src/web3/smartContracts.ts
- **Status:** 🟡 Ethers test failing
- **Issues:**
  - Failing test: `tests/web3/smartContracts.ethers.test.ts`
  - Mock setup issues
- **Changes Needed:**
  - Fix ethers mock configuration
  - Ensure proper test isolation
- **Validation:** Ethers test passes
- **Test Count:** 6 tests (estimated)
- **Effort:** 45 minutes
- **Task IDs:** IMPL-039, IMPL-040

---

## API Module

### src/api/grpc.ts
- **Status:** ❌ Import issues
- **Issues:**
  - Failing test: `tests/api/grpc.test.ts`
  - gRPC module import failing
  - May conflict with zero-dependency goal
- **Changes Needed:**
  - Fix gRPC imports OR mark as optional feature
  - Document gRPC as peer dependency if needed
- **Validation:** Test passes OR properly skipped with reason
- **Test Count:** 10 tests (estimated)
- **Effort:** 60 minutes (may need architectural decision)
- **Task IDs:** IMPL-021, IMPL-022

---

## Observability Module

### src/observability/tracing/tracer.ts
- **Status:** ❌ Uncaught exception
- **Issues:**
  - Failing test: `tests/observability/tracing/tracer.test.ts`
  - Uncaught exception in test
- **Changes Needed:**
  - Fix exception handling
  - Ensure proper async/await usage
- **Validation:** All tracing tests pass
- **Test Count:** 8 tests (estimated)
- **Effort:** 30 minutes
- **Task IDs:** IMPL-025, IMPL-026

---

## Resilience Module

### src/resilience/retryExecutor.ts
- **Status:** ❌ Uncaught exception
- **Issues:**
  - Failing test: `tests/resilience/retryExecutor.test.ts`
  - Uncaught exception in test
- **Changes Needed:**
  - Fix exception handling
  - Implement proper error propagation
- **Validation:** All retry tests pass
- **Test Count:** 10 tests (estimated)
- **Effort:** 30 minutes
- **Task IDs:** IMPL-031, IMPL-032

---

## Integration Tests

### tests/integration/fullSystem.test.ts
- **Status:** ❌ Uncaught exception
- **Issues:**
  - Uncaught exception causing test failure
  - May be dependent on other fixes
- **Changes Needed:**
  - Fix uncaught exception
  - Ensure all modules integrate properly
  - May need to wait for Phase 3 completion
- **Validation:** Full system test passes
- **Test Count:** 15 tests (estimated)
- **Effort:** 90 minutes (complex integration)
- **Task IDs:** IMPL-023, IMPL-024

---

## CLI Module

### src/cli/generators/project.ts
- **Status:** ⚠️ Express dependency (review needed)
- **Issues:**
  - Imports Express
  - May be intentional for project generation
- **Changes Needed:**
  - Review if Express needed for code generation
  - Either remove OR document as generator-only exception
  - If removed, provide alternative for generated projects
- **Validation:** CLI generator works without Express OR exception documented
- **Test Count:** Unknown (may not have tests)
- **Effort:** 10 min analysis + 30 min refactor (if needed)
- **Task IDs:** IMPL-015, IMPL-016

---

# SECTION 8: BEFORE/AFTER CODE EXAMPLES

## Example 1: Express Type Replacement (rateLimiter.ts)

### BEFORE (Current - ❌ Violates zero-dependency)

```typescript
import { Request, Response, NextFunction } from 'express';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message: string;
}

export function rateLimiter(options?: Partial<RateLimiterOptions>) {
  const opts = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? 'unknown';

    if (client.count >= opts.max) {
      res.status(429).send(opts.message);
      return;
    }

    client.count++;
    next();
  };
}
```

### AFTER (Target - ✅ Zero-dependency compliant)

```typescript
import { IncomingMessage, ServerResponse } from 'node:http';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message: string;
}

type NextFunction = () => void;
type RateLimiterMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction
) => void;

export function rateLimiter(options?: Partial<RateLimiterOptions>): RateLimiterMiddleware {
  const opts = { ...defaultOptions, ...options };

  return (req: IncomingMessage, res: ServerResponse, next: NextFunction): void => {
    // Extract IP from socket
    const ip = req.socket.remoteAddress ?? 'unknown';

    if (client.count >= opts.max) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'text/plain');
      res.end(opts.message);
      return;
    }

    client.count++;
    next();
  };
}
```

### Key Changes
1. Replace `express` import with `node:http`
2. Define `NextFunction` type locally
3. Use `req.socket.remoteAddress` instead of `req.ip`
4. Use `res.statusCode` and `res.end()` instead of `res.status().send()`
5. Set Content-Type header explicitly

### Test Update Required
```typescript
// Update test mocks to use IncomingMessage/ServerResponse
import { IncomingMessage, ServerResponse } from 'node:http';

// Before: const mockReq = { ip: '127.0.0.1' } as Request;
// After:
const mockReq = {
  socket: { remoteAddress: '127.0.0.1' }
} as IncomingMessage;

// Before: const mockRes = { status: jest.fn(), send: jest.fn() } as any;
// After:
const mockRes = {
  statusCode: 0,
  setHeader: (name: string, value: string) => {},
  end: (data: string) => {}
} as ServerResponse;
```

---

## Example 2: Worker Serialization Fix (workerActor.ts)

### BEFORE (Current - 🟡 Serialization issues)

```typescript
export class WorkerActor extends Actor {
  private worker: Worker;

  constructor(id: string, system: ActorSystem, wasmModuleUrl?: string) {
    super(id, system);
    this.worker = new Worker(workerUrl);

    // ❌ PROBLEM: ActorSystem cannot be serialized
    this.worker.postMessage({
      type: 'init',
      actorId: this.id,
      system: 'TODO: Pass a proxy for ActorSystem',  // <-- Issue
      wasmModuleUrl
    });
  }

  public receive(message: any): void {
    // ❌ PROBLEM: 'message' may contain non-serializable data
    this.worker.postMessage({ type: 'message', message });
  }
}
```

### AFTER (Target - ✅ Structured cloning)

```typescript
// Define serializable message protocol
interface WorkerMessage {
  type: 'init' | 'message' | 'result';
  payload: SerializableData;
}

interface SerializableData {
  [key: string]: string | number | boolean | null | SerializableData | SerializableData[];
}

export class WorkerActor extends Actor {
  private worker: Worker;
  private systemProxy: ActorSystemProxy;

  constructor(id: string, system: ActorSystem, wasmModuleUrl?: string) {
    super(id, system);
    this.worker = new Worker(workerUrl);

    // ✅ Create serializable proxy for ActorSystem
    this.systemProxy = {
      actorId: this.id,
      send: (targetId: string, message: SerializableData) => {
        system.send(targetId, message);
      }
    };

    // ✅ Send only serializable initialization data
    this.worker.postMessage({
      type: 'init',
      payload: {
        actorId: this.id,
        systemProxy: this.systemProxy,
        wasmModuleUrl: wasmModuleUrl ?? null
      }
    } satisfies WorkerMessage);
  }

  public receive(message: any): void {
    // ✅ Validate and serialize message
    const serializable = this.ensureSerializable(message);
    this.worker.postMessage({
      type: 'message',
      payload: serializable
    } satisfies WorkerMessage);
  }

  private ensureSerializable(data: any): SerializableData {
    // Deep clone and validate serializability
    try {
      return structuredClone(data);
    } catch (error) {
      throw new Error(`Cannot serialize message: ${error}`);
    }
  }
}
```

### Key Changes
1. Define `WorkerMessage` protocol for type safety
2. Create `ActorSystemProxy` with only serializable methods
3. Use `structuredClone()` to validate serializability
4. Replace freeform `any` with `SerializableData` type
5. Add error handling for non-serializable data

### Test Addition Required
```typescript
test('WorkerActor handles complex serializable objects', async () => {
  const complexMessage = {
    nested: {
      array: [1, 2, 3],
      string: 'test',
      boolean: true,
      null: null,
      date: new Date().toISOString() // Dates must be strings
    }
  };

  const actor = new WorkerActor('test-actor', mockSystem);

  // Should not throw
  actor.receive(complexMessage);

  // Verify message was sent
  await new Promise(resolve => setTimeout(resolve, 100));
  // Assert worker received structured clone
});

test('WorkerActor rejects non-serializable objects', () => {
  const actor = new WorkerActor('test-actor', mockSystem);

  const nonSerializable = {
    fn: () => {},  // Functions cannot be serialized
    symbol: Symbol('test')  // Symbols cannot be serialized
  };

  // Should throw error
  expect(() => actor.receive(nonSerializable)).toThrow('Cannot serialize');
});
```

---

## Example 3: WASM Memory Alignment (memoryManager.ts)

### BEFORE (Current - ❌ No alignment checks)

```typescript
export class WasmMemoryManager {
  private memory: WebAssembly.Memory;

  allocate(size: number): number {
    // ❌ PROBLEM: No alignment check
    const ptr = this.currentOffset;
    this.currentOffset += size;
    return ptr;
  }

  write(ptr: number, data: ArrayBuffer): void {
    // ❌ PROBLEM: No bounds checking
    const view = new Uint8Array(this.memory.buffer);
    const dataView = new Uint8Array(data);
    view.set(dataView, ptr);
  }
}
```

### AFTER (Target - ✅ Memory safety)

```typescript
export class WasmMemoryManager {
  private memory: WebAssembly.Memory;
  private currentOffset: number = 0;
  private readonly alignment: number;
  private readonly maxSize: number;

  constructor(memory: WebAssembly.Memory, alignment: number = 16) {
    this.memory = memory;
    this.alignment = alignment;
    this.maxSize = memory.buffer.byteLength;

    // Ensure alignment is power of 2
    if ((alignment & (alignment - 1)) !== 0) {
      throw new Error(`Alignment must be power of 2, got ${alignment}`);
    }
  }

  allocate(size: number, customAlignment?: number): number {
    const align = customAlignment ?? this.alignment;

    // ✅ Align pointer to required boundary
    const alignedOffset = this.alignUp(this.currentOffset, align);

    // ✅ Check for overflow
    if (alignedOffset + size > this.maxSize) {
      throw new Error(
        `Memory overflow: requested ${size} bytes at offset ${alignedOffset}, ` +
        `but max is ${this.maxSize}`
      );
    }

    const ptr = alignedOffset;
    this.currentOffset = alignedOffset + size;
    return ptr;
  }

  write(ptr: number, data: ArrayBuffer): void {
    // ✅ Validate bounds
    if (ptr < 0 || ptr + data.byteLength > this.memory.buffer.byteLength) {
      throw new Error(
        `Write out of bounds: ptr=${ptr}, size=${data.byteLength}, ` +
        `memory size=${this.memory.buffer.byteLength}`
      );
    }

    // ✅ Check alignment
    if (ptr % this.alignment !== 0) {
      console.warn(`Unaligned write at ${ptr} (alignment=${this.alignment})`);
    }

    const view = new Uint8Array(this.memory.buffer);
    const dataView = new Uint8Array(data);
    view.set(dataView, ptr);
  }

  private alignUp(value: number, alignment: number): number {
    return (value + alignment - 1) & ~(alignment - 1);
  }

  // ✅ Add memory statistics for debugging
  getStats(): { used: number; total: number; alignment: number } {
    return {
      used: this.currentOffset,
      total: this.maxSize,
      alignment: this.alignment
    };
  }
}
```

### Key Changes
1. Add configurable alignment parameter
2. Implement `alignUp()` for proper pointer alignment
3. Add overflow detection in `allocate()`
4. Add bounds checking in `write()`
5. Add alignment validation on construction
6. Add warning for unaligned writes
7. Add `getStats()` for memory monitoring

### Test Addition Required
```typescript
test('WasmMemoryManager enforces 16-byte alignment', () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const manager = new WasmMemoryManager(memory, 16);

  const ptr1 = manager.allocate(10);  // Allocate 10 bytes
  expect(ptr1 % 16).toBe(0);  // First allocation at 0

  const ptr2 = manager.allocate(10);  // Allocate another 10 bytes
  expect(ptr2 % 16).toBe(0);  // Should be aligned to 16
  expect(ptr2).toBe(16);  // Not 10, because of alignment
});

test('WasmMemoryManager handles 32-byte alignment', () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const manager = new WasmMemoryManager(memory, 32);

  const ptr = manager.allocate(10, 32);
  expect(ptr % 32).toBe(0);
});

test('WasmMemoryManager detects overflow', () => {
  const memory = new WebAssembly.Memory({ initial: 1 });  // 64KB
  const manager = new WasmMemoryManager(memory);

  // Try to allocate more than available
  expect(() => {
    manager.allocate(70 * 1024);  // 70KB > 64KB
  }).toThrow('Memory overflow');
});

test('WasmMemoryManager rejects invalid alignment', () => {
  const memory = new WebAssembly.Memory({ initial: 1 });

  // Alignment must be power of 2
  expect(() => {
    new WasmMemoryManager(memory, 15);  // 15 is not power of 2
  }).toThrow('Alignment must be power of 2');
});

test('WasmMemoryManager detects out-of-bounds writes', () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const manager = new WasmMemoryManager(memory);

  const hugeData = new ArrayBuffer(70 * 1024);  // 70KB

  expect(() => {
    manager.write(0, hugeData);  // Won't fit in 64KB
  }).toThrow('Write out of bounds');
});
```

---

# SECTION 9: RISK ASSESSMENT MATRIX

| Risk Area | Likelihood | Impact | Mitigation Strategy | Residual Risk |
|-----------|-----------|--------|---------------------|---------------|
| **Express Type Removal** | High | Medium | Gradual refactor with test coverage | Low |
| **Test Failures Cascading** | Medium | High | Fix in priority order, test after each | Medium |
| **Worker Serialization** | Medium | High | Implement structured cloning protocol | Low |
| **WASM Memory Alignment** | Medium | Medium | Platform-specific tests + overflow detection | Low |
| **Circular Dependencies** | Low | Medium | Madge verification after each change | Very Low |
| **Performance Regression** | Low | Low | Benchmark before/after | Very Low |
| **gRPC Zero-Dep Conflict** | High | Medium | Document as optional peer dependency | Medium |
| **Breaking API Changes** | Medium | High | Maintain backward compatibility layer | Medium |
| **Flaky Tests** | Medium | Low | Run tests 3x, fix non-deterministic issues | Low |
| **Platform-Specific Bugs** | Low | Medium | CI testing on multiple platforms | Low |

### Risk Response Plan

**High Priority Risks (Address in Phase 2-4):**
1. **Express Type Removal** - Tasks IMPL-005 to IMPL-020
2. **Test Failures Cascading** - Tasks IMPL-021 to IMPL-042
3. **Worker Serialization** - Tasks IMPL-045 to IMPL-048
4. **gRPC Zero-Dep Conflict** - Task IMPL-021, IMPL-022 (may require architecture decision)

**Medium Priority Risks (Monitor and address as needed):**
1. **Circular Dependencies** - Task IMPL-018, IMPL-019
2. **WASM Memory Alignment** - Tasks IMPL-049 to IMPL-051
3. **Breaking API Changes** - Document in migration guide

**Low Priority Risks (Accept or mitigate opportunistically):**
1. **Performance Regression** - Benchmark in Phase 3
2. **Flaky Tests** - Fix as encountered
3. **Platform-Specific Bugs** - Test in CI

---

# SECTION 10: PERFORMANCE BENCHMARKS

## Baseline Performance (ts-node/esm approach)

```bash
# Capture baseline
time npm test
```

**Expected Baseline:**
- Total time: ~20-25 seconds
- Compilation (JIT): ~10-12 seconds
- Execution: ~10-13 seconds
- ExperimentalWarnings: 37

## Target Performance (compile-first approach)

```bash
# First run (with compilation)
time npm test

# Second run (pre-compiled)
time npm run test:run
```

**Expected Target:**
- First run: ~15-20 seconds total
  - Compilation (AOT): ~8-10 seconds
  - Execution: ~7-10 seconds
  - ExperimentalWarnings: 0
- Second run: ~7-10 seconds (execution only)
- CI with cache: ~7-10 seconds (execution only)

**Performance Goals:**
- ✅ First run: Equal or faster than baseline
- ✅ Subsequent runs: 50% faster (no re-compilation)
- ✅ CI with caching: 60% faster

## Benchmark Commands

```bash
# Create benchmark script
cat > /tmp/benchmark.sh << 'EOF'
#!/bin/bash
echo "=== PERFORMANCE BENCHMARK ==="

echo "Run 1 (clean build):"
rm -rf dist-tests
time npm test 2>&1 | tail -1

echo ""
echo "Run 2 (pre-compiled):"
time npm run test:run 2>&1 | tail -1

echo ""
echo "Run 3 (compile only):"
rm -rf dist-tests
time npm run test:compile 2>&1 | tail -1
EOF

chmod +x /tmp/benchmark.sh
/tmp/benchmark.sh
```

---

# SECTION 11: CONTINUOUS INTEGRATION SETUP

## GitHub Actions Workflow (Recommended)

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Cache compiled tests
        uses: actions/cache@v3
        with:
          path: dist-tests
          key: ${{ runner.os }}-tests-${{ hashFiles('src/**/*.ts', 'tests/**/*.ts') }}
          restore-keys: |
            ${{ runner.os }}-tests-

      - name: Compile tests
        run: npm run test:compile

      - name: Run tests
        run: npm run test:run

      - name: Check test coverage
        run: npx c8 npm run test:run

      - name: Security audit
        run: npm audit --audit-level=moderate

      - name: Check for circular dependencies
        run: npx madge --circular --extensions ts src/
```

## Pre-commit Hook (Optional)

```bash
# .git/hooks/pre-commit
#!/bin/bash
echo "Running pre-commit checks..."

# Compile tests
npm run test:compile || exit 1

# Run tests
npm run test:run || exit 1

# Check for Express imports
if grep -r "from 'express'" src/ --quiet; then
  echo "ERROR: Express imports found in src/"
  exit 1
fi

echo "Pre-commit checks passed!"
```

---

# SECTION 12: QUICK DECISION TREE

Use this decision tree when stuck:

```
Q: Tests failing after change?
├─ YES → Run individual test: `node --test dist-tests/tests/failing.test.js`
│   ├─ Import error? → Check .js extensions in imports
│   ├─ Type error? → Ensure source compiled: `ls dist-tests/src/`
│   └─ Runtime error? → Check for non-serializable data
└─ NO → Proceed to next task

Q: Performance slower than expected?
├─ YES → Enable incremental compilation in tsconfig.test.json
└─ NO → Proceed to next task

Q: Circular dependency detected?
├─ YES → Use madge to visualize: `npx madge --circular --image deps.svg src/`
└─ NO → Proceed to next task

Q: Express removal causing issues?
├─ YES → Check if file is in core (src/) or examples (examples/)
│   ├─ Core → Must remove Express
│   └─ Examples → Express allowed
└─ NO → Proceed to next task

Q: WASM test failing?
├─ YES → Check platform: `uname -m`
│   ├─ x86_64 → Use 16-byte alignment
│   ├─ arm64 → May need 32-byte alignment
│   └─ Other → Check WASM spec for platform
└─ NO → Proceed to next task

Q: Worker test failing?
├─ YES → Check serialization
│   ├─ Functions in message? → Cannot serialize, refactor
│   ├─ Symbols in message? → Cannot serialize, refactor
│   └─ Circular refs? → Use structured clone
└─ NO → Proceed to next task

Q: Unsure if change is safe?
├─ YES → Run full test suite: `npm test`
│   ├─ All pass → Safe to commit
│   └─ Some fail → Revert and investigate
└─ NO → Proceed with confidence
```

---

# SECTION 13: COMPLETION CHECKLIST

Use this final checklist before marking the project complete:

## Code Quality
- [ ] All 67 tasks completed
- [ ] All 262 tests passing
- [ ] Zero test failures
- [ ] Test coverage >= 95%
- [ ] No ExperimentalWarnings
- [ ] No TypeScript errors
- [ ] No ESLint errors (if configured)

## Zero-Dependency Compliance
- [ ] No Express imports in src/: `grep -r "from 'express'" src/` is empty
- [ ] No other framework dependencies in core
- [ ] All external deps are devDependencies or peerDependencies
- [ ] Madge shows no circular dependencies

## Security
- [ ] npm audit shows 0 vulnerabilities
- [ ] No eval usage: `grep -r "eval:" . --include="*.ts"` shows only docs
- [ ] CSP headers configured
- [ ] Rate limiting implemented
- [ ] Input validation in place

## Performance
- [ ] Tests run in < 15 seconds (first run)
- [ ] Tests run in < 10 seconds (subsequent runs)
- [ ] No memory leaks detected
- [ ] Compilation time < 30 seconds

## Documentation
- [ ] README.md updated
- [ ] All AMBIGUITY items resolved
- [ ] Migration guide created (if breaking changes)
- [ ] API documentation complete
- [ ] Examples provided for major features

## Risk Mitigation
- [ ] Worker serialization tested with complex objects
- [ ] WASM memory alignment tested on multiple platforms
- [ ] All critical risks from Phase 4 addressed
- [ ] Security exceptions documented

## Integration
- [ ] Full system integration test passes
- [ ] All observability features working
- [ ] All resilience patterns working
- [ ] CI/CD pipeline passing

## Git Hygiene
- [ ] All changes committed
- [ ] Commit messages descriptive
- [ ] No large binary files committed
- [ ] .gitignore properly configured

---

# SECTION 14: CONTACT AND ESCALATION

## When to Escalate

**Immediate Escalation (Stop work and escalate):**
- npm audit shows CRITICAL vulnerabilities
- Test coverage drops below 90%
- More than 5 new test failures introduced by a change
- Circular dependency cannot be resolved
- Security issue discovered (eval, code injection, etc.)

**Standard Escalation (Finish current task, then escalate):**
- Task taking 2x estimated time
- Ambiguity cannot be resolved with available information
- Architectural decision needed (e.g., gRPC as peer dependency)
- Breaking changes required to fix issue

## Escalation Template

```markdown
## Escalation: [Brief Issue Description]

**Task ID:** IMPL-XXX
**Priority:** [CRITICAL / HIGH / MEDIUM]
**Impact:** [Description of impact]

### Issue Description
[Detailed description of the problem]

### What I've Tried
1. [Action 1]
2. [Action 2]
3. [Action 3]

### Current State
- Tests passing: XXX / 262
- Tasks completed: XX / 67
- Time spent on this task: X hours
- Estimated additional time: X hours (or unknown)

### Options Considered
1. **Option 1:** [Description]
   - Pros: [...]
   - Cons: [...]
2. **Option 2:** [Description]
   - Pros: [...]
   - Cons: [...]

### Recommendation
[Your recommendation, if any]

### Blocker Status
- [ ] Blocking all work
- [ ] Blocking current phase
- [ ] Blocking current task only
- [ ] Not blocking (can continue on other tasks)

### Questions
1. [Specific question 1]
2. [Specific question 2]
```

---

# APPENDIX A: TOOL VERSIONS

Ensure these versions are used:

```bash
node --version    # v18.0.0 or higher
npm --version     # v9.0.0 or higher
npx tsc --version # v5.9.3 (project version)
```

If versions differ, update:
```bash
nvm install 18    # Or higher
nvm use 18
npm install -g npm@latest
```

---

# APPENDIX B: USEFUL DEBUGGING COMMANDS

```bash
# TypeScript compilation diagnostics
npx tsc --project tsconfig.test.json --extendedDiagnostics

# Trace module resolution
npx tsc --project tsconfig.test.json --traceResolution | grep "error"

# Show TypeScript configuration
npx tsc --project tsconfig.test.json --showConfig

# Test with verbose output
node --test --test-reporter spec dist-tests/tests/**/*.test.js

# Debug specific test
node --inspect-brk --test dist-tests/tests/sometest.test.js

# Check import graph
npx madge --image graph.svg src/

# Find circular dependencies
npx madge --circular --extensions ts src/

# Analyze bundle size (if applicable)
npx esbuild src/index.ts --bundle --analyze

# Memory profiling
node --expose-gc --test dist-tests/tests/**/*.test.js

# CPU profiling
node --prof --test dist-tests/tests/**/*.test.js
node --prof-process isolate-*.log > profile.txt
```

---

# APPENDIX C: GLOSSARY

- **AOT**: Ahead-of-Time compilation (compile before run)
- **JIT**: Just-in-Time compilation (compile during run)
- **ESM**: ECMAScript Modules (import/export syntax)
- **CJS**: CommonJS (require/module.exports syntax)
- **TAP**: Test Anything Protocol (test output format)
- **CSP**: Content Security Policy
- **WASM**: WebAssembly
- **TDD**: Test-Driven Development
- **DX**: Developer Experience
- **CI/CD**: Continuous Integration/Continuous Deployment
- **Structured Cloning**: Deep copy that works across worker boundaries

---

# FINAL NOTES

**This roadmap is a living document.** Update it as you progress:

1. Mark tasks as complete: Change `[ ]` to `[x]` or add ✅
2. Update time estimates if actual time differs significantly
3. Add notes about blockers or issues encountered
4. Document decisions made during implementation
5. Update AMBIGUITY items as they are resolved

**Remember:**
- When in doubt, run the tests: `npm test`
- If stuck for > 30 minutes, escalate or move to another task
- Keep commits small and atomic
- Test after every change
- Document as you go, not at the end

**Good luck!** 🚀

---

**Document Version:** 1.0
**Created:** 2025-10-22
**Last Updated:** 2025-10-22
**Author:** Coder Agent
**Status:** READY FOR USE
