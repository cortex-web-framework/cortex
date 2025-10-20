# Plan: Cortex Bio-Inspired Web Framework (TDD & From-Scratch Edition)

## 1. Project Goal

To build a working prototype of a web framework named "Cortex" with **zero external runtime dependencies**. The entire stack will be built from the ground up in TypeScript, following strict **Test-Driven Development (TDD)** and established **Design Patterns**. The project will be structured as a professional, community-ready open-source project from day one.

## 2. Development Principles

*   **Test-Driven Development (TDD):** No implementation code will be written before a failing test for it exists. The cycle will be: **Red** (write a failing test), **Green** (write the simplest code to make it pass), **Refactor** (improve the code without changing its behavior).
*   **Design Patterns:** We will consciously apply design patterns to solve common problems, ensuring the architecture is clean and scalable.
*   **Dependency Purity:** The final runtime code will have **no** `npm` dependencies. `jest` will be used as a **development dependency** only.

## 3. Project Governance & Community

*   **License:** The project will be licensed under the **MIT License**, promoting wide adoption and contribution.
*   **Code of Conduct:** A `CODE_OF_CONDUCT.md` will be established using the Contributor Covenant standard.
*   **Branching Strategy:** We will use **GitFlow**. `main` will hold stable releases. `develop` will be the integration branch for new features. All work will be done on `feature/*` branches and submitted as Pull Requests to `develop`.
*   **Contributing Guidelines:** A `CONTRIBUTING.md` file will detail the TDD process, coding standards, and the PR workflow.
*   **Issue & PR Tracking:** We will use GitHub Issues and PRs with standardized templates.

## 4. Technology Stack

*   **Language:** TypeScript
*   **Runtime:** Node.js
*   **Runtime Dependencies:** None
*   **Development Dependencies:** `typescript`, `ts-node`, `jest`, `ts-jest`, `@types/jest`, `@types/node`

## 5. Proposed Project Structure

```
cortex/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   └── ... (as before)
├── tests/
│   └── ... (as before)
├── .gitignore
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 6. Step-by-Step TDD Development Plan

**Part 0: Repository & Community Setup**
1.  Create a public GitHub repository.
2.  Initialize a local git repository, create `main` and `develop` branches, and push to GitHub.
3.  Add a `LICENSE` file (MIT).
4.  Add a `CODE_OF_CONDUCT.md`.
5.  Create a `CONTRIBUTING.md` detailing the GitFlow and TDD process.
6.  Create issue and PR templates in the `.github/` directory.
7.  Create a `.gitignore` file for Node.js projects.

**Part 1: Environment & Test Setup**
1.  From the `develop` branch, start a new `feature/initial-setup` branch.
2.  Initialize `package.json` and install dev dependencies.
3.  Create `tsconfig.json` and `jest.config.js`.
4.  Write a simple placeholder test to ensure Jest is configured correctly.
5.  Merge this feature branch back into `develop`.

**Part 2: The Event Bus (Observer & Singleton Patterns)**
1.  Start a new `feature/event-bus` branch from `develop`.
2.  **Red:** In `tests/core/eventBus.test.ts`, write tests for the `EventBus` singleton.
3.  **Green:** Create `src/core/eventBus.ts` and implement the class to make the tests pass.
4.  **Refactor:** Improve the implementation.
5.  Merge the feature branch into `develop`.

**(The plan continues for all other components - Actor System, HTTP Server, Neurons - each on their own feature branch and following the TDD cycle as described in the previous version of the plan.)**

**Final Part: Documentation**
1.  Create a `README.md` with a full explanation of the project, architecture, and instructions on how to run tests and the final application.
