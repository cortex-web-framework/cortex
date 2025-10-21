## TODO.md: Implementing Advanced Web Technologies in Cortex Framework

## Phase 1: Web3 Integration
*   `[web3]` Create `src/web3/smartContracts.ts` module.
*   `[web3]` Implement `SmartContractClient` class (RPC calls, ABI encoding/decoding).
*   `[web3]` Provide methods for calling contract functions.
*   `[web3]` Provide methods for listening to contract events.
*   `[web3]` Create `src/web3/ipfs.ts` module.
*   `[web3]` Implement `IPFSClient` class for content addressing and retrieval.
*   `[web3]` Provide methods for adding content to IPFS.
*   `[web3]` Provide methods for getting content from IPFS.

## Phase 2: WebAssembly (Wasm) Integration
*   `[wasm]` Create `src/wasm/utils.ts` module.
*   `[wasm]` Implement utilities for loading Wasm modules.
*   `[wasm]` Implement utilities for instantiating Wasm modules.
*   `[wasm]` Provide helper functions for passing data between JavaScript and Wasm.
*   `[wasm][actor-system]` Modify `WorkerActor` base class to support offloading computations to Wasm modules.

## Phase 3: WebWorker & Web Threads Integration
*   `[workers]` Create `src/workers/workerActor.ts` base class extending `Actor`.
*   `[workers]` Implement logic to run `receive` method in a Web Worker.
*   `[workers]` Provide abstractions for message passing between main thread and worker.
*   `[workers]` Create `src/workers/workerPool.ts` module.
*   `[workers]` Implement `WorkerPool` class for managing `WorkerActor` instances.

## Phase 4: Enhanced Security Features
*   `[security]` Create `src/security/csp.ts` module.
*   `[security]` Implement helper class/function for generating CSP headers.
*   `[security]` Implement helper class/function for setting CSP headers.
*   `[security]` Create `src/security/rateLimiter.ts` module.
*   `[security]` Implement configurable rate limiting middleware for HTTP endpoints.

## Phase 5: Performance Boosting Features
*   `[performance]` Create `src/performance/httpCache.ts` module.
*   `[performance]` Implement utilities for setting `Cache-Control` headers.
*   `[performance]` Implement utilities for setting `ETag` headers.
*   `[performance]` Implement utilities for setting `Last-Modified` headers.
*   `[performance]` Create `src/performance/compression.ts` module.
*   `[performance]` Implement built-in Brotli compression middleware for HTTP responses.
*   `[performance]` Implement built-in Gzip compression middleware for HTTP responses.

## Phase 6: Advanced API Technologies
*   `[api]` Create `src/api/graphql.ts` module.
*   `[api]` Implement basic GraphQL server (schema definition).
*   `[api]` Implement basic GraphQL server (resolvers).
*   `[api]` Integrate GraphQL server with `CortexHttpServer`.
*   `[api]` Provide utilities for defining GraphQL schemas.
*   `[api]` Create `src/api/grpc.ts` module.
*   `[api]` Implement basic gRPC server using Protocol Buffers.
*   `[api]` Implement basic gRPC client using Protocol Buffers.
*   `[api]` Provide utilities for defining `.proto` files (manual step).
*   `[api]` Provide utilities for generating corresponding code (manual step).