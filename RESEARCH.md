# Research on Advanced Web Technologies and Best Practices for Cortex Framework

## Introduction

This research explores a wide array of advanced web technologies and best practices relevant to modern web development. The goal is to identify potential functionalities and architectural considerations for the Cortex Framework, always adhering to the principles of zero dependency, Test-Driven Development (TDD), and clean code.

## 1. Web3 Related Technologies

Web3 represents a paradigm shift towards a decentralized internet, leveraging blockchain technology to empower users with data ownership and control. Implementing Web3 features in Cortex would involve integrating with blockchain networks and decentralized protocols.

*   **Blockchain Fundamentals:**
    *   **Smart Contracts:** Self-executing contracts with the terms of the agreement directly written into code. Cortex could provide abstractions for interacting with smart contracts (e.g., calling functions, listening to events).
        *   *Implementation:* Custom client for EVM-compatible chains (e.g., Ethereum, Polygon) using RPC calls. Abstractions for contract ABI encoding/decoding.
    *   **Decentralized Applications (DApps):** Applications built on decentralized networks. Cortex could offer patterns for building DApp backends.
        *   *Implementation:* Actor-based models for DApp logic, EventBus for blockchain event subscriptions.
    *   **Consensus Mechanisms:** Understanding Proof-of-Work (PoW), Proof-of-Stake (PoS), etc. Cortex would abstract away these details for developers.
*   **Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs):** Standards for self-sovereign identity.
    *   *Implementation:* Custom DID resolver and VC verifier modules.
*   **InterPlanetary File System (IPFS) & Decentralized Storage:** Peer-to-peer hypermedia protocol for storing and sharing data in a distributed file system.
    *   *Implementation:* IPFS client integration for content addressing and retrieval. Custom storage actors.
*   **Decentralized Autonomous Organizations (DAOs):** Organizations represented by rules encoded as a transparent computer program, controlled by organization members.
    *   *Implementation:* Tools for interacting with DAO smart contracts, governance mechanisms.
*   **Zero-Knowledge Proofs (ZKPs):** Cryptographic methods allowing one party to prove to another that a statement is true, without revealing any information beyond the validity of the statement itself.
    *   *Implementation:* Integration with ZKP libraries (e.g., `circom`, `snarkjs`) for privacy-preserving computations.
*   **Oracles:** Entities that connect blockchains to external systems, allowing smart contracts to execute based on real-world data.
    *   *Implementation:* Custom oracle client actors that fetch off-chain data and submit to smart contracts.
*   **Wallets and Key Management:** Securely managing cryptographic keys for blockchain interactions.
    *   *Implementation:* Abstractions for wallet integration (e.g., MetaMask, WalletConnect) for signing transactions.
*   **Token Standards (ERC-20, ERC-721, etc.):** Common interfaces for fungible and non-fungible tokens.
    *   *Implementation:* Helper classes for interacting with standard token contracts.
*   **Layer 2 Scaling Solutions:** Technologies built on top of Layer 1 blockchains to improve scalability (e.g., rollups, sidechains).
    *   *Implementation:* Support for interacting with Layer 2 specific RPC endpoints.
*   **Cross-chain Interoperability:** Enabling communication and asset transfer between different blockchain networks.
    *   *Implementation:* Abstractions for cross-chain bridges or messaging protocols.
*   **Decentralized Finance (DeFi) Concepts:** Lending, borrowing, decentralized exchanges.
    *   *Implementation:* Building blocks for DeFi protocols (e.g., AMM logic in actors).
*   **Non-Fungible Tokens (NFTs):** Unique digital assets.
    *   *Implementation:* Tools for minting, transferring, and displaying NFTs.
*   **Metaverse Technologies:** Virtual worlds and digital experiences.
    *   *Implementation:* Integration with 3D rendering engines (e.g., Three.js, Babylon.js) for web-based metaverses.
*   **Privacy-preserving Technologies:** Homomorphic encryption, secure multi-party computation.
    *   *Implementation:* Custom cryptographic modules.

## 2. WebAssembly (Wasm)

Wasm is a binary instruction format for a stack-based virtual machine. It's designed as a portable compilation target for high-level languages like C/C++/Rust/Go, enabling deployment on the web for client and server applications.

*   **Fundamentals:**
    *   **Binary Format & Execution Model:** Efficient, low-level bytecode that runs near-native performance.
    *   *Implementation:* Provide utilities for loading and instantiating Wasm modules (`WebAssembly.instantiate`).
*   **Use Cases:**
    *   **Performance-Critical Tasks:** Image/video processing, scientific simulations, game engines.
    *   **Desktop Apps:** Via Electron or Tauri, Wasm can power parts of desktop applications.
    *   *Implementation:* Actors can offload heavy computations to Wasm modules.
*   **Integration with JavaScript:** Seamless interoperation between Wasm and JS.
    *   *Implementation:* Helper functions for passing data between JS and Wasm, managing Wasm memory.
*   **Wasm System Interface (WASI):** A modular system interface for WebAssembly, designed for non-web environments.
    *   *Implementation:* Cortex could provide a runtime for WASI modules in server-side contexts.
*   **Security Implications:** Wasm runs in a sandboxed environment, enhancing security.
    *   *Implementation:* Ensure proper module validation and resource limits.
*   **Performance Benefits:** Near-native speed for computationally intensive tasks.
    *   *Implementation:* Provide clear guidelines and examples for when to use Wasm.
*   **Tooling and Language Support:** Compilers from various languages to Wasm.
    *   *Implementation:* Offer build system integration for Wasm compilation.

## 3. WebRTC

WebRTC (Web Real-Time Communication) enables real-time voice, video, and generic data communication between web browsers and mobile applications directly, without the need for intermediaries.

*   **Fundamentals:**
    *   **Peer-to-Peer Communication:** Direct connection between clients.
    *   **STUN/TURN Servers:** Used for NAT traversal and relaying traffic when direct connection is not possible.
    *   *Implementation:* Provide abstractions for `RTCPeerConnection`, `RTCIceCandidate`, `RTCSessionDescription`.
*   **Use Cases:**
    *   **Video Conferencing, File Sharing, Live Streaming:** Core applications of WebRTC.
    *   *Implementation:* Actors can manage WebRTC connections and data channels.
*   **Security Considerations:** Encryption is built-in, but consent and identity management are crucial.
    *   *Implementation:* Integrate with authentication mechanisms, ensure user consent for media access.
*   **Performance Optimization:** Managing bandwidth, codecs, and network conditions.
    *   *Implementation:* Offer utilities for adaptive bitrate streaming, network condition monitoring.
*   **Integration with Signaling Servers:** WebRTC requires a signaling mechanism to set up connections.
    *   *Implementation:* Provide a simple signaling server implementation or integration points for custom ones.

## 4. WebWorker & Web Threads

Web Workers allow web applications to run scripts in background threads, separate from the main execution thread, improving application responsiveness and performance.

*   **Purpose and Benefits:**
    *   **Offloading Heavy Computations:** Keep the UI responsive by moving long-running tasks to a worker thread.
    *   *Implementation:* Provide a `WorkerActor` base class that runs its `receive` logic in a Web Worker.
*   **Communication Patterns:**
    *   **`postMessage`:** Asynchronous message passing between main thread and workers.
    *   **`MessageChannel`:** For direct, two-way communication between specific ports.
    *   *Implementation:* Abstractions for message passing, ensuring type safety.
*   **`SharedArrayBuffer` and Atomics:** For shared memory between main thread and workers, enabling more efficient data exchange.
    *   *Implementation:* Utilities for managing `SharedArrayBuffer` and atomic operations.
*   **Limitations:** Workers cannot directly access the DOM.
    *   *Implementation:* Clear guidelines on what can and cannot be done in workers.
*   **Security Implications:** Workers run in a sandboxed environment.
    *   *Implementation:* Ensure proper origin checks for worker scripts.
*   **Performance Boosting Techniques:** Parallel execution of tasks.
    *   *Implementation:* Provide a `WorkerPool` for managing multiple workers.

## 5. Security (General & Advanced)

Robust security is paramount for any web framework. Cortex should provide built-in mechanisms and best practices to mitigate common vulnerabilities.

*   **OWASP Top 10:** Address the most critical web application security risks.
    *   *Implementation:* Built-in protections against Injection, Broken Authentication, Sensitive Data Exposure, XML External Entities (XXE), Broken Access Control, Security Misconfiguration, Cross-Site Scripting (XSS), Insecure Deserialization, Using Components with Known Vulnerabilities, Insufficient Logging & Monitoring.
*   **Content Security Policy (CSP):** Mitigate XSS and data injection attacks.
    *   *Implementation:* Helper for generating and setting CSP headers.
*   **Cross-Origin Resource Sharing (CORS):** Control access to resources from different origins.
    *   *Implementation:* Advanced CORS middleware with fine-grained control.
*   **XSS, CSRF, SQL Injection Prevention:** Core web vulnerabilities.
    *   *Implementation:* Input sanitization, output encoding, CSRF tokens, parameterized queries (if database integration is added).
*   **Authentication and Authorization:**
    *   **JWT (JSON Web Tokens):** Securely transmit information between parties.
        *   *Implementation:* JWT creation, validation, and refresh mechanisms.
    *   **OAuth2/OIDC:** Industry-standard protocols for authorization and authentication.
        *   *Implementation:* Client and/or server implementations for OAuth2/OIDC flows.
    *   **RBAC/ABAC:** Role-Based and Attribute-Based Access Control.
        *   *Implementation:* Middleware and decorators for access control checks.
*   **API Security:**
    *   **API Keys:** Simple authentication for API access.
        *   *Implementation:* API key management and validation middleware.
    *   **Rate Limiting/Throttling:** Prevent abuse and ensure fair usage.
        *   *Implementation:* Configurable rate limiting middleware.
*   **Data Encryption:** Protect sensitive data at rest and in transit.
    *   *Implementation:* Utilities for symmetric/asymmetric encryption, TLS/SSL enforcement.
*   **Secure Coding Practices:** Guidelines and tools to encourage secure code.
    *   *Implementation:* Static analysis integration (e.g., ESLint rules for security).
*   **Supply Chain Security:** Mitigate risks from third-party dependencies.
    *   *Implementation:* Tools for dependency scanning (though zero-dependency policy reduces this risk).
*   **Vulnerability Management:** Identifying, assessing, and remediating security vulnerabilities.
    *   *Implementation:* Integration points for security scanners.
*   **Threat Modeling:** Systematically identify potential threats and vulnerabilities.
    *   *Implementation:* Provide guidance and templates for threat modeling.
*   **Privacy by Design:** Incorporate privacy considerations from the outset.
    *   *Implementation:* Helper functions for data anonymization, consent management.

## 6. Performance Boosting (General & Advanced)

Optimizing performance is crucial for a good user experience and efficient resource utilization. Cortex should provide tools and patterns for achieving high performance.

*   **Critical Rendering Path Optimization:** Prioritize content that is visible to the user.
    *   *Implementation:* Server-side rendering, preloading critical assets.
*   **Lazy Loading:** Defer loading of non-critical resources until they are needed.
    *   *Implementation:* Component-level lazy loading, image lazy loading utilities.
*   **Code Splitting and Tree Shaking:** Reduce bundle size by only loading necessary code.
    *   *Implementation:* Build system integration (though zero-dependency limits this to manual optimization).
*   **Caching Strategies:** Improve response times and reduce server load.
    *   *Implementation:* HTTP caching headers, in-memory caching, Service Worker caching.
*   **Image and Video Optimization:** Deliver media efficiently.
    *   *Implementation:* Image resizing/compression utilities, adaptive streaming.
*   **Font Optimization:** Reduce font file sizes and improve loading.
    *   *Implementation:* Font subsetting, `font-display` control.
*   **Web Vitals Optimization:** Core Web Vitals (LCP, FID, CLS) are key performance metrics.
    *   *Implementation:* Tools for measuring and reporting Web Vitals, best practice guides.
*   **Server-Side Rendering (SSR) / Static Site Generation (SSG) / Incremental Static Regeneration (ISR):** Improve initial load performance and SEO.
    *   *Implementation:* Built-in SSR/SSG capabilities, data pre-fetching mechanisms.
*   **Edge Computing:** Process data closer to the user for lower latency.
    *   *Implementation:* Framework design compatible with edge runtimes (e.g., Cloudflare Workers, Vercel Edge Functions).
*   **HTTP/2 and HTTP/3:** Modern HTTP protocols for improved performance.
    *   *Implementation:* Ensure server supports these protocols.
*   **Compression (Brotli, Gzip):** Reduce transfer sizes.
    *   *Implementation:* Built-in compression middleware.
*   **Resource Hints (preload, prefetch):** Inform the browser about critical resources.
    *   *Implementation:* Helper functions for generating resource hints.
*   **Performance Monitoring and Profiling:** Identify and diagnose performance bottlenecks.
    *   *Implementation:* Integration with performance APIs (`PerformanceObserver`), custom profiling tools.

## 7. Decentralized Web (Beyond Web3)

Focuses on the broader principles of decentralization, not just blockchain.

*   **Principles of Decentralization:** Data ownership, censorship resistance, peer-to-peer.
    *   *Implementation:* Design patterns that promote these principles.
*   **Peer-to-Peer Networks (e.g., libp2p):** Direct communication between nodes.
    *   *Implementation:* Abstractions for P2P connectivity, message routing.
*   **Decentralized Identity:** User-controlled identity systems.
    *   *Implementation:* Integration with DID/VC standards.
*   **Decentralized Social Networks:** Building social applications without central control.
    *   *Implementation:* Building blocks for federated or P2P social graphs.
*   **Data Ownership and Privacy:** Empowering users with control over their data.
    *   *Implementation:* Encryption, access control, consent management.

## 8. API Technologies

Cortex should offer flexible and modern API capabilities.

*   **GraphQL:**
    *   **Fundamentals:** Query language for APIs, allowing clients to request exactly what they need.
    *   *Implementation:* GraphQL server implementation (schema definition, resolvers), integration with HTTP server.
    *   **Subscriptions:** Real-time data updates.
        *   *Implementation:* WebSocket integration for GraphQL subscriptions.
*   **gRPC:**
    *   **Fundamentals:** High-performance RPC framework using Protocol Buffers and HTTP/2.
    *   *Implementation:* gRPC server and client implementations, code generation for service definitions.
    *   **Streaming:** Support for all gRPC streaming types.
        *   *Implementation:* Abstractions for handling unary, server-streaming, client-streaming, and bidirectional streaming.
*   **tRPC:**
    *   **Fundamentals:** End-to-end type safety without code generation, built for TypeScript monorepos.
    *   *Implementation:* tRPC server implementation, integration with HTTP server.
    *   **Benefits:** Excellent developer experience, reduced boilerplate, type safety across client/server.
*   **REST (Advanced):**
    *   **HATEOAS (Hypermedia as the Engine of Application State):** Improve discoverability and navigability of APIs.
        *   *Implementation:* Helper functions for embedding hypermedia controls in responses.
    *   **Versioning Strategies:** Manage API evolution.
        *   *Implementation:* URL-based, header-based, or content negotiation-based versioning.
    *   **Pagination, Filtering, Sorting:** Common API query patterns.
        *   *Implementation:* Middleware for parsing query parameters and applying them to data retrieval.
    *   **Conditional Requests:** Reduce bandwidth using `ETag` and `Last-Modified`.
        *   *Implementation:* Middleware for handling `If-None-Match` and `If-Modified-Since` headers.
    *   **API Gateway Patterns:** Centralize API management.
        *   *Implementation:* Built-in API gateway capabilities (e.g., routing, authentication, rate limiting).
*   **WebHooks:**
    *   **Event-Driven Communication:** Notify external systems of events.
    *   *Implementation:* Webhook management (registration, delivery, retry), security (signatures, verification).

## 9. Best Practices for Actor Frameworks

### Overview
Actor frameworks provide a robust model for building concurrent, distributed systems. This section compares Cortex with established actor systems and identifies production-grade patterns.

### Comparison with Major Actor Frameworks

#### Akka (JVM)
- **Supervision Strategy**: Hierarchical supervision with strategies (Resume, Restart, Stop, Escalate)
- **Message Ordering**: Per-actor FIFO ordering guaranteed for messages from same sender
- **Backpressure**: Reactive Streams integration, bounded mailboxes
- **Production Features**: Cluster sharding, persistence, distributed data

```typescript
// Cortex Supervision Implementation Pattern
interface SupervisionStrategy {
  decide(error: Error, actor: Actor): SupervisionDirective;
}

enum SupervisionDirective {
  RESUME,    // Continue with next message
  RESTART,   // Reset actor state
  STOP,      // Terminate actor
  ESCALATE   // Pass to parent supervisor
}

class OneForOneStrategy implements SupervisionStrategy {
  constructor(
    private maxRetries: number = 3,
    private withinTimeRange: number = 60000 // 1 minute
  ) {}

  decide(error: Error, actor: Actor): SupervisionDirective {
    // Track failures per actor
    const failures = this.getFailureCount(actor);

    if (failures >= this.maxRetries) {
      return SupervisionDirective.STOP;
    }

    if (error instanceof RecoverableError) {
      return SupervisionDirective.RESTART;
    }

    return SupervisionDirective.ESCALATE;
  }
}
```

#### Pony Lang
- **Capabilities-based Typing**: Reference capabilities ensure data-race freedom
- **Message Ordering**: Causal messaging ensures consistent ordering
- **Zero-copy Messaging**: Ownership transfer eliminates copying
- **Production Features**: No garbage collection pauses, fault tolerance

```typescript
// Cortex Message Capability Pattern
type MessageCapability = 'iso' | 'val' | 'ref' | 'box' | 'tag';

interface Message {
  readonly capability: MessageCapability;
  payload: unknown;
}

// Isolated (iso) - exclusive mutable reference
// Value (val) - immutable, deeply shareable
// Reference (ref) - mutable, not sendable between actors
// Box (box) - readable reference
// Tag (tag) - opaque identity only
```

#### DAPR (Distributed Application Runtime)
- **Service Invocation**: Direct actor-to-actor calls with service discovery
- **State Management**: Pluggable state stores with consistency guarantees
- **Pub/Sub**: Event-driven messaging with multiple brokers
- **Production Features**: Observability, secrets management, distributed tracing

```typescript
// Cortex DAPR-inspired State Management
interface ActorStateManager {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  contains(key: string): Promise<boolean>;

  // Transactional operations
  transaction<T>(fn: (tx: StateTransaction) => Promise<T>): Promise<T>;
}

interface StateTransaction {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  commit(): Promise<void>;
  rollback(): void;
}
```

#### Orleans (Microsoft)
- **Virtual Actors**: Actors always exist, automatic activation/deactivation
- **Location Transparency**: Actors can move between nodes
- **Declarative Persistence**: Automatic state persistence
- **Production Features**: Streaming, transactions, timers/reminders

```typescript
// Cortex Virtual Actor Pattern
interface VirtualActor extends Actor {
  readonly grainId: string;

  // Automatic activation
  onActivate(): Promise<void>;

  // Automatic deactivation after idle period
  onDeactivate(): Promise<void>;

  // State is automatically persisted
  state: ActorState;
}

class UserActor extends VirtualActor {
  async onActivate() {
    // Load state from persistent storage
    this.state = await this.stateManager.load();
  }

  async onDeactivate() {
    // Save state before deactivation
    await this.stateManager.save(this.state);
  }
}
```

### Actor Supervision Strategies

#### One-For-One Strategy
Restarts only the failed actor, siblings continue running.

```typescript
class OneForOneSupervisor extends Actor {
  private children: Map<string, Actor> = new Map();

  protected override onChildFailure(child: Actor, error: Error): void {
    const decision = this.strategy.decide(error, child);

    switch (decision) {
      case SupervisionDirective.RESTART:
        this.restartChild(child);
        break;
      case SupervisionDirective.STOP:
        this.stopChild(child);
        break;
      case SupervisionDirective.ESCALATE:
        throw error; // Escalate to parent
    }
  }

  private async restartChild(child: Actor): Promise<void> {
    await child.stop();
    const newChild = await this.createChildActor(child.constructor as any);
    this.children.set(child.id, newChild);
  }
}
```

#### All-For-One Strategy
Restarts all children when one fails.

```typescript
class AllForOneSupervisor extends Actor {
  private children: Map<string, Actor> = new Map();

  protected override onChildFailure(child: Actor, error: Error): void {
    const decision = this.strategy.decide(error, child);

    if (decision === SupervisionDirective.RESTART) {
      // Restart ALL children
      this.restartAllChildren();
    }
  }

  private async restartAllChildren(): Promise<void> {
    for (const child of this.children.values()) {
      await child.stop();
    }
    this.children.clear();
    await this.recreateChildren();
  }
}
```

### Message Ordering Guarantees

```typescript
// Per-sender FIFO ordering (Akka-style)
class FIFOMailbox implements Mailbox {
  private queues: Map<string, Message[]> = new Map();

  enqueue(message: Message, senderId: string): void {
    if (!this.queues.has(senderId)) {
      this.queues.set(senderId, []);
    }
    this.queues.get(senderId)!.push(message);
  }

  dequeue(): Message | null {
    // Round-robin across senders to prevent starvation
    for (const [senderId, queue] of this.queues) {
      if (queue.length > 0) {
        return queue.shift()!;
      }
    }
    return null;
  }
}

// Causal ordering (Pony-style)
class CausalMailbox implements Mailbox {
  private messages: Array<{msg: Message, vectorClock: VectorClock}> = [];

  enqueue(message: Message, vectorClock: VectorClock): void {
    this.messages.push({msg: message, vectorClock});
    this.messages.sort((a, b) =>
      this.compareVectorClocks(a.vectorClock, b.vectorClock)
    );
  }

  private compareVectorClocks(a: VectorClock, b: VectorClock): number {
    // Return -1 if a happened-before b, 1 if b happened-before a, 0 if concurrent
    // Implementation details omitted for brevity
  }
}
```

### Backpressure Handling

```typescript
// Bounded mailbox with rejection policy
class BoundedMailbox implements Mailbox {
  private queue: Message[] = [];

  constructor(
    private maxCapacity: number,
    private rejectionPolicy: RejectionPolicy = RejectionPolicy.DROP_OLDEST
  ) {}

  enqueue(message: Message): boolean {
    if (this.queue.length >= this.maxCapacity) {
      return this.handleOverflow(message);
    }
    this.queue.push(message);
    return true;
  }

  private handleOverflow(message: Message): boolean {
    switch (this.rejectionPolicy) {
      case RejectionPolicy.DROP_OLDEST:
        this.queue.shift();
        this.queue.push(message);
        return true;
      case RejectionPolicy.DROP_NEWEST:
        return false; // Reject incoming message
      case RejectionPolicy.FAIL:
        throw new MailboxOverflowError();
      case RejectionPolicy.BACKPRESSURE:
        // Signal sender to slow down
        return false;
    }
  }
}

enum RejectionPolicy {
  DROP_OLDEST,
  DROP_NEWEST,
  FAIL,
  BACKPRESSURE
}

// Reactive Streams-style backpressure
interface Subscription {
  request(n: number): void;
  cancel(): void;
}

interface Publisher<T> {
  subscribe(subscriber: Subscriber<T>): void;
}

interface Subscriber<T> {
  onSubscribe(subscription: Subscription): void;
  onNext(item: T): void;
  onError(error: Error): void;
  onComplete(): void;
}
```

### Production-Grade Features

#### 1. Actor Persistence

```typescript
interface EventSourcedActor extends Actor {
  // Event sourcing for actor state
  readonly persistenceId: string;

  receiveCommand(command: Command): Event[];
  receiveEvent(event: Event): void;

  // Snapshot for optimization
  snapshot(): ActorSnapshot;
  recoverFromSnapshot(snapshot: ActorSnapshot): void;
}

class BankAccountActor implements EventSourcedActor {
  private balance: number = 0;
  readonly persistenceId = 'bank-account-123';

  receiveCommand(command: Command): Event[] {
    if (command instanceof WithdrawCommand) {
      if (this.balance >= command.amount) {
        return [new MoneyWithdrawnEvent(command.amount)];
      }
      return [new WithdrawalRejectedEvent('Insufficient funds')];
    }
    return [];
  }

  receiveEvent(event: Event): void {
    if (event instanceof MoneyWithdrawnEvent) {
      this.balance -= event.amount;
    }
  }

  snapshot(): ActorSnapshot {
    return {balance: this.balance, version: this.version};
  }
}
```

#### 2. Cluster Sharding

```typescript
interface ShardRegion {
  // Distribute actors across cluster nodes
  extractShardId(message: Message): string;
  extractEntityId(message: Message): string;
}

class UserShardRegion implements ShardRegion {
  extractShardId(message: Message): string {
    // Hash user ID to shard (e.g., 0-99)
    const userId = message.payload.userId;
    return (hashCode(userId) % 100).toString();
  }

  extractEntityId(message: Message): string {
    return message.payload.userId;
  }
}

// Shard coordinator ensures even distribution
class ShardCoordinator {
  private shardAllocations: Map<string, string> = new Map(); // shard -> node

  allocateShard(shardId: string): string {
    // Use consistent hashing for shard allocation
    const node = this.selectNode(shardId);
    this.shardAllocations.set(shardId, node);
    return node;
  }

  private selectNode(shardId: string): string {
    // Least-loaded node selection
    // Implementation details omitted
  }
}
```

#### 3. Timers and Schedulers

```typescript
interface TimerScheduler {
  startSingleTimer(key: string, message: Message, delay: number): void;
  startPeriodicTimer(key: string, message: Message, interval: number): void;
  cancel(key: string): void;
  cancelAll(): void;
}

class ActorWithTimers extends Actor {
  private timers: TimerScheduler = new TimerSchedulerImpl(this);

  protected override onStart(): void {
    // Send reminder every hour
    this.timers.startPeriodicTimer(
      'hourly-reminder',
      new ReminderMessage(),
      60 * 60 * 1000
    );
  }

  protected override onStop(): void {
    this.timers.cancelAll();
  }
}
```

## 10. Observability in Distributed Systems

### OpenTelemetry Standards

OpenTelemetry provides a unified standard for collecting telemetry data (traces, metrics, logs).

#### Trace Context Propagation

```typescript
// W3C Trace Context format
interface TraceContext {
  traceId: string;      // 32 hex chars (128 bits)
  spanId: string;       // 16 hex chars (64 bits)
  traceFlags: number;   // 8 bits (sampled flag)
  traceState?: string;  // Vendor-specific data
}

// HTTP header format: traceparent: 00-{trace-id}-{span-id}-{flags}
const TRACEPARENT_REGEX = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

function parseTraceParent(header: string): TraceContext | null {
  const match = TRACEPARENT_REGEX.exec(header);
  if (!match) return null;

  return {
    traceId: match[1],
    spanId: match[2],
    traceFlags: parseInt(match[3], 16),
  };
}

function formatTraceParent(ctx: TraceContext): string {
  return `00-${ctx.traceId}-${ctx.spanId}-${ctx.traceFlags.toString(16).padStart(2, '0')}`;
}
```

#### Span Attributes

```typescript
interface Span {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;

  name: string;
  kind: SpanKind;
  startTime: number;
  endTime?: number;

  attributes: Record<string, AttributeValue>;
  events: SpanEvent[];
  status: SpanStatus;

  setAttribute(key: string, value: AttributeValue): void;
  addEvent(name: string, attributes?: Record<string, AttributeValue>): void;
  setStatus(status: SpanStatus): void;
  end(endTime?: number): void;
}

enum SpanKind {
  INTERNAL = 0,
  SERVER = 1,
  CLIENT = 2,
  PRODUCER = 3,
  CONSUMER = 4,
}

// Semantic conventions for HTTP
const HTTP_ATTRIBUTES = {
  METHOD: 'http.method',              // GET, POST, etc.
  URL: 'http.url',                    // Full URL
  TARGET: 'http.target',              // /path?query
  HOST: 'http.host',                  // example.com
  SCHEME: 'http.scheme',              // http, https
  STATUS_CODE: 'http.status_code',    // 200, 404, etc.
  USER_AGENT: 'http.user_agent',
  REQUEST_CONTENT_LENGTH: 'http.request_content_length',
  RESPONSE_CONTENT_LENGTH: 'http.response_content_length',
};

// Example usage
function instrumentHttpRequest(req: Request, span: Span): void {
  span.setAttribute(HTTP_ATTRIBUTES.METHOD, req.method);
  span.setAttribute(HTTP_ATTRIBUTES.URL, req.url);
  span.setAttribute(HTTP_ATTRIBUTES.USER_AGENT, req.headers['user-agent']);
  span.setStatus({code: SpanStatusCode.OK});
}
```

### Sampling Strategies

#### Probability-based Sampling

```typescript
interface Sampler {
  shouldSample(context: SamplingContext): SamplingResult;
}

// Sample X% of traces
class ProbabilitySampler implements Sampler {
  constructor(private probability: number) {
    if (probability < 0 || probability > 1) {
      throw new Error('Probability must be between 0 and 1');
    }
  }

  shouldSample(context: SamplingContext): SamplingResult {
    const random = Math.random();
    const decision = random < this.probability
      ? SamplingDecision.RECORD_AND_SAMPLE
      : SamplingDecision.DROP;

    return {decision, attributes: {}};
  }
}

// Always sample errors and slow requests
class AdaptiveSampler implements Sampler {
  constructor(
    private baseProbability: number = 0.01,  // 1% baseline
    private errorSamplingRate: number = 1.0,  // 100% errors
    private slowRequestThreshold: number = 1000, // 1 second
  ) {}

  shouldSample(context: SamplingContext): SamplingResult {
    // Always sample errors
    if (context.attributes['error'] === true) {
      return {
        decision: SamplingDecision.RECORD_AND_SAMPLE,
        attributes: {sampling_reason: 'error'},
      };
    }

    // Always sample slow requests
    const duration = context.attributes['duration'];
    if (typeof duration === 'number' && duration > this.slowRequestThreshold) {
      return {
        decision: SamplingDecision.RECORD_AND_SAMPLE,
        attributes: {sampling_reason: 'slow_request'},
      };
    }

    // Use base probability for others
    const random = Math.random();
    return {
      decision: random < this.baseProbability
        ? SamplingDecision.RECORD_AND_SAMPLE
        : SamplingDecision.DROP,
      attributes: {},
    };
  }
}
```

#### Head vs Tail Sampling

```typescript
// Head sampling: Decision made at trace start
class HeadSampler implements Sampler {
  shouldSample(context: SamplingContext): SamplingResult {
    // Decision based on trace ID (deterministic)
    const traceId = context.traceId;
    const threshold = this.probability * Number.MAX_SAFE_INTEGER;
    const traceIdNum = parseInt(traceId.substring(0, 16), 16);

    return {
      decision: traceIdNum < threshold
        ? SamplingDecision.RECORD_AND_SAMPLE
        : SamplingDecision.DROP,
      attributes: {},
    };
  }
}

// Tail sampling: Decision made after trace completes
class TailSampler {
  private traces: Map<string, TraceData> = new Map();
  private readonly traceTimeout = 60000; // 60 seconds

  recordSpan(span: Span): void {
    const traceId = span.traceId;

    if (!this.traces.has(traceId)) {
      this.traces.set(traceId, {
        spans: [],
        startTime: Date.now(),
        sampled: false,
      });
    }

    const trace = this.traces.get(traceId)!;
    trace.spans.push(span);

    // Check if trace is complete
    if (this.isTraceComplete(trace)) {
      this.evaluateTrace(traceId, trace);
    }
  }

  private evaluateTrace(traceId: string, trace: TraceData): void {
    let shouldSample = false;

    // Sample if any span has error
    if (trace.spans.some(s => s.status.code === SpanStatusCode.ERROR)) {
      shouldSample = true;
    }

    // Sample if total duration exceeds threshold
    const duration = this.calculateDuration(trace);
    if (duration > 5000) {
      shouldSample = true;
    }

    if (shouldSample) {
      this.exportTrace(trace);
    }

    this.traces.delete(traceId);
  }
}
```

### Correlation ID / Trace ID Propagation

```typescript
// Propagate trace context across service boundaries
class TraceContextPropagator {
  inject(context: TraceContext, carrier: Record<string, string>): void {
    carrier['traceparent'] = formatTraceParent(context);
    if (context.traceState) {
      carrier['tracestate'] = context.traceState;
    }
  }

  extract(carrier: Record<string, string>): TraceContext | null {
    const traceparent = carrier['traceparent'];
    if (!traceparent) return null;

    const context = parseTraceParent(traceparent);
    if (!context) return null;

    context.traceState = carrier['tracestate'];
    return context;
  }
}

// Actor message context
interface ActorMessage {
  payload: unknown;
  traceContext?: TraceContext;
}

// Automatic trace propagation for actors
class TracedActor extends Actor {
  private currentContext?: TraceContext;

  protected async receive(message: ActorMessage): Promise<void> {
    // Extract trace context from message
    this.currentContext = message.traceContext;

    // Create span for message processing
    const span = this.tracer.startSpan('actor.receive', {
      parent: this.currentContext,
      attributes: {
        'actor.id': this.id,
        'actor.type': this.constructor.name,
        'message.type': message.payload.constructor.name,
      },
    });

    try {
      await this.handleMessage(message.payload);
      span.setStatus({code: SpanStatusCode.OK});
    } catch (error) {
      span.recordException(error);
      span.setStatus({code: SpanStatusCode.ERROR});
      throw error;
    } finally {
      span.end();
    }
  }

  protected async send(target: Actor, payload: unknown): Promise<void> {
    // Propagate trace context to outgoing message
    const message: ActorMessage = {
      payload,
      traceContext: this.currentContext,
    };
    await super.send(target, message);
  }
}
```

### Prometheus Metrics Format

```typescript
// Prometheus metric types
enum MetricType {
  COUNTER = 'counter',       // Monotonically increasing value
  GAUGE = 'gauge',           // Value that can go up and down
  HISTOGRAM = 'histogram',   // Observations bucketed
  SUMMARY = 'summary',       // Observations with quantiles
}

interface Metric {
  name: string;
  type: MetricType;
  help: string;
  labels: Record<string, string>;
  value: number | HistogramValue;
}

// Counter: tracks total count of events
class Counter {
  private value: number = 0;

  constructor(
    private name: string,
    private help: string,
    private labels: Record<string, string> = {}
  ) {}

  inc(value: number = 1): void {
    this.value += value;
  }

  toPrometheusFormat(): string {
    const labelStr = this.formatLabels(this.labels);
    return `# HELP ${this.name} ${this.help}
# TYPE ${this.name} counter
${this.name}${labelStr} ${this.value}`;
  }

  private formatLabels(labels: Record<string, string>): string {
    const pairs = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return pairs ? `{${pairs}}` : '';
  }
}

// Histogram: observations in configurable buckets
class Histogram {
  private buckets: Map<number, number> = new Map();
  private sum: number = 0;
  private count: number = 0;

  constructor(
    private name: string,
    private help: string,
    private bucketBounds: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    private labels: Record<string, string> = {}
  ) {
    // Initialize buckets
    for (const bound of bucketBounds) {
      this.buckets.set(bound, 0);
    }
    this.buckets.set(Infinity, 0); // +Inf bucket
  }

  observe(value: number): void {
    this.sum += value;
    this.count++;

    // Increment appropriate buckets
    for (const [bound, count] of this.buckets) {
      if (value <= bound) {
        this.buckets.set(bound, count + 1);
      }
    }
  }

  toPrometheusFormat(): string {
    const labelStr = this.formatLabels(this.labels);
    let output = `# HELP ${this.name} ${this.help}\n`;
    output += `# TYPE ${this.name} histogram\n`;

    // Bucket lines
    for (const [bound, count] of this.buckets) {
      const le = bound === Infinity ? '+Inf' : bound.toString();
      const bucketLabels = {...this.labels, le};
      output += `${this.name}_bucket${this.formatLabels(bucketLabels)} ${count}\n`;
    }

    // Sum and count
    output += `${this.name}_sum${labelStr} ${this.sum}\n`;
    output += `${this.name}_count${labelStr} ${this.count}\n`;

    return output;
  }
}

// Example: HTTP request duration histogram
const httpDuration = new Histogram(
  'http_request_duration_seconds',
  'HTTP request duration in seconds',
  [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  {service: 'api-server'}
);

// Observe request
httpDuration.observe(0.123); // 123ms request
```

### Best Practices from Node.js Ecosystem

#### Structured Logging

```typescript
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
}

class StructuredLogger {
  log(level: LogLevel, message: string, context: Record<string, unknown> = {}): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      traceId: this.getCurrentTraceId(),
      spanId: this.getCurrentSpanId(),
    };

    // Output as JSON for machine parsing
    console.log(JSON.stringify(entry));
  }

  private getCurrentTraceId(): string | undefined {
    // Extract from async context
    return AsyncContext.get('traceId');
  }
}

// Usage
logger.log('info', 'User logged in', {
  userId: '123',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});
```

#### Metrics Collection Patterns

```typescript
class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();

  // Request rate
  incrementRequestCount(endpoint: string, method: string, status: number): void {
    const key = `http_requests_total{endpoint="${endpoint}",method="${method}",status="${status}"}`;
    const counter = this.getOrCreateCounter(key);
    counter.inc();
  }

  // Request duration
  observeRequestDuration(endpoint: string, duration: number): void {
    const key = `http_request_duration{endpoint="${endpoint}"}`;
    const histogram = this.getOrCreateHistogram(key);
    histogram.observe(duration);
  }

  // Active connections
  setActiveConnections(count: number): void {
    const key = 'http_active_connections';
    const gauge = this.getOrCreateGauge(key);
    gauge.set(count);
  }

  // Export in Prometheus format
  toPrometheusFormat(): string {
    return Array.from(this.metrics.values())
      .map(m => m.toPrometheusFormat())
      .join('\n\n');
  }
}
```

## 11. Resilience Patterns

### Circuit Breaker Implementation

The circuit breaker pattern prevents cascading failures by stopping requests to failing services.

```typescript
enum CircuitState {
  CLOSED,      // Normal operation
  OPEN,        // Failing, reject requests
  HALF_OPEN,   // Testing if service recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number;     // Failures before opening (default: 5)
  successThreshold: number;     // Successes to close from half-open (default: 2)
  timeout: number;              // Time in OPEN before trying HALF_OPEN (default: 60000ms)
  volumeThreshold: number;      // Minimum requests before evaluation (default: 10)
  errorThresholdPercentage: number; // Error % to open (default: 50)
  rollingWindowSize: number;    // Time window for stats (default: 10000ms)
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: number;
  private nextAttemptTime?: number;

  // Rolling window for statistics
  private requests: Array<{timestamp: number, success: boolean}> = [];

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
      } else {
        throw new CircuitBreakerOpenError('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.recordRequest(true);

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.reset();
      }
    }
  }

  private onFailure(): void {
    this.recordRequest(false);
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Immediately reopen on failure in half-open state
      this.trip();
      return;
    }

    // Check if we should trip the circuit
    if (this.shouldTrip()) {
      this.trip();
    }
  }

  private shouldTrip(): boolean {
    const recentRequests = this.getRecentRequests();

    // Need minimum volume
    if (recentRequests.length < this.config.volumeThreshold) {
      return false;
    }

    // Calculate error rate
    const failures = recentRequests.filter(r => !r.success).length;
    const errorRate = (failures / recentRequests.length) * 100;

    return errorRate >= this.config.errorThresholdPercentage;
  }

  private trip(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.timeout;
    this.onStateChange(CircuitState.OPEN);
  }

  private reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.requests = [];
    this.onStateChange(CircuitState.CLOSED);
  }

  private shouldAttemptReset(): boolean {
    return this.nextAttemptTime !== undefined && Date.now() >= this.nextAttemptTime;
  }

  private recordRequest(success: boolean): void {
    this.requests.push({timestamp: Date.now(), success});
    this.cleanOldRequests();
  }

  private getRecentRequests(): Array<{timestamp: number, success: boolean}> {
    this.cleanOldRequests();
    return this.requests;
  }

  private cleanOldRequests(): void {
    const cutoff = Date.now() - this.config.rollingWindowSize;
    this.requests = this.requests.filter(r => r.timestamp > cutoff);
  }

  private onStateChange(newState: CircuitState): void {
    // Emit event for monitoring
    this.emit('stateChange', {
      from: this.state,
      to: newState,
      timestamp: Date.now(),
    });
  }
}

// Usage example
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
  volumeThreshold: 10,
  errorThresholdPercentage: 50,
  rollingWindowSize: 10000,
});

async function callExternalService() {
  return await breaker.execute(async () => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  });
}
```

### Retry Strategies

#### Exponential Backoff with Jitter

```typescript
interface RetryConfig {
  maxAttempts: number;           // Maximum retry attempts (default: 3)
  initialDelay: number;          // Initial delay in ms (default: 100)
  maxDelay: number;              // Maximum delay in ms (default: 30000)
  multiplier: number;            // Backoff multiplier (default: 2)
  jitterFactor: number;          // Jitter randomization (default: 0.1)
  retryableErrors?: ErrorMatcher[]; // Which errors to retry
}

type ErrorMatcher = (error: Error) => boolean;

class RetryPolicy {
  constructor(private config: RetryConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < this.config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (!this.isRetryable(error as Error)) {
          throw error;
        }

        // Don't delay after last attempt
        if (attempt < this.config.maxAttempts - 1) {
          const delay = this.calculateDelay(attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  private calculateDelay(attempt: number): number {
    // Exponential backoff: initialDelay * (multiplier ^ attempt)
    let delay = this.config.initialDelay * Math.pow(this.config.multiplier, attempt);

    // Cap at maxDelay
    delay = Math.min(delay, this.config.maxDelay);

    // Add jitter: randomize ± jitterFactor
    const jitter = delay * this.config.jitterFactor * (Math.random() * 2 - 1);
    delay = delay + jitter;

    return Math.max(0, delay);
  }

  private isRetryable(error: Error): boolean {
    // If no matchers specified, retry all errors
    if (!this.config.retryableErrors || this.config.retryableErrors.length === 0) {
      return true;
    }

    // Check if any matcher matches
    return this.config.retryableErrors.some(matcher => matcher(error));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Retryable error matchers
const isNetworkError: ErrorMatcher = (error) => {
  return error.message.includes('ECONNREFUSED') ||
         error.message.includes('ETIMEDOUT') ||
         error.message.includes('ENOTFOUND');
};

const isServerError: ErrorMatcher = (error) => {
  return error instanceof HttpError && error.statusCode >= 500;
};

// Usage
const retry = new RetryPolicy({
  maxAttempts: 3,
  initialDelay: 100,
  maxDelay: 30000,
  multiplier: 2,
  jitterFactor: 0.1,
  retryableErrors: [isNetworkError, isServerError],
});

await retry.execute(() => fetch('https://api.example.com/data'));
```

#### Decorrelated Jitter (AWS recommended)

```typescript
class DecorrelatedJitterRetry {
  private previousDelay: number = 0;

  constructor(
    private baseDelay: number = 100,
    private maxDelay: number = 30000
  ) {}

  calculateNextDelay(): number {
    // AWS formula: random_between(base, previous_delay * 3)
    const upper = Math.min(this.maxDelay, this.previousDelay * 3);
    const delay = Math.random() * (upper - this.baseDelay) + this.baseDelay;

    this.previousDelay = delay;
    return delay;
  }
}
```

### Bulkhead Pattern

Isolate resources to prevent cascading failures.

```typescript
// Semaphore-based bulkhead
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(private maxPermits: number) {
    this.permits = maxPermits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    // Wait for permit
    return new Promise<void>(resolve => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    const next = this.waiting.shift();
    if (next) {
      next();
    } else {
      this.permits++;
    }
  }
}

class Bulkhead {
  private semaphore: Semaphore;
  private queue: number = 0;

  constructor(
    private maxConcurrent: number,
    private maxQueueSize: number = Infinity
  ) {
    this.semaphore = new Semaphore(maxConcurrent);
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check queue size
    if (this.queue >= this.maxQueueSize) {
      throw new BulkheadRejectError('Queue is full');
    }

    this.queue++;

    try {
      await this.semaphore.acquire();
      this.queue--;

      try {
        return await fn();
      } finally {
        this.semaphore.release();
      }
    } catch (error) {
      this.queue--;
      throw error;
    }
  }
}

// Thread pool bulkhead (actor-based)
class ActorBulkhead {
  private workers: Actor[] = [];
  private roundRobinIndex: number = 0;

  constructor(private poolSize: number, private WorkerClass: typeof Actor) {
    for (let i = 0; i < poolSize; i++) {
      this.workers.push(new WorkerClass(`worker-${i}`));
    }
  }

  async execute(message: Message): Promise<unknown> {
    // Round-robin distribution
    const worker = this.workers[this.roundRobinIndex];
    this.roundRobinIndex = (this.roundRobinIndex + 1) % this.workers.length;

    return await worker.ask(message);
  }
}
```

### Timeout Best Practices

```typescript
class TimeoutPolicy {
  async execute<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    fallback?: () => T
  ): Promise<T> {
    return Promise.race([
      fn(),
      this.createTimeout<T>(timeoutMs, fallback),
    ]);
  }

  private createTimeout<T>(ms: number, fallback?: () => T): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        if (fallback) {
          return fallback();
        }
        reject(new TimeoutError(`Operation timed out after ${ms}ms`));
      }, ms);
    });
  }
}

// Hierarchical timeouts
interface TimeoutConfig {
  connection: number;  // TCP connection timeout
  request: number;     // Individual request timeout
  total: number;       // Total operation timeout
}

class HierarchicalTimeout {
  async executeWithTimeouts<T>(
    fn: () => Promise<T>,
    config: TimeoutConfig
  ): Promise<T> {
    const startTime = Date.now();

    // Set total timeout
    const totalTimeout = setTimeout(() => {
      throw new TimeoutError('Total timeout exceeded');
    }, config.total);

    try {
      // Execute with request timeout
      const result = await this.withTimeout(fn(), config.request);
      return result;
    } finally {
      clearTimeout(totalTimeout);
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new TimeoutError(`Timeout after ${ms}ms`)), ms)
      ),
    ]);
  }
}
```

### Cascading Failure Prevention

```typescript
// Rate limiting to prevent overload
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number, // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  async consume(tokens: number = 1): Promise<boolean> {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// Adaptive concurrency limiting
class AdaptiveConcurrencyLimiter {
  private limit: number;
  private inFlight: number = 0;
  private minRTT: number = Infinity;
  private samples: number[] = [];

  constructor(
    private initialLimit: number = 10,
    private minLimit: number = 1,
    private maxLimit: number = 100
  ) {
    this.limit = initialLimit;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we're at limit
    if (this.inFlight >= this.limit) {
      throw new Error('Concurrency limit exceeded');
    }

    this.inFlight++;
    const startTime = Date.now();

    try {
      const result = await fn();
      const rtt = Date.now() - startTime;
      this.onSuccess(rtt);
      return result;
    } catch (error) {
      this.onError();
      throw error;
    } finally {
      this.inFlight--;
    }
  }

  private onSuccess(rtt: number): void {
    this.minRTT = Math.min(this.minRTT, rtt);
    this.samples.push(rtt);

    // Keep last 100 samples
    if (this.samples.length > 100) {
      this.samples.shift();
    }

    // Calculate gradient (RTT increasing or decreasing)
    if (this.samples.length >= 10) {
      const recentAvg = this.average(this.samples.slice(-10));
      const gradient = recentAvg / this.minRTT;

      // If gradient < 1.2, increase limit
      if (gradient < 1.2 && this.limit < this.maxLimit) {
        this.limit = Math.min(this.limit + 1, this.maxLimit);
      }
      // If gradient > 2, decrease limit
      else if (gradient > 2 && this.limit > this.minLimit) {
        this.limit = Math.max(Math.floor(this.limit * 0.9), this.minLimit);
      }
    }
  }

  private onError(): void {
    // Reduce limit on error
    this.limit = Math.max(Math.floor(this.limit * 0.5), this.minLimit);
  }

  private average(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
}
```

## 12. Web Performance Optimization

### HTTP Compression Algorithms

#### Comparison Table

| Algorithm | Compression Ratio | Speed | CPU Usage | Browser Support |
|-----------|------------------|-------|-----------|-----------------|
| Brotli    | 15-25% better    | Slower compress, fast decompress | Higher | Modern browsers |
| Gzip      | Baseline         | Fast both ways | Medium | Universal |
| Deflate   | Similar to gzip  | Fast | Medium | Universal |
| Zstandard | Better than gzip | Very fast | Configurable | Limited |

#### Implementation Comparison

```typescript
// Brotli compression (best ratio)
import { brotliCompress } from 'zlib';

async function compressBrotli(data: Buffer, quality: number = 11): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    brotliCompress(data, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: quality, // 0-11
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      }
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

// Gzip compression (good balance)
import { gzip } from 'zlib';

async function compressGzip(data: Buffer, level: number = 6): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    gzip(data, { level }, (error, result) => { // 0-9
      if (error) reject(error);
      else resolve(result);
    });
  });
}

// Real-world benchmark results (1MB JSON file)
// Brotli (q=11): 156KB, 245ms compression, 12ms decompression
// Brotli (q=4):  189KB, 45ms compression, 8ms decompression
// Gzip (level=9): 224KB, 78ms compression, 15ms decompression
// Gzip (level=6): 234KB, 32ms compression, 14ms decompression
```

### Content Negotiation

```typescript
// Parse Accept-Encoding header
function parseAcceptEncoding(header: string): string[] {
  return header
    .split(',')
    .map(enc => enc.trim().split(';')[0])
    .filter(Boolean);
}

// Select best encoding
function selectEncoding(acceptedEncodings: string[]): string | null {
  const priority = ['br', 'gzip', 'deflate', 'identity'];

  for (const encoding of priority) {
    if (acceptedEncodings.includes(encoding)) {
      return encoding;
    }
  }

  return null;
}

// Compression middleware
async function compressionMiddleware(
  req: Request,
  res: Response,
  next: Function
): Promise<void> {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const accepted = parseAcceptEncoding(acceptEncoding);
  const encoding = selectEncoding(accepted);

  if (!encoding || encoding === 'identity') {
    return next();
  }

  // Override res.write and res.end
  const originalWrite = res.write;
  const originalEnd = res.end;
  const chunks: Buffer[] = [];

  res.write = function(chunk: any): boolean {
    chunks.push(Buffer.from(chunk));
    return true;
  };

  res.end = async function(chunk: any): void {
    if (chunk) chunks.push(Buffer.from(chunk));

    const body = Buffer.concat(chunks);
    const compressed = await compress(body, encoding);

    res.setHeader('Content-Encoding', encoding);
    res.setHeader('Content-Length', compressed.length);
    res.setHeader('Vary', 'Accept-Encoding');

    originalWrite.call(res, compressed);
    originalEnd.call(res);
  };

  next();
}
```

### Caching Strategies

#### Cache-Control Headers

```typescript
interface CacheConfig {
  maxAge?: number;           // How long to cache (seconds)
  sMaxAge?: number;          // CDN/proxy cache duration
  staleWhileRevalidate?: number; // Serve stale while fetching fresh
  staleIfError?: number;     // Serve stale if origin fails
  public?: boolean;          // Cacheable by any cache
  private?: boolean;         // Only user's browser can cache
  noCache?: boolean;         // Revalidate before using
  noStore?: boolean;         // Don't cache at all
  mustRevalidate?: boolean;  // Must revalidate when stale
  immutable?: boolean;       // Content never changes
}

function buildCacheControl(config: CacheConfig): string {
  const directives: string[] = [];

  if (config.public) directives.push('public');
  if (config.private) directives.push('private');
  if (config.noCache) directives.push('no-cache');
  if (config.noStore) directives.push('no-store');
  if (config.mustRevalidate) directives.push('must-revalidate');
  if (config.immutable) directives.push('immutable');

  if (config.maxAge !== undefined) {
    directives.push(`max-age=${config.maxAge}`);
  }
  if (config.sMaxAge !== undefined) {
    directives.push(`s-maxage=${config.sMaxAge}`);
  }
  if (config.staleWhileRevalidate !== undefined) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }
  if (config.staleIfError !== undefined) {
    directives.push(`stale-if-error=${config.staleIfError}`);
  }

  return directives.join(', ');
}

// Examples
const STATIC_ASSETS = buildCacheControl({
  public: true,
  maxAge: 31536000,  // 1 year
  immutable: true,
});
// Output: "public, max-age=31536000, immutable"

const API_RESPONSE = buildCacheControl({
  private: true,
  maxAge: 300,       // 5 minutes
  staleWhileRevalidate: 60,
});
// Output: "private, max-age=300, stale-while-revalidate=60"

const DYNAMIC_CONTENT = buildCacheControl({
  public: true,
  maxAge: 0,
  sMaxAge: 60,       // CDN caches for 1 minute
  mustRevalidate: true,
});
// Output: "public, max-age=0, s-maxage=60, must-revalidate"
```

#### ETag Generation

```typescript
import { createHash } from 'crypto';

// Strong ETag (content-based)
function generateStrongETag(content: Buffer | string): string {
  const hash = createHash('md5').update(content).digest('hex');
  return `"${hash}"`;
}

// Weak ETag (semantically equivalent)
function generateWeakETag(lastModified: Date, size: number): string {
  const timestamp = lastModified.getTime().toString(16);
  const sizeHex = size.toString(16);
  return `W/"${timestamp}-${sizeHex}"`;
}

// Conditional request handling
function handleConditionalRequest(
  req: Request,
  res: Response,
  etag: string,
  lastModified: Date
): boolean {
  const ifNoneMatch = req.headers['if-none-match'];
  const ifModifiedSince = req.headers['if-modified-since'];

  // Check ETag
  if (ifNoneMatch) {
    const tags = ifNoneMatch.split(',').map(t => t.trim());
    if (tags.includes(etag) || tags.includes('*')) {
      res.statusCode = 304;
      res.setHeader('ETag', etag);
      res.end();
      return true;
    }
  }

  // Check Last-Modified
  if (ifModifiedSince) {
    const since = new Date(ifModifiedSince);
    if (lastModified <= since) {
      res.statusCode = 304;
      res.setHeader('Last-Modified', lastModified.toUTCString());
      res.end();
      return true;
    }
  }

  return false;
}
```

### When to Compress vs When Not To

```typescript
// Decision matrix for compression
function shouldCompress(
  contentType: string,
  contentLength: number,
  encoding?: string
): boolean {
  // Already compressed formats - don't compress again
  const precompressed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/', 'audio/',
    'application/zip', 'application/gzip', 'application/x-rar',
    'application/pdf',
  ];

  if (precompressed.some(type => contentType.startsWith(type))) {
    return false;
  }

  // Too small - overhead not worth it (< 1KB)
  if (contentLength < 1024) {
    return false;
  }

  // Compressible text formats
  const compressible = [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/x-www-form-urlencoded',
    'image/svg+xml',
  ];

  return compressible.some(type => contentType.startsWith(type));
}

// Adaptive compression level based on size
function selectCompressionLevel(size: number, encoding: string): number {
  if (encoding === 'br') {
    // Brotli: 0-11
    if (size < 10 * 1024) return 4;        // < 10KB: fast
    if (size < 100 * 1024) return 6;       // < 100KB: balanced
    if (size < 1024 * 1024) return 8;      // < 1MB: good
    return 11;                             // > 1MB: best
  }

  if (encoding === 'gzip') {
    // Gzip: 0-9
    if (size < 10 * 1024) return 3;        // < 10KB: fast
    if (size < 100 * 1024) return 6;       // < 100KB: balanced
    return 9;                              // > 100KB: best
  }

  return 6; // Default
}
```

### Real-world Benchmarks

```typescript
// Benchmark results for common scenarios
const COMPRESSION_BENCHMARKS = {
  // 1MB JSON API response
  json_1mb: {
    original: 1048576,
    brotli_11: { size: 156234, time: 245, ratio: 0.149 },
    brotli_4: { size: 189654, time: 45, ratio: 0.181 },
    gzip_9: { size: 224456, time: 78, ratio: 0.214 },
    gzip_6: { size: 234567, time: 32, ratio: 0.224 },
  },

  // 100KB HTML page
  html_100kb: {
    original: 102400,
    brotli_11: { size: 18234, time: 28, ratio: 0.178 },
    brotli_4: { size: 21456, time: 8, ratio: 0.210 },
    gzip_9: { size: 24567, time: 12, ratio: 0.240 },
    gzip_6: { size: 25678, time: 5, ratio: 0.251 },
  },

  // 500KB JavaScript bundle
  js_500kb: {
    original: 512000,
    brotli_11: { size: 82345, time: 128, ratio: 0.161 },
    brotli_4: { size: 96234, time: 24, ratio: 0.188 },
    gzip_9: { size: 112345, time: 42, ratio: 0.219 },
    gzip_6: { size: 118234, time: 18, ratio: 0.231 },
  },
};

// Recommendations based on benchmarks
/*
1. Static assets (CSS/JS): Use Brotli-11, pre-compress at build time
2. API responses: Use Brotli-4 or Gzip-6 for dynamic compression
3. HTML pages: Use Brotli-4 with stale-while-revalidate caching
4. Large files (>1MB): Stream compression to avoid memory issues
5. Small files (<1KB): Don't compress, overhead not worth it
*/
```

## 13. Zero-Dependency JavaScript Patterns

### Hand-written Parsers

#### JSON Parser (Zero-dependency)

```typescript
class JSONParser {
  private pos: number = 0;
  private input: string = '';

  parse(json: string): unknown {
    this.input = json;
    this.pos = 0;
    return this.parseValue();
  }

  private parseValue(): unknown {
    this.skipWhitespace();
    const char = this.peek();

    if (char === '"') return this.parseString();
    if (char === '{') return this.parseObject();
    if (char === '[') return this.parseArray();
    if (char === 't' || char === 'f') return this.parseBoolean();
    if (char === 'n') return this.parseNull();
    if (char === '-' || (char >= '0' && char <= '9')) return this.parseNumber();

    throw new Error(`Unexpected character: ${char} at position ${this.pos}`);
  }

  private parseString(): string {
    this.expect('"');
    let result = '';

    while (this.peek() !== '"') {
      if (this.peek() === '\\') {
        this.advance();
        const escaped = this.advance();
        switch (escaped) {
          case '"': result += '"'; break;
          case '\\': result += '\\'; break;
          case '/': result += '/'; break;
          case 'b': result += '\b'; break;
          case 'f': result += '\f'; break;
          case 'n': result += '\n'; break;
          case 'r': result += '\r'; break;
          case 't': result += '\t'; break;
          case 'u':
            const hex = this.input.substr(this.pos, 4);
            this.pos += 4;
            result += String.fromCharCode(parseInt(hex, 16));
            break;
          default:
            throw new Error(`Invalid escape sequence: \\${escaped}`);
        }
      } else {
        result += this.advance();
      }
    }

    this.expect('"');
    return result;
  }

  private parseNumber(): number {
    const start = this.pos;

    if (this.peek() === '-') this.advance();

    if (this.peek() === '0') {
      this.advance();
    } else {
      while (this.isDigit(this.peek())) this.advance();
    }

    if (this.peek() === '.') {
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }

    if (this.peek() === 'e' || this.peek() === 'E') {
      this.advance();
      if (this.peek() === '+' || this.peek() === '-') this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }

    const numStr = this.input.substring(start, this.pos);
    return parseFloat(numStr);
  }

  private parseObject(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    this.expect('{');
    this.skipWhitespace();

    while (this.peek() !== '}') {
      const key = this.parseString();
      this.skipWhitespace();
      this.expect(':');
      this.skipWhitespace();
      const value = this.parseValue();
      obj[key] = value;

      this.skipWhitespace();
      if (this.peek() === ',') {
        this.advance();
        this.skipWhitespace();
      }
    }

    this.expect('}');
    return obj;
  }

  private parseArray(): unknown[] {
    const arr: unknown[] = [];
    this.expect('[');
    this.skipWhitespace();

    while (this.peek() !== ']') {
      arr.push(this.parseValue());
      this.skipWhitespace();
      if (this.peek() === ',') {
        this.advance();
        this.skipWhitespace();
      }
    }

    this.expect(']');
    return arr;
  }

  private parseBoolean(): boolean {
    if (this.input.substr(this.pos, 4) === 'true') {
      this.pos += 4;
      return true;
    }
    if (this.input.substr(this.pos, 5) === 'false') {
      this.pos += 5;
      return false;
    }
    throw new Error('Invalid boolean');
  }

  private parseNull(): null {
    if (this.input.substr(this.pos, 4) === 'null') {
      this.pos += 4;
      return null;
    }
    throw new Error('Invalid null');
  }

  private peek(): string {
    return this.input[this.pos] || '';
  }

  private advance(): string {
    return this.input[this.pos++] || '';
  }

  private expect(char: string): void {
    if (this.peek() !== char) {
      throw new Error(`Expected '${char}' but got '${this.peek()}'`);
    }
    this.advance();
  }

  private skipWhitespace(): void {
    while (' \t\n\r'.includes(this.peek())) {
      this.advance();
    }
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }
}
```

#### URL Parser

```typescript
interface ParsedURL {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  username: string;
  password: string;
}

function parseURL(url: string): ParsedURL {
  const result: ParsedURL = {
    protocol: '',
    hostname: '',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    username: '',
    password: '',
  };

  let remaining = url;

  // Extract protocol
  const protocolMatch = remaining.match(/^([a-z][a-z0-9+.-]*):\/\//i);
  if (protocolMatch) {
    result.protocol = protocolMatch[1].toLowerCase();
    remaining = remaining.slice(protocolMatch[0].length);
  }

  // Extract hash
  const hashIndex = remaining.indexOf('#');
  if (hashIndex !== -1) {
    result.hash = remaining.slice(hashIndex + 1);
    remaining = remaining.slice(0, hashIndex);
  }

  // Extract search
  const searchIndex = remaining.indexOf('?');
  if (searchIndex !== -1) {
    result.search = remaining.slice(searchIndex + 1);
    remaining = remaining.slice(0, searchIndex);
  }

  // Extract auth and hostname
  const pathIndex = remaining.indexOf('/');
  let authority = pathIndex === -1 ? remaining : remaining.slice(0, pathIndex);
  result.pathname = pathIndex === -1 ? '/' : remaining.slice(pathIndex);

  // Extract username and password
  const atIndex = authority.indexOf('@');
  if (atIndex !== -1) {
    const auth = authority.slice(0, atIndex);
    authority = authority.slice(atIndex + 1);

    const colonIndex = auth.indexOf(':');
    if (colonIndex !== -1) {
      result.username = auth.slice(0, colonIndex);
      result.password = auth.slice(colonIndex + 1);
    } else {
      result.username = auth;
    }
  }

  // Extract port
  const portMatch = authority.match(/:(\d+)$/);
  if (portMatch) {
    result.port = portMatch[1];
    result.hostname = authority.slice(0, portMatch.index);
  } else {
    result.hostname = authority;
  }

  return result;
}
```

### Validators

```typescript
// Email validator (RFC 5322 simplified)
function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return pattern.test(email);
}

// UUID validator
function isValidUUID(uuid: string): boolean {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return pattern.test(uuid);
}

// JSON validator
function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

// Schema validator
type Schema = {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    items?: Schema;
    properties?: Schema;
  };
};

function validateSchema(data: unknown, schema: Schema): {valid: boolean, errors: string[]} {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return {valid: false, errors: ['Data must be an object']};
  }

  const obj = data as Record<string, unknown>;

  for (const [key, rules] of Object.entries(schema)) {
    const value = obj[key];

    // Required check
    if (rules.required && value === undefined) {
      errors.push(`Missing required field: ${key}`);
      continue;
    }

    if (value === undefined) continue;

    // Type check
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== rules.type) {
      errors.push(`Field ${key}: expected ${rules.type}, got ${actualType}`);
      continue;
    }

    // String validations
    if (rules.type === 'string' && typeof value === 'string') {
      if (rules.min !== undefined && value.length < rules.min) {
        errors.push(`Field ${key}: minimum length is ${rules.min}`);
      }
      if (rules.max !== undefined && value.length > rules.max) {
        errors.push(`Field ${key}: maximum length is ${rules.max}`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`Field ${key}: does not match pattern`);
      }
    }

    // Number validations
    if (rules.type === 'number' && typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`Field ${key}: minimum value is ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`Field ${key}: maximum value is ${rules.max}`);
      }
    }
  }

  return {valid: errors.length === 0, errors};
}
```

### Polyfill Techniques

```typescript
// Promise.allSettled polyfill
if (!Promise.allSettled) {
  Promise.allSettled = function<T>(promises: Promise<T>[]): Promise<Array<
    {status: 'fulfilled', value: T} | {status: 'rejected', reason: any}
  >> {
    return Promise.all(
      promises.map(promise =>
        promise
          .then(value => ({status: 'fulfilled' as const, value}))
          .catch(reason => ({status: 'rejected' as const, reason}))
      )
    );
  };
}

// Array.prototype.at polyfill
if (!Array.prototype.at) {
  Array.prototype.at = function<T>(this: T[], index: number): T | undefined {
    const len = this.length;
    const relativeIndex = index >= 0 ? index : len + index;
    if (relativeIndex < 0 || relativeIndex >= len) return undefined;
    return this[relativeIndex];
  };
}

// Object.fromEntries polyfill
if (!Object.fromEntries) {
  Object.fromEntries = function<T>(entries: Iterable<[string, T]>): Record<string, T> {
    const obj: Record<string, T> = {};
    for (const [key, value] of entries) {
      obj[key] = value;
    }
    return obj;
  };
}

// String.prototype.replaceAll polyfill
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(
    search: string | RegExp,
    replacement: string | ((match: string) => string)
  ): string {
    if (search instanceof RegExp) {
      if (!search.global) {
        throw new TypeError('replaceAll requires global RegExp');
      }
      return this.replace(search, replacement as string);
    }

    return this.split(search).join(
      typeof replacement === 'function' ? replacement(search) : replacement
    );
  };
}
```

### When Zero-Dependency Makes Sense

```typescript
/*
MAKES SENSE:
1. Core functionality used everywhere (utilities, parsers)
2. Simple algorithms with clear implementations
3. Security-critical code (less attack surface)
4. Performance-critical paths
5. Long-term stability requirements

Examples:
- UUID generation
- Base64 encoding/decoding
- Simple cryptographic operations
- Data validation
- URL parsing
- Event emitters

DOESN'T MAKE SENSE:
1. Complex algorithms with edge cases
2. Standards-compliant implementations (e.g., full HTTP/2)
3. Platform-specific optimizations
4. Well-tested, stable libraries
5. Rapidly evolving standards

Examples:
- Full JSON Schema validation (use ajv)
- WebSocket protocol (use ws)
- JWT with all algorithms (use jsonwebtoken)
- Markdown parsing (use marked)
- Date manipulation (use date-fns for complex cases)
*/

// Trade-offs matrix
interface DependencyDecision {
  feature: string;
  complexity: 'low' | 'medium' | 'high';
  changeFrequency: 'low' | 'medium' | 'high';
  securityImpact: 'low' | 'medium' | 'high';
  decision: 'implement' | 'library' | 'optional';
  reasoning: string;
}

const DECISIONS: DependencyDecision[] = [
  {
    feature: 'UUID v4 generation',
    complexity: 'low',
    changeFrequency: 'low',
    securityImpact: 'low',
    decision: 'implement',
    reasoning: 'Simple algorithm, stable spec, no security concerns',
  },
  {
    feature: 'JWT signing/verification',
    complexity: 'medium',
    changeFrequency: 'low',
    securityImpact: 'high',
    decision: 'library',
    reasoning: 'Security-critical, multiple algorithms, well-tested libraries exist',
  },
  {
    feature: 'HTTP request parsing',
    complexity: 'high',
    changeFrequency: 'medium',
    securityImpact: 'high',
    decision: 'library',
    reasoning: 'Complex spec, security implications, Node.js provides good support',
  },
  {
    feature: 'Event emitter',
    complexity: 'low',
    changeFrequency: 'low',
    securityImpact: 'low',
    decision: 'implement',
    reasoning: 'Simple pattern, core to framework, easy to implement correctly',
  },
  {
    feature: 'Compression (brotli/gzip)',
    complexity: 'high',
    changeFrequency: 'low',
    securityImpact: 'medium',
    decision: 'library',
    reasoning: 'Complex algorithms, platform optimizations, use native zlib',
  },
];
```

## Conclusion

This research provides a comprehensive overview of advanced web technologies and API paradigms, offering a rich source of potential functionalities for the Cortex Framework. By carefully selecting and implementing these features with a focus on zero dependency, TDD, and clean code, Cortex can position itself as a state-of-the-art framework that meets the evolving demands of web developers.
