# Plan: Full System Stabilization and Refactoring

**Objective:** To create a rock-solid, production-ready foundation for the Cortex Framework by first eliminating all existing test failures and then implementing significant architectural improvements based on prior research.

---

## Phase 1: Codebase Stabilization (Fix All Failing Tests)

**Goal:** Achieve a 100% passing test suite. Each failing test will be addressed individually in the order specified in `TODO.md`.

**Methodology for each task:**
1.  **Isolate and Analyze:** Read the test file and corresponding source code. Run only the failing test to reproduce the error and analyze the output.
2.  **Hypothesize:** Form a clear hypothesis about the root cause.
3.  **Implement Fix:** Apply the minimal necessary code changes to fix the issue.
4.  **Verify:** Run the single test again to confirm it passes.
5.  **Regression Check:** Run all tests within the affected module to ensure no new issues were introduced.

---

*   **Task 1.1: Fix `tests/api/grpc.test.ts`**
    *   **Analysis:** The failure is likely due to incorrect mocking of gRPC dependencies or issues with dynamic imports after the test compilation setup.
    *   **Action:** Review the gRPC mock setup and ensure all necessary components are available in the test environment.

*   **Task 1.2: Fix `tests/integration/fullSystem.test.ts`**
    *   **Analysis:** An "uncaught exception" suggests an error is being thrown asynchronously that isn't being caught by the test's `try/catch` blocks. This often happens with un-awaited Promises or event emitter errors.
    *   **Action:** Trace the execution flow, paying close attention to the `EventBus` and `ActorSystem` interactions. Ensure all asynchronous operations are properly awaited.

*   **Task 1.3: Fix `tests/observability/tracing/tracer.test.ts`**
    *   **Analysis:** Similar to the integration test, an uncaught exception points to an unhandled asynchronous error, likely within the `Span` lifecycle or export process.
    *   **Action:** Review the `startSpan` and `end` methods in the `Tracer` and `Span` implementations for any unhandled Promise rejections.

*   **Task 1.4: Fix `tests/performance/compression.test.ts`**
    *   **Analysis:** The `MASTER_PLAN.md` clearly identifies this as a failure in the streaming implementation. The current code buffers the entire response.
    *   **Action:** Implement a true streaming solution using Node.js `Transform` streams (`zlib.createGzip`, `zlib.createBrotliCompress`). The compression stream must be piped to the response stream as data is written.

*   **Task 1.5: Fix `tests/performance/httpCache.test.ts`**
    *   **Analysis:** Failures likely stem from the Phase 2 refactoring where Express types were removed. The mock request/response objects may no longer behave as the `httpCache` middleware expects.
    *   **Action:** Update the test mocks to perfectly replicate the behavior of `node:http` `IncomingMessage` and `ServerResponse`, especially regarding headers.

*   **Task 1.6: Fix `tests/resilience/retryExecutor.test.ts`**
    *   **Analysis:** An uncaught exception in a retry mechanism often involves an error in the final attempt's error propagation or a problem in the delay logic.
    *   **Action:** Scrutinize the loop condition and the final `throw lastError!` statement. Ensure the sleep/delay function is correctly implemented and awaited.

*   **Task 1.7: Fix `tests/security/rateLimiter.test.ts`**
    *   **Analysis:** Like `httpCache`, this is probably a result of the Express type removal. The test mocks for request IP and headers are the primary suspects.
    *   **Action:** Adjust test mocks to align with the `node:http` API for accessing request information.

*   **Task 1.8: Fix `tests/wasm/memoryManager.test.ts`**
    *   **Analysis:** WASM memory issues can be complex, often related to incorrect pointer arithmetic, buffer overflows, or alignment issues.
    *   **Action:** Add verbose logging to the `allocate`, `deallocate`, `read`, and `write` methods to trace memory blocks and pointers. Verify that buffer sizes match the allocated memory segments precisely.

*   **Task 1.9: Fix `tests/wasm/utils.test.ts`**
    *   **Analysis:** A WASM loading issue in tests points to a problem with how the test runner handles file paths or binary data.
    *   **Action:** Ensure the path to the `.wasm` file is correctly resolved from the `dist-tests/` directory. Use `fs.readFileSync` with `path.resolve` to be explicit.

*   **Task 1.10: Fix `tests/web3/smartContracts.ethers.test.ts`**
    *   **Analysis:** The `ethers.ts` mock is likely incomplete or incorrect, failing to simulate the behavior of the real `ethers` library as expected by the `SmartContractClient`.
    *   **Action:** Expand the mock to include all properties and methods being accessed by the client under test.

*   **Task 1.11: Fix `tests/workers/workerPool.test.ts`**
    *   **Analysis:** Worker pool issues often relate to incorrect message passing, worker script termination, or race conditions in task queues.
    *   **Action:** Implement robust event listeners for `online`, `message`, `error`, and `exit` on each worker thread to diagnose its lifecycle.

---

## Phase 2: Implement Core Testing Infrastructure (`TimeProvider`)

**Goal:** Decouple the system from `Date.now()` to enable fast, deterministic, and reliable time-based testing.

*   **Task 2.1: Define `TimeProvider` Interface**
    *   **Action:** Create a new file `src/utils/time.ts`.
    *   **Content:** `export interface TimeProvider { now(): number; }`

*   **Task 2.2: Implement `SystemTimeProvider`**
    *   **Action:** In `src/utils/time.ts`, create the production implementation.
    *   **Content:** `export class SystemTimeProvider implements TimeProvider { now() { return Date.now(); } }`

*   **Task 2.3: Create `ManualTimeProvider` for Tests**
    *   **Action:** Create a new file `tests/mocks/time.ts`.
    *   **Content:** Implement the `ManualTimeProvider` class with `now()`, `advance(milliseconds: number)`, and `setTime(timestamp: number)` methods.

*   **Task 2.4: Add Unit Tests for `ManualTimeProvider`**
    *   **Action:** Create `tests/mocks/time.test.ts` to verify that `advance` and `setTime` work correctly.

---

## Phase 3: Enhance `CircuitBreaker` and Refactor Tests

**Goal:** Align the `CircuitBreaker` with its advanced specification and make its tests instantaneous and reliable.

*   **Task 3.1: Implement `RollingWindow` Data Structure**
    *   **Action:** Create `src/resilience/rollingWindow.ts` using the Circular Buffer pattern from the research. This class will manage a fixed number of "buckets" over a time window, with each bucket holding counts for success and failure.
    *   **Testing:** Create `tests/resilience/rollingWindow.test.ts` and add comprehensive tests for adding values, window rolling, and calculating totals.

*   **Task 3.2: Refactor `CircuitBreaker`**
    *   **Action:** Modify `src/resilience/circuitBreaker.ts`.
        1.  **Inject `TimeProvider`:** Update the constructor to accept an optional `TimeProvider`, defaulting to `new SystemTimeProvider()`.
        2.  **Replace Logic:** Remove the simple failure counter. Instantiate and use the `RollingWindow` to track call outcomes.
        3.  **Update State Machine:** The decision to trip the circuit (`CLOSED` -> `OPEN`) must now be based on data from the `RollingWindow` (i.e., when `totalRequests > volumeThreshold` and `failureRate > errorThresholdPercentage`).

*   **Task 3.3: Refactor `circuitBreaker.test.ts`**
    *   **Action:** Overhaul the entire test file.
        1.  **Inject Mock:** In every test, instantiate and inject the `ManualTimeProvider`.
        2.  **Eliminate `setTimeout`:** Replace all `await new Promise(...)` calls with `timeProvider.advance(...)`.
        3.  **Remove State Manipulation:** Delete any tests that use `(circuitBreaker as any).state = ...`. Test state changes only via the public API.

*   **Task 3.4: Add New `CircuitBreaker` Tests**
    *   **Action:** In `circuitBreaker.test.ts`, add the following new test suites:
        1.  A test to confirm that a failure in the `HALF_OPEN` state immediately transitions the circuit back to `OPEN`.
        2.  A test to confirm the circuit does *not* open if the number of requests is below `volumeThreshold`, even if the failure rate is 100%.
        3.  A test to confirm the circuit *does* open only when both `volumeThreshold` and `errorThresholdPercentage` are exceeded.

---

## Phase 4: Refactor Actor System for Complete Type Safety

**Goal:** Eradicate the `any` type from the actor messaging system, enforcing compile-time correctness for all actor interactions.

*   **Task 4.1: Define Core Actor Types**
    *   **Action:** Create a new file `src/core/actorTypes.ts`.
    *   **Content:** Define the core generic interfaces as researched: `ActorMessage`, `Actor<TState, TMessage>`, and `ActorRef<TMessage>`.

*   **Task 4.2: Refactor `Actor` and `ActorSystem`**
    *   **Action:** In `src/core/actorSystem.ts`:
        1.  Make the `Actor` base class generic: `export abstract class Actor<TState, TMessage extends ActorMessage>`.
        2.  The `receive` method signature will become `abstract receive(message: TMessage): void;`.
        3.  The `ActorSystem.createActor` method will now return a strongly-typed `ActorRef<TMessage>`.
        4.  The `ActorSystem.dispatch` method will remain internally untyped for the central lookup, but it will be protected by the typed `ActorRef`.

*   **Task 4.3: Update Example Neurons**
    *   **Action:** Refactor `src/neurons/pingNeuron.ts` and `pongNeuron.ts`.
    *   **Details:** Define specific message types (e.g., `PingMessage`, `PongMessage`) and update the `PingNeuron` and `PongNeuron` classes to extend the new generic `Actor` class with their specific state and message types.

*   **Task 4.4: Update Actor System Tests**
    *   **Action:** In `tests/core/actorSystem.test.ts`, refactor all tests to use the new `ActorRef` and its typed `dispatch` method.
    *   **Action:** Create a new file `tests/core/actorSystem.types.test.ts`. In this file, add commented-out code demonstrating that dispatching a message of the wrong type to an `ActorRef` causes a `tsc` compilation error. This file serves as a static assertion of type safety.

---

## Phase 5: Final Validation and Documentation

**Goal:** Ensure all changes are cleanly integrated and reflected in the project's documentation.

*   **Task 5.1: Full Test Suite Execution**
    *   **Action:** Run `npm test` and ensure 100% of tests pass.

*   **Task 5.2: Documentation Overhaul**
    *   **Action:** Update all JSDoc comments in the refactored files (`actorSystem.ts`, `circuitBreaker.ts`, etc.) to reflect the new APIs and behaviors.
    *   **Action:** Update the `README.md` with new, type-safe examples for creating and interacting with actors.
    *   **Action:** Update `IMPLEMENTATION_SPEC.md` and `ARCHITECTURE_DIAGRAM.md` to accurately describe the new `CircuitBreaker` logic and the type-safe actor model.
