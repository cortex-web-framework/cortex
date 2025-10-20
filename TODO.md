# Cortex Framework - TODO List

This list breaks down the `PLAN.md` into actionable tasks. Each part should be completed on its own feature branch, following the TDD cycle.

## Part 0: Repository & Community Setup

*   `[project-setup]` Create a new public repository on GitHub named `cortex`.
*   `[git]` Initialize the local project as a git repository.
*   `[git]` Create the `main` and `develop` branches.
*   `[git]` Set `develop` as the default branch.
*   `[git]` Push the initial branches to the GitHub repository.
*   `[documentation][legal]` Create the `LICENSE` file with the MIT License text. (Can be done in parallel with other documentation)
*   `[documentation][community]` Create a `CODE_OF_CONDUCT.md` file. (Can be done in parallel)
*   `[documentation][community]` Create a `CONTRIBUTING.md` file explaining the GitFlow, TDD workflow, and coding standards. (Can be done in parallel)
*   `[project-setup][github]` Create a `PULL_REQUEST_TEMPLATE.md` in a `.github/` directory. (Can be done in parallel)
*   `[project-setup][github]` Create issue templates for bug reports and feature requests in `.github/ISSUE_TEMPLATE/`. (Can be done in parallel)
*   `[git]` Create and commit a comprehensive `.gitignore` file for Node.js/TypeScript projects.

## Part 1: Environment & Test Setup

*   `[git]` Create and check out a new branch: `feature/initial-setup`.
*   `[environment]` Initialize a `package.json` file using `npm init -y`.
*   `[environment]` Install all development dependencies: `npm install --save-dev typescript ts-node jest ts-jest @types/jest @types/node`.
*   `[environment]` Create a `tsconfig.json` file configured for the project.
*   `[environment]` Create a `jest.config.js` file configured for TypeScript.
*   `[test]` Create a `tests/` directory.
*   `[test]` Create a placeholder test file `tests/environment.test.ts` with a single passing test to validate the Jest setup.
*   `[git]` Commit the setup files and merge the `feature/initial-setup` branch into `develop`.

## Part 2: The Event Bus

*   `[git]` Create and check out a new branch: `feature/event-bus`.
*   `[test]` Create the test file `tests/core/eventBus.test.ts`.
*   `[test]` Write a failing test to ensure the `EventBus` is a singleton.
*   `[test]` Write a failing test for the `subscribe` method.
*   `[test]` Write a failing test for the `publish` method to a single subscriber.
*   `[test]` Write a failing test for publishing to multiple subscribers on the same topic.
*   `[implementation]` Create the file `src/core/eventBus.ts`.
*   `[implementation]` Implement the `EventBus` class, making the tests pass.
*   `[implementation]` Refactor the `EventBus` code for clarity and adherence to design patterns (Singleton, Observer).
*   `[git]` Commit the work and merge the `feature/event-bus` branch into `develop`.

## Part 3: The Actor System

*   `[git]` Create and check out a new branch: `feature/actor-system`.
*   `[test]` Create the test file `tests/core/actorSystem.test.ts`.
*   `[test]` Write failing tests for creating and registering an actor.
*   `[test]` Write a failing test for dispatching a message to an actor's mailbox.
*   `[test]` Write a failing asynchronous test to verify an actor processes a message from its mailbox.
*   `[implementation]` Create the file `src/core/actorSystem.ts`.
*   `[implementation]` Implement the `Actor` base class and `ActorSystem` to make the tests pass.
*   `[implementation]` Refactor the `ActorSystem` code (Factory, Supervisor patterns).
*   `[git]` Commit the work and merge the `feature/actor-system` branch into `develop`.

## Part 4: The HTTP Server

*   `[git]` Create and check out a new branch: `feature/http-server`.
*   `[test]` Create the test file `tests/core/httpServer.test.ts`.
*   `[test]` Write failing tests for starting and stopping the server.
*   `[test]` Write a failing test for routing to a specific path and method.
*   `[test]` Write a failing test to ensure the route handler's callback is triggered.
*   `[implementation]` Create the file `src/core/httpServer.ts`.
*   `[implementation]` Implement the `CortexHttpServer` class using the Node.js `http` module to pass the tests.
*   `[implementation]` Refactor the server and its routing logic.
*   `[git]` Commit the work and merge the `feature/http-server` branch into `develop`.

## Part 5: The Neurons (Integration)

*   `[git]` Create and check out a new branch: `feature/neurons`.
*   `[test]` Create the integration test file `tests/neurons/pingPong.test.ts`.
*   `[test]` Write a failing integration test that verifies the full communication chain: EventBus -> PingNeuron -> EventBus -> PongNeuron.
*   `[implementation]` Create the neuron files: `src/neurons/pingNeuron.ts` and `src/neurons/pongNeuron.ts`.
*   `[implementation]` Implement the `PingNeuron` and `PongNeuron` classes to pass the integration test.
*   `[implementation]` Refactor the neuron implementations.
*   `[git]` Commit the work and merge the `feature/neurons` branch into `develop`.

## Part 6: Main Supervisor & Final Documentation

*   `[git]` Create and check out a new branch: `feature/documentation`.
*   `[implementation]` Create the main `src/index.ts` file to instantiate and connect all the core components.
*   `[documentation]` Create the main `README.md` file, explaining the project's purpose, architecture, and providing detailed instructions on how to install, test, and run the framework.
*   `[git]` Commit the work and merge the `feature/documentation` branch into `develop`.
