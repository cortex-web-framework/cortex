## PLAN.md: Implementing Advanced Web Technologies in Cortex Framework

## Phase 1: Web3 Integration

### Goal
To enable the Cortex Framework to interact with blockchain networks and decentralized storage solutions.

### Tasks

1.  **Smart Contracts Interaction Module:**
    *   Create `src/web3/smartContracts.ts` module.
    *   Implement a `SmartContractClient` class for interacting with EVM-compatible chains (RPC calls, ABI encoding/decoding).
    *   Provide methods for calling contract functions and listening to events.
2.  **IPFS Integration Module:**
    *   Create `src/web3/ipfs.ts` module.
    *   Implement an `IPFSClient` class for content addressing and retrieval.
    *   Provide methods for adding and getting content from IPFS.

## Phase 2: WebAssembly (Wasm) Integration

### Goal
To enable the Cortex Framework to leverage WebAssembly for performance-critical tasks.

### Tasks

1.  **Wasm Utilities Module:**
    *   Create `src/wasm/utils.ts` module.
    *   Implement utilities for loading and instantiating Wasm modules.
    *   Provide helper functions for passing data between JavaScript and Wasm.
2.  **WorkerActor with Wasm Support:**
    *   Modify the `WorkerActor` base class (from WebWorker phase) to support offloading computations to Wasm modules.

## Phase 3: WebWorker & Web Threads Integration

### Goal
To improve application responsiveness and performance by offloading heavy computations to background threads.

### Tasks

1.  **WorkerActor Base Class:**
    *   Create `src/workers/workerActor.ts` base class that extends `Actor`.
    *   Implement logic to run the `receive` method in a Web Worker.
    *   Provide abstractions for message passing between the main thread and the worker.
2.  **Worker Pool Management:**
    *   Create `src/workers/workerPool.ts` module.
    *   Implement a `WorkerPool` class for managing a pool of `WorkerActor` instances.

## Phase 4: Enhanced Security Features

### Goal
To provide built-in mechanisms to mitigate common web vulnerabilities.

### Tasks

1.  **Content Security Policy (CSP) Helper:**
    *   Create `src/security/csp.ts` module.
    *   Implement a helper class/function for generating and setting CSP headers.
2.  **Rate Limiting Middleware:**
    *   Create `src/security/rateLimiter.ts` module.
    *   Implement a configurable rate limiting middleware for HTTP endpoints.

## Phase 5: Performance Boosting Features

### Goal
To provide tools and patterns for achieving high performance in the Cortex Framework.

### Tasks

1.  **HTTP Caching Headers Utility:**
    *   Create `src/performance/httpCache.ts` module.
    *   Implement utilities for setting HTTP caching headers (e.g., `Cache-Control`, `ETag`, `Last-Modified`).
2.  **Compression Middleware:**
    *   Create `src/performance/compression.ts` module.
    *   Implement built-in compression middleware (Brotli, Gzip) for HTTP responses.

## Phase 6: Advanced API Technologies

### Goal
To offer flexible and modern API capabilities beyond traditional REST.

### Tasks

1.  **GraphQL Server Implementation:**
    *   Create `src/api/graphql.ts` module.
    *   Implement a basic GraphQL server (schema definition, resolvers) integrated with the `CortexHttpServer`.
    *   Provide utilities for defining GraphQL schemas.
2.  **gRPC Server/Client Implementation:**
    *   Create `src/api/grpc.ts` module.
    *   Implement basic gRPC server and client using Protocol Buffers.
    *   Provide utilities for defining `.proto` files and generating corresponding code (manual step for now due to zero-dependency).
