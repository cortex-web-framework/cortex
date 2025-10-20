# Cortex Framework

## Overview

The Cortex Framework is a lightweight, modular, and extensible framework designed for building reactive and distributed systems using an Actor-like model. It leverages an Event Bus for inter-component communication and provides a simple HTTP server for external interactions.

## Features

*   **Actor System:** A robust system for managing and dispatching messages to actors.
*   **Event Bus:** A central messaging hub for publishing and subscribing to events.
*   **HTTP Server:** A basic HTTP server for handling incoming requests and triggering actor-based workflows.
*   **Modular Design:** Easily extendable with new neurons (actors) and integrations.

## Architecture

The framework is composed of the following core components:

*   **`EventBus` (`src/core/eventBus.ts`):** Implements the Singleton pattern, providing a central point for event-driven communication. Actors and other components can subscribe to specific topics and publish messages.
*   **`ActorSystem` (`src/core/actorSystem.ts`):** Manages the lifecycle of actors. It allows for the creation, registration, and dispatching of messages to individual actors. Actors process messages asynchronously via their mailboxes.
*   **`CortexHttpServer` (`src/core/httpServer.ts`):** A simple HTTP server built on Node.js's `http` module. It handles incoming HTTP requests and can be configured with routes that trigger actions within the Actor System.
*   **`Actor` (`src/core/actorSystem.ts`):** An abstract base class for all actors in the system. Actors have an `id`, a `mailbox`, and a `receive` method to process messages.
*   **Neurons (`src/neurons/`):** Concrete implementations of the `Actor` class that encapsulate specific business logic or interactions. Examples include `PingNeuron` and `PongNeuron` which demonstrate inter-neuron communication via the `EventBus`.

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

### Running the Framework

To start the HTTP server and the integrated neuron system, run:

```bash
npm start
```

The server will listen on `http://localhost:3000`. You can then access the `/ping` endpoint:

```bash
curl http://localhost:3000/ping
```

This will dispatch a 'start' message to the `PingNeuron`, which in turn publishes a 'ping' event to the `EventBus`. The `PongNeuron`, subscribed to 'ping' events, will then receive and process this message.

### Testing

To run all unit and integration tests, use:

```bash
npm test
```

This will execute tests for the Event Bus, Actor System, HTTP Server, and the neuron integration.

## Contributing

We welcome contributions to the Cortex Framework! Please refer to the `CONTRIBUTING.md` file for guidelines on how to contribute, including information on our GitFlow workflow, TDD practices, and coding standards.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
