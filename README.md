# Cortex Framework

**The complete framework for building modern web applications with Actor-based architecture**

> Zero external dependencies · Enterprise-grade patterns · Type-safe · Production-ready

## 🚀 Quick Start

### Installation

```bash
npm install cortex
```

**Requirements:** Node.js 18.0.0 or higher

### Basic Example

```typescript
import { EventBus, ActorSystem, CortexHttpServer } from 'cortex';

// Create core components
const eventBus = EventBus.getInstance();
const actorSystem = new ActorSystem(eventBus);
const server = new CortexHttpServer(eventBus, undefined, 3000);

// Create a simple actor
class PingActor {
  async receive(message: any) {
    console.log('Ping actor received:', message);
    return { response: 'pong' };
  }
}

// Register and dispatch
await actorSystem.createActor(PingActor, 'ping-actor');
await actorSystem.dispatch('ping-actor', { type: 'ping' });

// Start server
await server.listen();
```

### 📚 Documentation

- **[Full Documentation](https://cortex-web-framework.github.io/cortex/)** - Complete guide and API reference
- **[Getting Started Guide](https://cortex-web-framework.github.io/cortex/#getting-started)** - Step-by-step tutorial
- **[API Reference](https://cortex-web-framework.github.io/cortex/#api)** - Detailed API documentation
- **[Examples](https://github.com/cortex-web-framework/cortex/tree/main/examples)** - Working code examples

### 🎯 Key Features

### Core Architecture
*   **Actor System:** Robust actor model for managing concurrent message-driven processes
*   **Event Bus:** Central pub-sub messaging hub for event-driven communication
*   **HTTP Server:** Built-in HTTP/REST server with middleware support
*   **Configuration Management:** Centralized config system with environment support
*   **Logger:** Structured logging with multiple output levels

### Observability Stack
*   **Distributed Tracing:** OpenTelemetry-compatible trace generation and collection
*   **Metrics Collection:** Prometheus-compatible metrics (counters, gauges, histograms)
*   **Health Checks:** Registry with memory, uptime, CPU, and app-level health checks

### Resilience Patterns
*   **Circuit Breaker:** Prevent cascading failures with intelligent request handling
*   **Retry Executor:** Configurable retry logic with exponential backoff and jitter
*   **Bulkhead Pattern:** Isolate resources and limit concurrent operations
*   **Composite Policy:** Combine multiple resilience patterns seamlessly

### Performance Optimization
*   **HTTP Compression:** Support for Brotli, Gzip, and Deflate compression
*   **HTTP Caching:** Client and server-side caching strategies
*   **Response Streaming:** Efficient data transfer for large payloads

### Security Features
*   **Content Security Policy (CSP):** Builder for setting CSP headers
*   **Rate Limiting:** Request throttling with sliding window algorithm
*   **Request Validation:** Input sanitization and validation middleware

### Advanced Technologies
*   **Web3 Integration:** Smart contract interaction and IPFS client support
*   **WebAssembly Support:** Memory management and WASM module utilities
*   **Web Workers:** Actor-based worker pool for concurrent processing
*   **GraphQL API:** Zero-dependency GraphQL stub for extensibility
*   **gRPC Support:** gRPC server/client implementations

### CLI & Project Tools
*   **Project Generator:** Scaffold new Cortex projects with templates
*   **Interactive Wizard:** Terminal-based configuration and setup
*   **Command Framework:** Build custom CLI commands easily
*   **Development Server:** Live reload and file watching
*   **Build System:** Production-ready builds with TypeScript support
*   **Test Runner:** Integrated testing with multiple framework support
*   **Code Generators:** Scaffold actors, services, and routes

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cortex Framework                         │
├─────────────────────────────────────────────────────────────┤
│  Core Layer                                                 │
│  ├─ EventBus (Singleton pub-sub)                          │
│  ├─ ActorSystem (Actor lifecycle management)              │
│  ├─ CortexHttpServer (HTTP/REST interface)                │
│  ├─ Logger (Structured logging)                           │
│  └─ Config (Configuration management)                     │
├─────────────────────────────────────────────────────────────┤
│  Feature Modules                                            │
│  ├─ Observability (Tracing, Metrics, Health)              │
│  ├─ Resilience (Circuit Breaker, Retry, Bulkhead)         │
│  ├─ Performance (Compression, Caching)                    │
│  ├─ Security (CSP, Rate Limiting)                         │
│  ├─ Workers (WorkerPool, WorkerActor)                     │
│  └─ Web3 (Smart Contracts, IPFS)                          │
├─────────────────────────────────────────────────────────────┤
│  API & Integration                                          │
│  ├─ GraphQL (Zero-dependency stub)                        │
│  ├─ gRPC (Server/Client implementations)                  │
│  ├─ CLI (Project generation, commands)                    │
│  └─ WASM (Memory manager, utilities)                      │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

*   **`EventBus` (`src/core/eventBus.ts`):** Singleton pub-sub system providing central event-driven communication. Components subscribe to topics and publish typed messages.
*   **`ActorSystem` (`src/core/actorSystem.ts`):** Manages actor lifecycle, message routing, and dispatch. Actors process messages asynchronously via mailboxes.
*   **`CortexHttpServer` (`src/core/httpServer.ts`):** HTTP server with middleware support and route handling for triggering actor workflows.
*   **`Logger` (`src/core/logger.ts`):** Structured logging with multiple levels and output handlers.
*   **`Config` (`src/core/config.ts`):** Environment-aware configuration management with type safety.

### Module Structure

*   **`src/observability/`:** Distributed tracing, metrics collection, and health checks
*   **`src/resilience/`:** Circuit breaker, retry logic, bulkhead, and composite policies
*   **`src/performance/`:** Compression middleware, HTTP caching strategies
*   **`src/security/`:** CSP builder, rate limiting middleware
*   **`src/workers/`:** Web worker integration with actor model
*   **`src/web3/`:** Smart contract client, IPFS integration
*   **`src/wasm/`:** WebAssembly memory management and utilities
*   **`src/api/`:** GraphQL and gRPC implementations
*   **`src/cli/`:** Project generation and CLI framework
*   **`src/neurons/`:** Example actors (PingNeuron, PongNeuron)

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm (Node Package Manager)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/cortex.git
    cd cortex
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the project:**
    ```bash
    npm run build
    ```

### Running the Framework

To start the HTTP server and the integrated neuron system, run:

```bash
npm start
```

The server will listen on `http://localhost:3000`. You can then access the `/ping` endpoint:

```bash
curl http://localhost:3000/ping
```

## 🖥️ CLI Commands

Cortex provides a comprehensive command-line interface for project management and development.

### Installation

Install Cortex globally to use the CLI:

```bash
npm install -g cortex
```

Or use npx to run without installation:

```bash
npx cortex --version
```

### Available Commands

#### `cortex create <name> [options]`

Create a new Cortex project with interactive setup or batch mode.

**Options:**
- `--typescript` - Enable TypeScript (default: true)
- `--testing <framework>` - Testing framework: vitest, jest, none (default: vitest)
- `--port <number>` - Development server port (default: 3000)
- `--redis` - Include Redis integration
- `--postgres` - Include PostgreSQL integration
- `--websocket` - Enable WebSocket support
- `--auth` - Include authentication system
- `--deploy <platform>` - Deployment platform: vercel, aws, docker, kubernetes, none
- `--yes` - Skip prompts and use defaults
- `--skip-git` - Skip Git initialization
- `--skip-install` - Skip npm install

**Examples:**
```bash
# Interactive mode with prompts
cortex create my-app

# Batch mode with specific options
cortex create my-app --typescript --testing vitest --redis --postgres

# Quick start with defaults
cortex create my-app --yes
```

#### `cortex serve [options]`

Start a development server with hot reload and file watching.

**Options:**
- `-p, --port <number>` - Port to listen on (default: 3000)
- `-h, --host <string>` - Host to bind to (default: localhost)
- `-w, --watch` - Enable file watching (default: true)
- `-o, --open` - Open browser automatically (default: false)

**Examples:**
```bash
# Start dev server on default port
cortex serve

# Start on custom port with browser open
cortex serve --port 8080 --open

# Disable file watching
cortex serve --watch false
```

#### `cortex build [options]`

Build the project for production with optimizations.

**Options:**
- `-m, --minify` - Minify output (default: true)
- `-s, --sourcemap` - Generate source maps (default: true)
- `-c, --clean` - Clean output directory before build (default: true)
- `-w, --watch` - Watch for changes and rebuild (default: false)

**Examples:**
```bash
# Production build
cortex build

# Build with watch mode
cortex build --watch

# Build without minification
cortex build --minify false
```

#### `cortex test [options]`

Run the test suite with coverage and watch options.

**Options:**
- `-w, --watch` - Watch for changes and re-run tests (default: false)
- `-c, --coverage` - Generate coverage report (default: false)
- `-v, --verbose` - Verbose output (default: false)
- `-f, --filter <pattern>` - Filter tests by pattern

**Examples:**
```bash
# Run all tests
cortex test

# Run tests with coverage
cortex test --coverage

# Watch mode with verbose output
cortex test --watch --verbose

# Run specific tests
cortex test --filter "ActorSystem"
```

#### `cortex generate <type> <name>`

Generate new components with boilerplate code and tests.

**Types:**
- `actor` - Create a new actor with message handling
- `service` - Create a new service class
- `route` - Create API route handlers

**Examples:**
```bash
# Generate an actor
cortex generate actor UserActor

# Generate a service
cortex generate service EmailService

# Generate API routes
cortex generate route /api/users
```

#### `cortex info [options]`

Display project information, dependencies, and configuration.

**Options:**
- `-d, --detailed` - Show detailed information (default: false)

**Examples:**
```bash
# Show project info
cortex info

# Show detailed info with all dependencies
cortex info --detailed
```

#### `cortex version`

Display version information for Cortex CLI and Node.js.

```bash
cortex version
```

### Global Options

- `--help, -h` - Show help for any command
- `--version, -v` - Show CLI version

**Examples:**
```bash
# Show general help
cortex --help

# Show command-specific help
cortex create --help
cortex serve --help
```

## Example Usage

#### Creating an Actor

```typescript
import { ActorSystem, EventBus } from 'cortex';

const eventBus = EventBus.getInstance();
const actorSystem = new ActorSystem(eventBus);

class MyActor extends Actor {
  async receive(message: any): Promise<void> {
    console.log('Received:', message);
  }
}

actorSystem.createActor(MyActor, 'myActor', eventBus);
await actorSystem.dispatch('myActor', { type: 'greeting', text: 'Hello!' });
```

#### Using Observability

```typescript
import { ObservabilityFactory } from 'cortex';

const tracer = ObservabilityFactory.createTracer('my-service', 0.1);
const span = tracer.startSpan('important-operation');
// ... do work ...
span.end();
```

#### Applying Resilience Patterns

```typescript
import { CircuitBreaker, RetryExecutor } from 'cortex';

const circuitBreaker = new CircuitBreaker({ failureThreshold: 5 });
const retryExecutor = new RetryExecutor({ maxAttempts: 3 });

await circuitBreaker.execute(async () => {
  // Protected operation
  return await someRiskyOperation();
});
```

### Testing

To run all unit and integration tests, use:

```bash
npm test
```

This will execute comprehensive tests for all modules including:
- Event Bus and Actor System
- HTTP Server and routing
- Observability stack (tracing, metrics, health)
- Resilience patterns (circuit breaker, retry, bulkhead)
- Performance optimizations (compression, caching)
- Security features (CSP, rate limiting)
- Advanced integrations (Web3, WebAssembly, Workers)

## Design Principles

The Cortex Framework is built on several core principles:

1. **Actor Model:** Processes are isolated, concurrent entities that communicate via asynchronous messages
2. **Event-Driven:** Components communicate through a central event bus for loose coupling
3. **Reactive:** Non-blocking, asynchronous processing with proper error handling
4. **Type-Safe:** Strict TypeScript enforcement with no implicit `any` types
5. **Zero-Dependency Core:** Core framework has no external dependencies
6. **Modular:** Features are organized into independently usable modules
7. **Production-Ready:** Includes observability, resilience, and security patterns out-of-the-box

## Best Practices

### When Building with Cortex

1. **Use Actors for Concurrent Work:** Leverage the actor model for handling multiple operations safely
2. **Monitor with Observability:** Always instrument your actors with tracing and metrics
3. **Apply Resilience Patterns:** Wrap external calls with circuit breakers and retry logic
4. **Secure Your APIs:** Use rate limiting and CSP headers for production deployments
5. **Test Integration Paths:** Use the integration test suite as a reference for multi-module interactions
6. **Handle Backpressure:** Use the bulkhead pattern to control resource consumption

## Documentation

Comprehensive documentation is available in:
- **`ARCHITECTURE_DIAGRAM.md`** - Visual framework architecture
- **`IMPLEMENTATION_SPEC.md`** - Detailed implementation guide
- **`RESEARCH_SUMMARY.md`** - Design decisions and best practices
- **`QUICK_REFERENCE.md`** - Code examples and API reference

## Contributing

We welcome contributions to the Cortex Framework! Please refer to the `CONTRIBUTING.md` file for guidelines on how to contribute, including information on our GitFlow workflow, TDD practices, and coding standards.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

**Built with ❤️ using strict TypeScript and modern JavaScript**
