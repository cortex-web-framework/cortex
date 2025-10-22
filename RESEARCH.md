# Research: Cortex Framework - Consolidated Task Plan

## 1. Executive Summary

This document consolidates all identified tasks from the project's markdown files, prioritizing them into a granular, actionable plan. The Cortex Framework is a well-planned, zero-dependency actor framework for TypeScript, with significant research and planning already completed. The remaining work focuses on completing core features, ensuring stability through comprehensive testing, mitigating risks, and documenting the framework.

## 2. Consolidated Task Plan

The tasks are organized into phases, ordered by priority and dependencies.

### Phase 1: Testing Infrastructure Migration (High Priority)

**Goal:** Migrate the testing framework from `ts-node/esm` to a compile-first approach to eliminate experimental warnings and improve performance.

*   **Task 1.1: Create `tsconfig.test.json`**
    *   **Details:** Create a new `tsconfig.test.json` file that extends the base `tsconfig.json`, configures it to include all `*.ts` files in `src` and `tests`, outputs compiled JavaScript to `dist-tests`, and enables `sourceMap`.
    *   **Estimated Time:** 10 minutes
*   **Task 1.2: Update `package.json` Test Scripts**
    *   **Details:** Modify `package.json` to include `test:compile`, `test:run`, `test:watch` scripts, and update the main `test` script to use the compile-first approach.
    *   **Estimated Time:** 10 minutes
*   **Task 1.3: Validate New Test Setup**
    *   **Details:** Run `npm test` to verify all 262 tests execute, 251 pass, 11 fail (baseline), and no "ExperimentalWarning" messages are present.
    *   **Estimated Time:** 15 minutes
*   **Task 1.4: Update `.gitignore`**
    *   **Details:** Add `dist-tests/` and `*.tsbuildinfo` to the `.gitignore` file.
    *   **Estimated Time:** 5 minutes

### Phase 2: Zero-Dependency Compliance (High Priority)

**Goal:** Remove all Express type dependencies from core modules to maintain zero-dependency compliance.

*   **Task 2.1: Identify Express Import Locations**
    *   **Details:** Locate all files importing from 'express' in the `src/` directory.
    *   **Estimated Time:** 5 minutes
*   **Task 2.2: Refactor `rateLimiter.ts`**
    *   **Details:** Analyze Express usage in `src/security/rateLimiter.ts`, replace Express types with `node:http` equivalents, and update corresponding tests.
    *   **Estimated Time:** 45 minutes
*   **Task 2.3: Refactor `httpCache.ts`**
    *   **Details:** Analyze Express usage in `src/performance/httpCache.ts`, replace Express types with `node:http` equivalents, and update corresponding tests.
    *   **Estimated Time:** 45 minutes
*   **Task 2.4: Refactor `csp.ts`**
    *   **Details:** Analyze Express usage in `src/security/csp.ts`, replace Express types with `node:http` equivalents, and update corresponding tests.
    *   **Estimated Time:** 30 minutes
*   **Task 2.5: Refactor `project.ts` (CLI Generator)**
    *   **Details:** Analyze Express usage in `src/cli/generators/project.ts`. Determine if Express is truly needed or if it can be removed/replaced, or documented as an exception.
    *   **Estimated Time:** 40 minutes
*   **Task 2.6: Verify Zero-Dependency & Circular Dependencies**
    *   **Details:** Run `grep -r "from 'express'" src/` to ensure no Express imports remain. Check for circular dependencies using `npx madge --circular --extensions ts src/` and fix any found. Verify all tests still pass.
    *   **Estimated Time:** 45 minutes

### Phase 3: Fix Existing Failing Tests (High Priority)

**Goal:** Resolve all 11 baseline test failures to achieve a fully passing test suite.

*   **Task 3.1: Fix `grpc.test.ts`**
    *   **Details:** Analyze and fix the failure in `tests/api/grpc.test.ts` (gRPC import issues).
    *   **Estimated Time:** 75 minutes
*   **Task 3.2: Fix `fullSystem.test.ts`**
    *   **Details:** Analyze and fix the failure in `tests/integration/fullSystem.test.ts` (uncaught exception).
    *   **Estimated Time:** 110 minutes
*   **Task 3.3: Fix `tracer.test.ts`**
    *   **Details:** Analyze and fix the failure in `tests/observability/tracing/tracer.test.ts` (uncaught exception).
    *   **Estimated Time:** 45 minutes
*   **Task 3.4: Fix `compression.test.ts`**
    *   **Details:** Analyze and fix the failure in `tests/performance/compression.test.ts` (uncaught exception, likely related to streaming).
    *   **Estimated Time:** 60 minutes
*   **Task 3.5: Fix `httpCache.test.ts`**
    *   **Details:** Analyze and fix the failure in `tests/performance/httpCache.test.ts` (post-refactor issues from Phase 2).
    *   **Estimated Time:** 40 minutes
*   **Task 3.6: Fix `retryExecutor.test.ts`**
    *   **Details:** Analyze and fix the failure in `tests/resilience/retryExecutor.test.ts` (uncaught exception).
    *   **Estimated Time:** 45 minutes
*   **Task 3.7: Fix `rateLimiter.test.ts`**
    *   **Details:** Analyze and fix the failure in `tests/security/rateLimiter.test.ts` (post-refactor issues from Phase 2).
    *   **Estimated Time:** 40 minutes
*   **Task 3.8: Fix `memoryManager.test.ts`**
    *   **Details:** Analyze and fix the failure in `tests/wasm/memoryManager.test.ts` (WASM memory issues).
    *   **Estimated Time:** 65 minutes
*   **Task 3.9: Fix `utils.test.ts` (WASM)**
    *   **Details:** Analyze and fix the failure in `tests/wasm/utils.test.ts` (WASM loading issues).
    *   **Estimated Time:** 45 minutes
*   **Task 3.10: Fix `smartContracts.ethers.test.ts`**
    *   **Details:** Analyze and fix the failure in `tests/web3/smartContracts.ethers.test.ts` (mock issues).
    *   **Estimated Time:** 60 minutes
*   **Task 3.11: Fix `workerPool.test.ts`**
    *   **Details:** Analyze and fix the failure in `tests/workers/workerPool.test.ts` (worker pool issues).
    *   **Estimated Time:** 80 minutes
*   **Task 3.12: Verify Full Test Suite & Coverage**
    *   **Details:** Run `npm test` to ensure all 262 tests pass. Verify test coverage is >= 95%.
    *   **Estimated Time:** 15 minutes

### Phase 4: Risk Mitigation (High Priority)

**Goal:** Address critical security and stability risks identified in the architecture.

*   **Task 4.1: Document Worker Serialization Issue**
    *   **Details:** Add TODO comments in `src/workers/workerActor.ts` regarding serialization.
    *   **Estimated Time:** 10 minutes
*   **Task 4.2: Design Worker Message Protocol**
    *   **Details:** Create a protocol specification for worker messages (design doc or code comments).
    *   **Estimated Time:** 30 minutes
*   **Task 4.3: Implement Structured Cloning for Workers**
    *   **Details:** Refactor `src/workers/workerActor.ts` to use structured cloning for message passing.
    *   **Estimated Time:** 60 minutes
*   **Task 4.4: Add Worker Serialization Tests**
    *   **Details:** Add tests in `tests/workers/workerActor.test.ts` to verify complex data types work.
    *   **Estimated Time:** 30 minutes
*   **Task 4.5: Create WASM Memory Alignment Tests**
    *   **Details:** Add tests in `tests/wasm/memoryManager.test.ts` covering various byte alignments.
    *   **Estimated Time:** 45 minutes
*   **Task 4.6: Add WASM Memory Overflow Detection**
    *   **Details:** Implement overflow checks in `src/wasm/memoryManager.ts`.
    *   **Estimated Time:** 45 minutes
*   **Task 4.7: Verify No `eval: true` in Codebase**
    *   **Details:** Run `grep -r "eval:" . --include="*.ts"` to ensure no `eval: true` is used in production code.
    *   **Estimated Time:** 5 minutes
*   **Task 4.8: Run Security Audit & Document Exceptions**
    *   **Details:** Run `npm audit` and fix any vulnerabilities. Create/update `SECURITY.md` to document known security exceptions.
    *   **Estimated Time:** 25 minutes

### Phase 5: New Feature Implementation - Observability (Medium Priority)

**Goal:** Implement a production-grade observability stack including metrics, tracing, and health checks.

*   **Task 5.1: Create Observability Type Definitions**
    *   **Details:** Create `src/observability/types.ts` with metric, trace, and health check interfaces and enums.
    *   **Estimated Time:** 15 minutes
*   **Task 5.2: Implement Counter Metric**
    *   **Details:** Implement `Counter` class in `src/observability/metrics/counter.ts` and write corresponding tests.
    *   **Estimated Time:** 30 minutes
*   **Task 5.3: Implement Gauge Metric**
    *   **Details:** Implement `Gauge` class in `src/observability/metrics/gauge.ts` and write corresponding tests.
    *   **Estimated Time:** 20 minutes
*   **Task 5.4: Implement Histogram Metric**
    *   **Details:** Implement `Histogram` class in `src/observability/metrics/histogram.ts` and write corresponding tests.
    *   **Estimated Time:** 45 minutes
*   **Task 5.5: Create MetricsCollector**
    *   **Details:** Implement `MetricsCollector` in `src/observability/metrics/collector.ts` (registry pattern, Prometheus export) and write corresponding tests.
    *   **Estimated Time:** 30 minutes
*   **Task 5.6: Create Metrics Module Exports**
    *   **Details:** Create `src/observability/metrics/index.ts` to export metrics components.
    *   **Estimated Time:** 5 minutes
*   **Task 5.7: Implement Span Class**
    *   **Details:** Implement `SpanImpl` class in `src/observability/tracing/span.ts` (attributes, events, status, end) and write corresponding tests.
    *   **Estimated Time:** 60 minutes
*   **Task 5.8: Implement Tracer Class**
    *   **Details:** Implement `Tracer` class in `src/observability/tracing/tracer.ts` (start/end spans, context propagation) and write corresponding tests.
    *   **Estimated Time:** 45 minutes
*   **Task 5.9: Implement Sampling Strategies**
    *   **Details:** Implement `Sampler` interface and `ProbabilitySampler`/`AdaptiveSampler` in `src/observability/tracing/sampler.ts` and write corresponding tests.
    *   **Estimated Time:** 30 minutes
*   **Task 5.10: Implement HealthCheckRegistry**
    *   **Details:** Implement `HealthCheckRegistry` in `src/observability/health/healthRegistry.ts` (register, checkAll, getOverallStatus) and write corresponding tests.
    *   **Estimated Time:** 30 minutes
*   **Task 5.11: Create Default Health Checks**
    *   **Details:** Create `src/observability/health/defaultChecks.ts` (MemoryHealthCheck, UptimeHealthCheck).
    *   **Estimated Time:** 20 minutes
*   **Task 5.12: Create Observability Module Exports**
    *   **Details:** Create `src/observability/index.ts` to export all observability components.
    *   **Estimated Time:** 5 minutes
*   **Task 5.13: Add Metrics Endpoint to HttpServer**
    *   **Details:** Modify `src/core/httpServer.ts` to expose a `/metrics` endpoint using `MetricsCollector`.
    *   **Estimated Time:** 30 minutes
*   **Task 5.14: Add Health Endpoint to HttpServer**
    *   **Details:** Modify `src/core/httpServer.ts` to expose a `/health` endpoint using `HealthCheckRegistry`.
    *   **Estimated Time:** 30 minutes
*   **Task 5.15: Integrate Metrics with ActorSystem**
    *   **Details:** Modify `src/core/actorSystem.ts` to track actor messages, errors, and restarts using `MetricsCollector`.
    *   **Estimated Time:** 60 minutes

### Phase 6: New Feature Implementation - Resilience (Medium Priority)

**Goal:** Implement production-grade resilience patterns to prevent cascading failures.

*   **Task 6.1: Create Resilience Types & Errors**
    *   **Details:** Create `src/resilience/types.ts` (CircuitState, configs) and `src/resilience/errors.ts` (custom errors).
    *   **Estimated Time:** 30 minutes
*   **Task 6.2: Implement Circuit Breaker**
    *   **Details:** Implement `CircuitBreaker` in `src/resilience/circuitBreaker.ts` (state machine, rolling window) and write corresponding tests.
    *   **Estimated Time:** 60 minutes
*   **Task 6.3: Implement Retry Executor**
    *   **Details:** Implement `RetryExecutor` in `src/resilience/retryExecutor.ts` (exponential backoff, jitter, error matchers) and write corresponding tests.
    *   **Estimated Time:** 45 minutes
*   **Task 6.4: Implement Bulkhead**
    *   **Details:** Implement `Bulkhead` in `src/resilience/bulkhead.ts` (semaphore, queue management) and write corresponding tests.
    *   **Estimated Time:** 45 minutes
*   **Task 6.5: Implement Timeout Executor**
    *   **Details:** Implement `TimeoutExecutor` in `src/resilience/timeout.ts` (Promise.race, fallback) and write corresponding tests.
    *   **Estimated Time:** 20 minutes
*   **Task 6.6: Implement Policy Composition**
    *   **Details:** Implement `CompositePolicy` in `src/resilience/policies/compositePolicy.ts` (combining policies) and write corresponding tests.
    *   **Estimated Time:** 30 minutes
*   **Task 6.7: Create Resilience Module Exports**
    *   **Details:** Create `src/resilience/index.ts` to export all resilience components.
    *   **Estimated Time:** 5 minutes
*   **Task 6.8: Write Comprehensive Resilience Tests**
    *   **Details:** Write remaining tests for `circuitBreaker.test.ts`, `retryExecutor.test.ts`, `bulkhead.test.ts`, and `compositePolicy.test.ts`.
    *   **Estimated Time:** 3 hours

### Phase 7: New Feature Implementation - Performance & Security Enhancements (Medium Priority)

**Goal:** Enhance framework performance and security with robust middleware.

*   **Task 7.1: Implement Streaming Compression Middleware**
    *   **Details:** Replace placeholder in `src/performance/compression.ts` with a real streaming Brotli/Gzip implementation using `node:zlib`. Write comprehensive tests.
    *   **Estimated Time:** 60 minutes
*   **Task 7.2: Implement HTTP Caching Utilities**
    *   **Details:** Implement HTTP caching utilities in `src/performance/httpCache.ts` (ETags, Cache-Control headers) and write corresponding tests.
    *   **Estimated Time:** 60 minutes
*   **Task 7.3: Implement CSPBuilder**
    *   **Details:** Implement `CSPBuilder` in `src/security/csp.ts` (builder pattern for CSP headers) and write corresponding tests.
    *   **Estimated Time:** 60 minutes
*   **Task 7.4: Implement Rate Limiting Middleware**
    *   **Details:** Implement rate-limiting middleware in `src/security/rateLimiter.ts` (sliding window algorithm) and write corresponding tests.
    *   **Estimated Time:** 60 minutes

### Phase 8: New Feature Implementation - Web3, WASM, Workers, API (Medium Priority)

**Goal:** Integrate advanced technologies and API capabilities.

*   **Task 8.1: Implement `SmartContractClient`**
    *   **Details:** Implement `SmartContractClient` class in `src/web3/smartContracts.ts` for EVM-compatible chain interaction and write corresponding tests.
    *   **Estimated Time:** 60 minutes
*   **Task 8.2: Implement `IPFSClient`**
    *   **Details:** Implement `IPFSClient` class in `src/web3/ipfs.ts` for content addressing and retrieval and write corresponding tests.
    *   **Estimated Time:** 60 minutes
*   **Task 8.3: Implement Wasm Loading Utilities**
    *   **Details:** Implement Wasm loading and instantiation utilities in `src/wasm/utils.ts` and write corresponding tests.
    *   **Estimated Time:** 60 minutes
*   **Task 8.4: Integrate Wasm with `WorkerActor`**
    *   **Details:** Modify `WorkerActor` to offload computations to Wasm modules and write corresponding tests.
    *   **Estimated Time:** 60 minutes
*   **Task 8.5: Implement `WorkerActor` Base Class**
    *   **Details:** Implement the `WorkerActor` base class in `src/workers/workerActor.ts` and write corresponding tests.
    *   **Estimated Time:** 60 minutes
*   **Task 8.6: Implement `WorkerPool`**
    *   **Details:** Implement the `WorkerPool` class in `src/workers/workerPool.ts` (using `node:worker_threads`) and write corresponding tests.
    *   **Estimated Time:** 90 minutes
*   **Task 8.7: Implement Basic GraphQL Server**
    *   **Details:** Implement a basic GraphQL server in `src/api/graphql.ts` and write corresponding tests.
    *   **Estimated Time:** 60 minutes
*   **Task 8.8: Implement Basic gRPC Server and Client**
    *   **Details:** Implement a basic gRPC server and client in `src/api/grpc.ts` and write corresponding tests.
    *   **Estimated Time:** 60 minutes

### Phase 9: Documentation & Examples (Medium Priority)

**Goal:** Provide clear, comprehensive, and user-friendly documentation and examples.

*   **Task 9.1: Update Main `src/index.ts` Exports**
    *   **Details:** Add exports for all new modules (observability, resilience, etc.) in `src/index.ts`.
    *   **Estimated Time:** 10 minutes
*   **Task 9.2: Update `package.json` (if needed)**
    *   **Details:** Add any new scripts or verify dependencies.
    *   **Estimated Time:** 5 minutes
*   **Task 9.3: Create Example Files**
    *   **Details:** Create `examples/observability-example.ts`, `examples/resilience-example.ts`, and `examples/compression-example.ts` demonstrating usage.
    *   **Estimated Time:** 60 minutes
*   **Task 9.4: Update `README.md`**
    *   **Details:** Update `README.md` to reflect all new features, architecture, and getting started guide.
    *   **Estimated Time:** 30 minutes
*   **Task 9.5: Create Module-Specific Documentation**
    *   **Details:** Create detailed markdown files for each major feature area (Web3, Wasm, Workers, Security, Performance, API).
    *   **Estimated Time:** 4 hours
*   **Task 9.6: Create Tutorials and Usage Examples**
    *   **Details:** Create additional example projects or code snippets demonstrating how to use various features.
    *   **Estimated Time:** 2 hours

### Phase 10: Showcase Application (Lower Priority)

**Goal:** Build "Cortex Hub" - a comprehensive demo application showcasing all Cortex features.

*   **Task 10.1: API Gateway Service Implementation**
    *   **Details:** Create project structure, implement HTTP/REST, GraphQL, gRPC, add rate limiting, CSP, compression, and write integration tests.
    *   **Estimated Time:** 2-3 weeks
*   **Task 10.2: Order Service (Actor-Based) Implementation**
    *   **Details:** Implement OrderActor state machine, event sourcing, integrate circuit breaker & retry, add distributed tracing, and write actor tests.
    *   **Estimated Time:** 2-3 weeks
*   **Task 10.3: Notification Service (WebSocket) Implementation**
    *   **Details:** Implement WebSocket server, add EventBus subscriptions, broadcast logic, connection rate limiting, and write WebSocket tests.
    *   **Estimated Time:** 1-2 weeks
*   **Task 10.4: Analytics Service Implementation**
    *   **Details:** Implement metrics aggregation, Prometheus exporter, Grafana dashboard JSON, write metrics tests, and document schema.
    *   **Estimated Time:** 1-2 weeks
*   **Task 10.5: Storage Service (Web3/IPFS) Implementation**
    *   **Details:** Implement IPFS upload/download, smart contract integration, wallet connection UI, write Web3 integration tests, and add error handling.
    *   **Estimated Time:** 2-3 weeks
*   **Task 10.6: Compute Service (WASM) Implementation**
    *   **Details:** Create WASM image processing module, TypeScript wrapper, worker pool integration, benchmarking suite, and write performance tests.
    *   **Estimated Time:** 2-3 weeks
*   **Task 10.7: Infrastructure & Deployment (Docker/Kubernetes)**
    *   **Details:** Create Dockerfiles, docker-compose.yml, Kubernetes manifests, service definitions, ingress, ConfigMaps, Secrets, and autoscaling.
    *   **Estimated Time:** 3-4 weeks
*   **Task 10.8: Monitoring & Observability Setup**
    *   **Details:** Set up Prometheus, Grafana dashboards, Jaeger, and log aggregation.
    *   **Estimated Time:** 1-2 weeks
*   **Task 10.9: Showcase Documentation**
    *   **Details:** Write showcase README, architecture diagrams, API documentation, deployment guide, video walkthrough, and troubleshooting guide.
    *   **Estimated Time:** 1-2 weeks

### Phase 11: Advanced & Enterprise Features (Lower Priority)

**Goal:** Enhance framework with enterprise-grade features for large-scale deployments.

*   **Task 11.1: WebSocket Support (Built-in)**
    *   **Details:** Implement WebSocket server class, room-based messaging, authentication middleware, and write comprehensive tests.
    *   **Estimated Time:** 2-3 weeks
*   **Task 11.2: Distributed Actor System (Clustering)**
    *   **Details:** Design cluster protocol, implement node discovery, actor routing, health checks, fault recovery, and write cluster tests.
    *   **Estimated Time:** 3-4 weeks
*   **Task 11.3: Advanced Rate Limiting (Distributed)**
    *   **Details:** Implement Redis-backed distributed rate limiting, token bucket algorithm, rate limit headers, multi-key tracking, and write performance tests.
    *   **Estimated Time:** 2-3 weeks
*   **Task 11.4: Enhanced WASM Integration**
    *   **Details:** Add streaming compilation, hot-reloading, debugging utilities, memory profiler, and write WASM benchmarks.
    *   **Estimated Time:** 2-3 weeks
*   **Task 11.5: GraphQL Enhancements**
    *   **Details:** Implement full GraphQL server with schema stitching, subscriptions, DataLoader integration, GraphQL playground, and write GraphQL tests.
    *   **Estimated Time:** 2-3 weeks
*   **Task 11.6: Service Mesh Integration**
    *   **Details:** Add Istio/Linkerd compatibility, service discovery, mTLS, traffic management, and write service mesh tests.
    *   **Estimated Time:** 3-4 weeks
*   **Task 11.7: Advanced Observability (Exporters)**
    *   **Details:** Implement Jaeger/Zipkin exporters, custom span processors, log correlation, and write observability tests.
    *   **Estimated Time:** 2-3 weeks
*   **Task 11.8: Multi-Tenancy Support**
    *   **Details:** Design tenant isolation model, implement tenant manager, resource quotas, tenant-aware metrics, and write multi-tenancy tests.
    *   **Estimated Time:** 3-4 weeks
*   **Task 11.9: Advanced Security (OAuth2/JWT/API Keys)**
    *   **Details:** Implement OAuth2 provider, JWT authentication middleware, API key management, mTLS support, and write security tests.
    *   **Estimated Time:** 3-4 weeks
*   **Task 11.10: Kubernetes Operators**
    *   **Details:** Define CRDs, implement operator logic, automated scaling, self-healing, and write operator tests.
    *   **Estimated Time:** 3-4 weeks
*   **Task 11.11: Helm Charts**
    *   **Details:** Create Helm chart structure, add values.yaml, implement chart dependencies, migration hooks, and test chart installation.
    *   **Estimated Time:** 2-3 weeks
*   **Task 11.12: Production Guides**
    *   **Details:** Write deployment guide (AWS/GCP/Azure), security checklist, scaling guide, monitoring setup, and troubleshooting runbook.
    *   **Estimated Time:** 2-3 weeks
*   **Task 11.13: Load Testing Framework**
    *   **Details:** Set up k6/Artillery, create load test scenarios, define performance baselines, add CI/CD integration, and write performance reports.
    *   **Estimated Time:** 2-3 weeks
*   **Task 11.14: Chaos Engineering**
    *   **Details:** Integrate Chaos Mesh/Litmus, create chaos experiments, implement automated recovery tests, document scenarios, and add chaos dashboard.
    *   **Estimated Time:** 2-3 weeks

## 3. Completion Criteria

When you believe your research is sufficiently complete, inform the user of such and ask for their explicit confirmation before considering this task complete. If the user indicates it is not, or asks for more work, continue following the Research Rules outlined and return to this completion criteria each time you believe the task to be complete.

Upon receiving confirmation of completion from the user, recommend that they begin the planning phase by using the command `/blueprint:plan`
