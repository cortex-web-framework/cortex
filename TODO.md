# Cortex Framework - Detailed TODO List

This document outlines the detailed work breakdown for the Cortex Framework, derived from the Master Implementation Plan. Tasks are organized by phase, tagged for categorization, and indicate parallel execution where applicable.

## Phase 1: Testing Infrastructure Migration (High Priority)

*   **Task 1.1: Create `tsconfig.test.json`**
    *   [setup] [testing] Create a new `tsconfig.test.json` file that extends the base `tsconfig.json`, includes `src` and `tests` files, outputs to `dist-tests`, and enables `sourceMap`.
*   **Task 1.2: Update `package.json` Test Scripts**
    *   [setup] [testing] Modify `package.json` to include `test:compile`, `test:run`, `test:watch` scripts.
    *   [setup] [testing] Update the main `test` script to `npm run test:compile && npm run test:run`.
*   **Task 1.3: Validate New Test Setup**
    *   [testing] Run `npm test` to verify all 262 tests execute, 251 pass, 11 fail (baseline), and no "ExperimentalWarning" messages are present.
*   **Task 1.4: Update `.gitignore`**
    *   [setup] [git] Add `dist-tests/` and `*.tsbuildinfo` to the `.gitignore` file.

## Phase 2: Zero-Dependency Compliance (High Priority)

*   **Task 2.1: Identify Express Import Locations**
    *   [refactor] [security] Locate all files importing from 'express' in the `src/` directory.
*   **Task 2.2: Refactor `rateLimiter.ts`**
    *   [refactor] [security] Analyze Express usage in `src/security/rateLimiter.ts`.
    *   [refactor] [security] Replace Express types with `node:http` equivalents in `src/security/rateLimiter.ts`.
    *   [test] Update corresponding tests for `rateLimiter.ts`.
*   **Task 2.3: Refactor `httpCache.ts`**
    *   [refactor] [performance] Analyze Express usage in `src/performance/httpCache.ts`.
    *   [refactor] [performance] Replace Express types with `node:http` equivalents in `src/performance/httpCache.ts`.
    *   [test] Update corresponding tests for `httpCache.ts`.
*   **Task 2.4: Refactor `csp.ts`**
    *   [refactor] [security] Analyze Express usage in `src/security/csp.ts`.
    *   [refactor] [security] Replace Express types with `node:http` equivalents in `src/security/csp.ts`.
    *   [test] Update corresponding tests for `csp.ts`.
*   **Task 2.5: Refactor `project.ts` (CLI Generator)**
    *   [refactor] [cli] Analyze Express usage in `src/cli/generators/project.ts`.
    *   [refactor] [cli] Determine if Express is truly needed or if it can be removed/replaced, or documented as an exception.
*   **Task 2.6: Verify Zero-Dependency & Circular Dependencies**
    *   [test] [security] Run `grep -r "from 'express'" src/` to ensure no Express imports remain.
    *   [test] [architecture] Check for circular dependencies using `npx madge --circular --extensions ts src/`.
    *   [refactor] [architecture] Fix any circular dependencies found.
    *   [test] Verify all tests still pass after refactoring.

## Phase 3: Fix Existing Failing Tests (High Priority)

*   **Task 3.1: Fix `grpc.test.ts`**
    *   [bug-fix] [api] Analyze and fix the failure in `tests/api/grpc.test.ts` (gRPC import issues).
*   **Task 3.2: Fix `fullSystem.test.ts`**
    *   [bug-fix] [integration] Analyze and fix the failure in `tests/integration/fullSystem.test.ts` (uncaught exception).
*   **Task 3.3: Fix `tracer.test.ts`**
    *   [bug-fix] [observability] Analyze and fix the failure in `tests/observability/tracing/tracer.test.ts` (uncaught exception).
*   **Task 3.4: Fix `compression.test.ts`**
    *   [bug-fix] [performance] Analyze and fix the failure in `tests/performance/compression.test.ts` (uncaught exception, likely related to streaming).
*   **Task 3.5: Fix `httpCache.test.ts`**
    *   [bug-fix] [performance] Analyze and fix the failure in `tests/performance/httpCache.test.ts` (post-refactor issues from Phase 2).
*   **Task 3.6: Fix `retryExecutor.test.ts`**
    *   [bug-fix] [resilience] Analyze and fix the failure in `tests/resilience/retryExecutor.test.ts` (uncaught exception).
*   **Task 3.7: Fix `rateLimiter.test.ts`**
    *   [bug-fix] [security] Analyze and fix the failure in `tests/security/rateLimiter.test.ts` (post-refactor issues from Phase 2).
*   **Task 3.8: Fix `memoryManager.test.ts`**
    *   [bug-fix] [wasm] Analyze and fix the failure in `tests/wasm/memoryManager.test.ts` (WASM memory issues).
*   **Task 3.9: Fix `utils.test.ts` (WASM)**
    *   [bug-fix] [wasm] Analyze and fix the failure in `tests/wasm/utils.test.ts` (WASM loading issues).
*   **Task 3.10: Fix `smartContracts.ethers.test.ts`**
    *   [bug-fix] [web3] Analyze and fix the failure in `tests/web3/smartContracts.ethers.test.ts` (mock issues).
*   **Task 3.11: Fix `workerPool.test.ts`**
    *   [bug-fix] [workers] Analyze and fix the failure in `tests/workers/workerPool.test.ts` (worker pool issues).
*   **Task 3.12: Verify Full Test Suite & Coverage**
    *   [test] Run `npm test` to ensure all 262 tests pass.
    *   [test] Verify test coverage is >= 95%.

## Phase 4: Risk Mitigation (High Priority)

*   **Task 4.1: Document Worker Serialization Issue**
    *   [documentation] [workers] Add TODO comments in `src/workers/workerActor.ts` regarding serialization.
*   **Task 4.2: Design Worker Message Protocol**
    *   [design] [workers] Create a protocol specification for worker messages (design doc or code comments).
*   **Task 4.3: Implement Structured Cloning for Workers**
    *   [feature] [workers] Refactor `src/workers/workerActor.ts` to use structured cloning for message passing.
*   **Task 4.4: Add Worker Serialization Tests**
    *   [test] [workers] Add tests in `tests/workers/workerActor.test.ts` to verify complex data types work.
*   **Task 4.5: Create WASM Memory Alignment Tests**
    *   [test] [wasm] Add tests in `tests/wasm/memoryManager.test.ts` covering various byte alignments.
*   **Task 4.6: Add WASM Memory Overflow Detection**
    *   [feature] [wasm] Implement overflow checks in `src/wasm/memoryManager.ts`.
*   **Task 4.7: Verify No `eval: true` in Codebase**
    *   [security] Run `grep -r "eval:" . --include="*.ts"` to ensure no `eval: true` is used in production code.
*   **Task 4.8: Run Security Audit & Document Exceptions**
    *   [security] Run `npm audit` and fix any vulnerabilities.
    *   [documentation] [security] Create/update `SECURITY.md` to document known security exceptions.

## Phase 5: New Feature Implementation - Observability (Medium Priority)

*   **Task 5.1: Create Observability Type Definitions**
    *   [feature] [observability] Create `src/observability/types.ts` with metric, trace, and health check interfaces and enums.
*   **Task 5.2: Implement Counter Metric**
    *   [feature] [observability] Implement `Counter` class in `src/observability/metrics/counter.ts`.
    *   [test] [observability] Write corresponding tests for `Counter`.
*   **Task 5.3: Implement Gauge Metric**
    *   [feature] [observability] Implement `Gauge` class in `src/observability/metrics/gauge.ts`.
    *   [test] [observability] Write corresponding tests for `Gauge`.
*   **Task 5.4: Implement Histogram Metric**
    *   [feature] [observability] Implement `Histogram` class in `src/observability/metrics/histogram.ts`.
    *   [test] [observability] Write corresponding tests for `Histogram`.
*   **Task 5.5: Create MetricsCollector**
    *   [feature] [observability] Implement `MetricsCollector` in `src/observability/metrics/collector.ts` (registry pattern, Prometheus export).
    *   [test] [observability] Write corresponding tests for `MetricsCollector`.
*   **Task 5.6: Create Metrics Module Exports**
    *   [feature] [observability] Create `src/observability/metrics/index.ts` to export metrics components.
*   **Task 5.7: Implement Span Class**
    *   [feature] [observability] Implement `SpanImpl` class in `src/observability/tracing/span.ts` (attributes, events, status, end).
    *   [test] [observability] Write corresponding tests for `SpanImpl`.
*   **Task 5.8: Implement Tracer Class**
    *   [feature] [observability] Implement `Tracer` class in `src/observability/tracing/tracer.ts` (start/end spans, context propagation).
    *   [test] [observability] Write corresponding tests for `Tracer`.
*   **Task 5.9: Implement Sampling Strategies**
    *   [feature] [observability] Implement `Sampler` interface and `ProbabilitySampler`/`AdaptiveSampler` in `src/observability/tracing/sampler.ts`.
    *   [test] [observability] Write corresponding tests for `Sampler`.
*   **Task 5.10: Implement HealthCheckRegistry**
    *   [feature] [observability] Implement `HealthCheckRegistry` in `src/observability/health/healthRegistry.ts` (register, checkAll, getOverallStatus).
    *   [test] [observability] Write corresponding tests for `HealthCheckRegistry`.
*   **Task 5.11: Create Default Health Checks**
    *   [feature] [observability] Create `src/observability/health/defaultChecks.ts` (MemoryHealthCheck, UptimeHealthCheck).
*   **Task 5.12: Create Observability Module Exports**
    *   [feature] [observability] Create `src/observability/index.ts` to export all observability components.
*   **Task 5.13: Add Metrics Endpoint to HttpServer**
    *   [feature] [observability] [http] Modify `src/core/httpServer.ts` to expose a `/metrics` endpoint using `MetricsCollector`.
*   **Task 5.14: Add Health Endpoint to HttpServer**
    *   [feature] [observability] [http] Modify `src/core/httpServer.ts` to expose a `/health` endpoint using `HealthCheckRegistry`.
*   **Task 5.15: Integrate Metrics with ActorSystem**
    *   [feature] [observability] [actor-system] Modify `src/core/actorSystem.ts` to track actor messages, errors, and restarts using `MetricsCollector`.

**Parallelizable Tasks within Phase 5:**
*   Tasks 5.2, 5.3, 5.4 (Metric implementations) can be done in parallel.
*   Tasks 5.7, 5.8, 5.9 (Tracing implementations) can be done in parallel.
*   Tasks 5.10, 5.11 (Health Check implementations) can be done in parallel.

## Phase 6: New Feature Implementation - Resilience (Medium Priority)

*   **Task 6.1: Create Resilience Types & Errors**
    *   [feature] [resilience] Create `src/resilience/types.ts` (CircuitState, configs) and `src/resilience/errors.ts` (custom errors).
*   **Task 6.2: Implement Circuit Breaker**
    *   [feature] [resilience] Implement `CircuitBreaker` in `src/resilience/circuitBreaker.ts` (state machine, rolling window).
    *   [test] [resilience] Write corresponding tests for `CircuitBreaker`.
*   **Task 6.3: Implement Retry Executor**
    *   [feature] [resilience] Implement `RetryExecutor` in `src/resilience/retryExecutor.ts` (exponential backoff, jitter, error matchers).
    *   [test] [resilience] Write corresponding tests for `RetryExecutor`.
*   **Task 6.4: Implement Bulkhead**
    *   [feature] [resilience] Implement `Bulkhead` in `src/resilience/bulkhead.ts` (semaphore, queue management).
    *   [test] [resilience] Write corresponding tests for `Bulkhead`.
*   **Task 6.5: Implement Timeout Executor**
    *   [feature] [resilience] Implement `TimeoutExecutor` in `src/resilience/timeout.ts` (Promise.race, fallback).
    *   [test] [resilience] Write corresponding tests for `TimeoutExecutor`.
*   **Task 6.6: Implement Policy Composition**
    *   [feature] [resilience] Implement `CompositePolicy` in `src/resilience/policies/compositePolicy.ts` (combining policies).
    *   [test] [resilience] Write corresponding tests for `CompositePolicy`.
*   **Task 6.7: Create Resilience Module Exports**
    *   [feature] [resilience] Create `src/resilience/index.ts` to export all resilience components.
*   **Task 6.8: Write Comprehensive Resilience Tests**
    *   [test] [resilience] Write remaining tests for `circuitBreaker.test.ts`, `retryExecutor.test.ts`, `bulkhead.test.ts`, and `compositePolicy.test.ts`.

**Parallelizable Tasks within Phase 6:**
*   Tasks 6.2, 6.3, 6.4, 6.5 (Resilience pattern implementations) can be done in parallel.

## Phase 7: New Feature Implementation - Performance & Security Enhancements (Medium Priority)

*   **Task 7.1: Implement Streaming Compression Middleware**
    *   [feature] [performance] Replace placeholder in `src/performance/compression.ts` with a real streaming Brotli/Gzip implementation using `node:zlib`.
    *   [test] [performance] Write comprehensive tests for compression middleware.
*   **Task 7.2: Implement HTTP Caching Utilities**
    *   [feature] [performance] Implement HTTP caching utilities in `src/performance/httpCache.ts` (ETags, Cache-Control headers).
    *   [test] [performance] Write corresponding tests for HTTP caching utilities.
*   **Task 7.3: Implement CSPBuilder**
    *   [feature] [security] Implement `CSPBuilder` in `src/security/csp.ts` (builder pattern for CSP headers).
    *   [test] [security] Write corresponding tests for `CSPBuilder`.
*   **Task 7.4: Implement Rate Limiting Middleware**
    *   [feature] [security] Implement rate-limiting middleware in `src/security/rateLimiter.ts` (sliding window algorithm).
    *   [test] [security] Write corresponding tests for rate-limiting middleware.

**Parallelizable Tasks within Phase 7:**
*   Tasks 7.1, 7.2, 7.3, 7.4 (Performance and Security features) can be done in parallel.

## Phase 8: New Feature Implementation - Web3, WASM, Workers, API (Medium Priority)

*   **Task 8.1: Implement `SmartContractClient`**
    *   [feature] [web3] Implement `SmartContractClient` class in `src/web3/smartContracts.ts` for EVM-compatible chain interaction.
    *   [test] [web3] Write corresponding tests for `SmartContractClient`.
*   **Task 8.2: Implement `IPFSClient`**
    *   [feature] [web3] Implement `IPFSClient` class in `src/web3/ipfs.ts` for content addressing and retrieval.
    *   [test] [web3] Write corresponding tests for `IPFSClient`.
*   **Task 8.3: Implement Wasm Loading Utilities**
    *   [feature] [wasm] Implement Wasm loading and instantiation utilities in `src/wasm/utils.ts`.
    *   [test] [wasm] Write corresponding tests for Wasm loading utilities.
*   **Task 8.4: Integrate Wasm with `WorkerActor`**
    *   [feature] [wasm] [actor-system] Modify `WorkerActor` to offload computations to Wasm modules.
    *   [test] [wasm] [actor-system] Write corresponding tests for `WorkerActor` Wasm integration.
*   **Task 8.5: Implement `WorkerActor` Base Class**
    *   [feature] [workers] Implement the `WorkerActor` base class in `src/workers/workerActor.ts`.
    *   [test] [workers] Write corresponding tests for `WorkerActor`.
*   **Task 8.6: Implement `WorkerPool`**
    *   [feature] [workers] Implement the `WorkerPool` class in `src/workers/workerPool.ts` (using `node:worker_threads`).
    *   [test] [workers] Write corresponding tests for `WorkerPool`.
*   **Task 8.7: Implement Basic GraphQL Server**
    *   [feature] [api] [graphql] Implement a basic GraphQL server in `src/api/graphql.ts`.
    *   [test] [api] [graphql] Write corresponding tests for GraphQL server.
*   **Task 8.8: Implement Basic gRPC Server and Client**
    *   [feature] [api] [grpc] Implement a basic gRPC server and client in `src/api/grpc.ts`.
    *   [test] [api] [grpc] Write corresponding tests for gRPC server and client.

**Parallelizable Tasks within Phase 8:**
*   Tasks 8.1, 8.2 (Web3 features) can be done in parallel.
*   Tasks 8.3, 8.4 (WASM features) can be done in parallel.
*   Tasks 8.5, 8.6 (Workers features) can be done in parallel.
*   Tasks 8.7, 8.8 (API features) can be done in parallel.

## Phase 9: Documentation & Examples (Medium Priority)

*   **Task 9.1: Update Main `src/index.ts` Exports**
    *   [documentation] Update `src/index.ts` to add exports for all new modules (observability, resilience, etc.).
*   **Task 9.2: Update `package.json` (if needed)**
    *   [setup] [documentation] Add any new scripts or verify dependencies in `package.json`.
*   **Task 9.3: Create Example Files**
    *   [documentation] Create `examples/observability-example.ts`, `examples/resilience-example.ts`, and `examples/compression-example.ts` demonstrating usage.
*   **Task 9.4: Update `README.md`**
    *   [documentation] Update `README.md` to reflect all new features, architecture, and getting started guide.
*   **Task 9.5: Create Module-Specific Documentation**
    *   [documentation] Create detailed markdown files for each major feature area (Web3, Wasm, Workers, Security, Performance, API).
*   **Task 9.6: Create Tutorials and Usage Examples**
    *   [documentation] Create additional example projects or code snippets demonstrating how to use various features.

**Parallelizable Tasks within Phase 9:**
*   Tasks 9.3, 9.4, 9.5, 9.6 (Documentation and Examples) can be done in parallel.

## Phase 10: Showcase Application (Lower Priority)

*   **Task 10.1: API Gateway Service Implementation**
    *   [feature] [showcase] [api] Create project structure, implement HTTP/REST, GraphQL, gRPC, add rate limiting, CSP, compression, and write integration tests.
*   **Task 10.2: Order Service (Actor-Based) Implementation**
    *   [feature] [showcase] [actor-system] Implement OrderActor state machine, event sourcing, integrate circuit breaker & retry, add distributed tracing, and write actor tests.
*   **Task 10.3: Notification Service (WebSocket) Implementation**
    *   [feature] [showcase] [websocket] Implement WebSocket server, add EventBus subscriptions, broadcast logic, connection rate limiting, and write WebSocket tests.
*   **Task 10.4: Analytics Service Implementation**
    *   [feature] [showcase] [observability] Implement metrics aggregation, Prometheus exporter, Grafana dashboard JSON, write metrics tests, and document schema.
*   **Task 10.5: Storage Service (Web3/IPFS) Implementation**
    *   [feature] [showcase] [web3] Implement IPFS upload/download, smart contract integration, wallet connection UI, write Web3 integration tests, and add error handling.
*   **Task 10.6: Compute Service (WASM) Implementation**
    *   [feature] [showcase] [wasm] Create WASM image processing module, TypeScript wrapper, worker pool integration, benchmarking suite, and write performance tests.
*   **Task 10.7: Infrastructure & Deployment (Docker/Kubernetes)**
    *   [infra] [showcase] Create Dockerfiles, docker-compose.yml, Kubernetes manifests, service definitions, ingress, ConfigMaps, Secrets, and autoscaling.
*   **Task 10.8: Monitoring & Observability Setup**
    *   [infra] [showcase] [observability] Set up Prometheus, Grafana dashboards, Jaeger, and log aggregation.
*   **Task 10.9: Showcase Documentation**
    *   [documentation] [showcase] Write showcase README, architecture diagrams, API documentation, deployment guide, video walkthrough, and troubleshooting guide.

**Parallelizable Tasks within Phase 10:**
*   Tasks 10.1 through 10.6 (Individual service implementations) can be done in parallel.
*   Tasks 10.7, 10.8, 10.9 (Infrastructure, Monitoring, Documentation) can be done in parallel once service implementations are stable.

## Phase 11: Advanced & Enterprise Features (Lower Priority)

*   **Task 11.1: WebSocket Support (Built-in)**
    *   [feature] [websocket] Implement WebSocket server class, room-based messaging, authentication middleware, and write comprehensive tests.
*   **Task 11.2: Distributed Actor System (Clustering)**
    *   [feature] [actor-system] Design cluster protocol, implement node discovery, actor routing, health checks, fault recovery, and write cluster tests.
*   **Task 11.3: Advanced Rate Limiting (Distributed)**
    *   [feature] [security] Implement Redis-backed distributed rate limiting, token bucket algorithm, rate limit headers, multi-key tracking, and write performance tests.
*   **Task 11.4: Enhanced WASM Integration**
    *   [feature] [wasm] Add streaming compilation, hot-reloading, debugging utilities, memory profiler, and write WASM benchmarks.
*   **Task 11.5: GraphQL Enhancements**
    *   [feature] [api] [graphql] Implement full GraphQL server with schema stitching, subscriptions, DataLoader integration, GraphQL playground, and write GraphQL tests.
*   **Task 11.6: Service Mesh Integration**
    *   [feature] [infra] Add Istio/Linkerd compatibility, service discovery, mTLS, traffic management, and write service mesh tests.
*   **Task 11.7: Advanced Observability (Exporters)**
    *   [feature] [observability] Implement Jaeger/Zipkin exporters, custom span processors, log correlation, and write observability tests.
*   **Task 11.8: Multi-Tenancy Support**
    *   [feature] [security] Design tenant isolation model, implement tenant manager, resource quotas, tenant-aware metrics, and write multi-tenancy tests.
*   **Task 11.9: Advanced Security (OAuth2/JWT/API Keys)**
    *   [feature] [security] Implement OAuth2 provider, JWT authentication middleware, API key management, mTLS support, and write security tests.
*   **Task 11.10: Kubernetes Operators**
    *   [feature] [infra] Define CRDs, implement operator logic, automated scaling, self-healing, and write operator tests.
*   **Task 11.11: Helm Charts**
    *   [feature] [infra] Create Helm chart structure, add values.yaml, implement chart dependencies, migration hooks, and test chart installation.
*   **Task 11.12: Production Guides**
    *   [documentation] Write deployment guide (AWS/GCP/Azure), security checklist, scaling guide, monitoring setup, and troubleshooting runbook.
*   **Task 11.13: Load Testing Framework**
    *   [test] [performance] Set up k6/Artillery, create load test scenarios, define performance baselines, add CI/CD integration, and write performance reports.
*   **Task 11.14: Chaos Engineering**
    *   [test] [security] Integrate Chaos Mesh/Litmus, create chaos experiments, implement automated recovery tests, document scenarios, and add chaos dashboard.

**Parallelizable Tasks within Phase 11:**
*   Many tasks within this phase can be parallelized, especially those related to different feature areas (e.g., WebSocket, Distributed Actors, Advanced Rate Limiting, WASM, GraphQL, Service Mesh, Advanced Observability, Multi-Tenancy, Advanced Security, Kubernetes Operators, Helm Charts, Production Guides, Load Testing, Chaos Engineering).