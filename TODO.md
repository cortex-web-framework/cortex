# TODO: Full System Stabilization and Refactoring

This task list breaks down the work from `PLAN.md` into actionable, granular steps.

---

## Phase 1: Codebase Stabilization (Fix All Failing Tests)

**Goal:** Achieve a 100% passing test suite.
**Note:** The following 11 high-level tasks can be worked on in **parallel**.

*   **1. Fix `tests/api/grpc.test.ts`** `[test] [api]`
    *   [ ] **1.1.** Isolate the test by modifying the `test:run` script or using `node --test dist-tests/tests/api/grpc.test.js`.
    *   [ ] **1.2.** Execute the isolated test and capture the exact error message and stack trace.
    *   [ ] **1.3.** Analyze `tests/api/grpc.test.ts` and `src/api/grpc.ts` to understand the test's dependency on the gRPC library mock.
    *   [ ] **1.4.** Hypothesize root cause (e.g., "The mock for the `@grpc/grpc-js` library is incomplete").
    *   [ ] **1.5.** Implement the fix by updating the mock to include any missing functions or properties.
    *   [ ] **1.6.** Re-run the isolated test to confirm it passes.
    *   [ ] **1.7.** Run all API tests (`node --test dist-tests/tests/api/`) to check for regressions.

*   **2. Fix `tests/integration/fullSystem.test.ts`** `[test] [integration]`
    *   [ ] **2.1.** Isolate and run the test, capturing the uncaught exception details.
    *   [ ] **2.2.** Analyze the test flow, focusing on asynchronous operations within `CortexHttpServer`, `ActorSystem`, and `EventBus`.
    *   [ ] **2.3.** Hypothesize root cause (e.g., "An event handler is throwing an error without a `try/catch` block").
    *   [ ] **2.4.** Add `try/catch` blocks to asynchronous event handlers or ensure all promises in the chain are handled with `.catch()`.
    *   [ ] **2.5.** Re-run the isolated test to confirm it passes.

*   **3. Fix `tests/observability/tracing/tracer.test.ts`** `[test] [observability]`
    *   [ ] **3.1.** Isolate and run the test, capturing the uncaught exception details.
    *   [ ] **3.2.** Analyze the `Tracer` and `Span` implementation, looking for unhandled promise rejections.
    *   [ ] **3.3.** Implement the fix, likely by adding `.catch()` to a promise chain.
    *   [ ] **3.4.** Re-run the isolated test to confirm it passes.

*   **4. Fix `tests/performance/compression.test.ts`** `[test] [performance]`
    *   [ ] **4.1.** Isolate and run the test to confirm failure.
    *   [ ] **4.2.** Refactor `src/performance/compression.ts` to use `zlib.createGzip()` or `zlib.createBrotliCompress()` as a `Transform` stream.
    *   [ ] **4.3.** The middleware should pipe the response through the compression stream instead of buffering it in an array.
    *   [ ] **4.4.** Re-run the isolated test to confirm it passes.

*   **5. Fix `tests/performance/httpCache.test.ts`** `[test] [performance]`
    *   [ ] **5.1.** Isolate and run the test.
    *   [ ] **5.2.** Analyze the test mocks and compare their behavior to the `node:http` `IncomingMessage` and `ServerResponse` objects.
    *   [ ] **5.3.** Update the mocks to accurately simulate header methods (`getHeader`, `setHeader`, `removeHeader`).
    *   [ ] **5.4.** Re-run the isolated test to confirm it passes.

*   **6. Fix `tests/resilience/retryExecutor.test.ts`** `[test] [resilience]`
    *   [ ] **6.1.** Isolate and run the test, capturing the uncaught exception.
    *   [ ] **6.2.** Analyze the `for` loop and error propagation logic in `RetryExecutor`.
    *   [ ] **6.3.** Ensure the final error is thrown correctly after all retries are exhausted.
    *   [ ] **6.4.** Re-run the isolated test to confirm it passes.

*   **7. Fix `tests/security/rateLimiter.test.ts`** `[test] [security]`
    *   [ ] **7.1.** Isolate and run the test.
    *   [ ] **7.2.** Analyze how the middleware accesses request properties (like IP address) and update the test mocks to provide this information correctly according to the `node:http` API.
    *   [ ] **7.3.** Re-run the isolated test to confirm it passes.

*   **8. Fix `tests/wasm/memoryManager.test.ts`** `[test] [wasm]`
    *   [ ] **8.1.** Isolate and run the test.
    *   [ ] **8.2.** Add detailed logging to the `allocate`, `deallocate`, `readBuffer`, and `writeBuffer` methods in `src/wasm/memoryManager.ts`.
    *   [ ] **8.3.** Use the logs to identify the exact point of memory corruption or overflow.
    *   [ ] **8.4.** Implement stricter boundary checks in the memory manager methods.
    *   [ ] **8.5.** Re-run the isolated test to confirm it passes.

*   **9. Fix `tests/wasm/utils.test.ts`** `[test] [wasm]`
    *   [ ] **9.1.** Isolate and run the test.
    *   [ ] **9.2.** Modify the test to use `path.resolve` and `fs.readFileSync` to load the `.wasm` file, ensuring the path is correct relative to the `dist-tests/` output directory.
    *   [ ] **9.3.** Re-run the isolated test to confirm it passes.

*   **10. Fix `tests/web3/smartContracts.ethers.test.ts`** `[test] [web3]`
    *   [ ] **10.1.** Isolate and run the test.
    *   [ ] **10.2.** Analyze `src/web3/smartContracts.ts` to see exactly which `ethers` functions and properties are accessed.
    *   [ ] **10.3.** Update the mock in `tests/mocks/ethers.ts` to fully implement the required functionality.
    *   [ ] **10.4.** Re-run the isolated test to confirm it passes.

*   **11. Fix `tests/workers/workerPool.test.ts`** `[test] [workers]`
    *   [ ] **11.1.** Isolate and run the test.
    *   [ ] **11.2.** Add comprehensive event listeners (`online`, `message`, `error`, `exit`) to the worker threads within the test to get diagnostic information.
    *   [ ] **11.3.** Use the diagnostics to fix issues related to worker lifecycle or message passing.
    *   [ ] **11.4.** Re-run the isolated test to confirm it passes.

---

## Phase 2: Implement Core Testing Infrastructure (`TimeProvider`)

**Goal:** Decouple from `Date.now()` for deterministic time-based testing.

*   [ ] **12. `[infra] [test]`** Create the file `src/utils/time.ts`.
*   [ ] **13. `[infra] [test]`** In `time.ts`, define and export the `TimeProvider` interface: `export interface TimeProvider { now(): number; }`.
*   [ ] **14. `[infra] [test]`** In `time.ts`, implement and export the `SystemTimeProvider` class that uses `Date.now()`.
*   [ ] **15. `[infra] [test]`** Create the file `tests/mocks/time.ts`.
*   [ ] **16. `[infra] [test]`** In `tests/mocks/time.ts`, implement and export the `ManualTimeProvider` class with `now()`, `advance(ms)`, and `setTime(timestamp)` methods.
*   [ ] **17. `[test]`** Create the file `tests/mocks/time.test.ts`.
*   [ ] **18. `[test]`** In `time.test.ts`, write tests to verify the functionality of `ManualTimeProvider`.

---

## Phase 3: Enhance `CircuitBreaker` and Refactor Tests

**Goal:** Align `CircuitBreaker` with its advanced specification.

*   [ ] **19. `[feature] [resilience]`** Create the file `src/resilience/rollingWindow.ts`.
*   [ ] **20. `[feature] [resilience]`** Implement the `RollingWindow` class logic based on the Circular Buffer pattern from research.
*   [ ] **21. `[test] [resilience]`** Create the file `tests/resilience/rollingWindow.test.ts` and add comprehensive unit tests.
*   [ ] **22. `[refactor] [resilience]`** Modify the `CircuitBreaker` constructor in `src/resilience/circuitBreaker.ts` to accept an optional `TimeProvider` dependency.
*   [ ] **23. `[refactor] [resilience]`** In `CircuitBreaker`, replace the simple failure counter with an instance of `RollingWindow`.
*   [ ] **24. `[refactor] [resilience]`** Rewrite the circuit-tripping logic to use `volumeThreshold` and `errorThresholdPercentage` based on data from the `RollingWindow`.
*   [ ] **25. `[refactor] [test]`** In `tests/resilience/circuitBreaker.test.ts`, import `ManualTimeProvider` and inject it into the `CircuitBreaker` in all tests.
*   [ ] **26. `[refactor] [test]`** Replace all `setTimeout` calls in `circuitBreaker.test.ts` with `timeProvider.advance()`.
*   [ ] **27. `[refactor] [test]`** Remove any tests that directly manipulate the internal state of the `CircuitBreaker` (e.g., `(cb as any).state = ...`).
*   [ ] **28. `[test] [resilience]`** Add a new test to `circuitBreaker.test.ts` for the `HALF_OPEN` -> `OPEN` transition upon failure.
*   [ ] **29. `[test] [resilience]`** Add a new test to `circuitBreaker.test.ts` to verify the `volumeThreshold` logic.
*   [ ] **30. `[test] [resilience]`** Add a new test to `circuitBreaker.test.ts` to verify the `errorThresholdPercentage` logic.

---

## Phase 4: Refactor Actor System for Complete Type Safety

**Goal:** Eradicate `any` from the actor messaging system.

*   [ ] **31. `[refactor] [core]`** Create the file `src/core/actorTypes.ts`.
*   [ ] **32. `[refactor] [core]`** In `actorTypes.ts`, define and export the generic interfaces: `ActorMessage`, `Actor<TState, TMessage>`, and `ActorRef<TMessage>`.
*   [ ] **33. `[refactor] [core]`** In `src/core/actorSystem.ts`, update the `Actor` base class to be generic as `Actor<TState, TMessage>`.
*   [ ] **34. `[refactor] [core]`** In `src/core/actorSystem.ts`, update the `createActor` method to return a typed `ActorRef<TMessage>`.
*   [ ] **35. `[refactor] [neurons]`** In `src/neurons/`, define specific message types for `PingNeuron` and `PongNeuron`.
*   [ ] **36. `[refactor] [neurons]`** Update `PingNeuron` and `PongNeuron` to extend the new generic `Actor` class.
*   [ ] **37. `[refactor] [test]`** In `tests/core/actorSystem.test.ts`, refactor all tests to use the new typed `ActorRef` and its `dispatch` method.
*   [ ] **38. `[test] [core]`** Create the file `tests/core/actorSystem.types.test.ts`.
*   [ ] **39. `[test] [core]`** In `actorSystem.types.test.ts`, add commented-out code that would fail to compile if the type system is violated, serving as a static assertion of type safety.

---

## Phase 5: Final Validation and Documentation

**Goal:** Ensure all changes are integrated and documented.

*   [ ] **40. `[test]`** Execute `npm test` and confirm 100% of tests pass.
*   [ ] **41. `[docs]`** Update all JSDoc comments in `actorSystem.ts`, `circuitBreaker.ts`, and other refactored files.
*   [ ] **42. `[docs]`** Update the `README.md` with new, type-safe examples for the actor system.
*   [ ] **43. `[docs]`** Update `IMPLEMENTATION_SPEC.md` and `ARCHITECTURE_DIAGRAM.md` to reflect the new `CircuitBreaker` logic and type-safe actor model.
