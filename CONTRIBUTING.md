# Contributing to Cortex

First off, thank you for considering contributing to Cortex! It's people like you that make open source such a great community.

## Code of Conduct

This project and everyone participating in it is governed by the [Cortex Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## How Can I Contribute?

### Reporting Bugs

Bugs are tracked as GitHub issues. Before opening a new issue, please perform a search to see if the problem has already been reported. If it has and the issue is still open, add a comment to the existing issue instead of opening a new one. If you are unable to find an existing issue addressing the problem, please open a new one.

See [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) for more details.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. See [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) for more details.

### Your First Code Contribution

Unsure where to begin contributing to Cortex? You can start by looking through `good first issue` and `help wanted` issues.

## Development Process

We follow a strict Test-Driven Development (TDD) process and a GitFlow branching model.

### GitFlow Branching Model

*   `main`: This branch contains the latest stable release. Direct pushes are forbidden.
*   `develop`: This is the integration branch for all new features. All feature branches are merged into `develop`. Direct pushes are forbidden.
*   `feature/*`: All new work must be done on a feature branch. The branch should be named descriptively (e.g., `feature/new-parser`).
*   `release/*`: When `develop` is ready for a release, a `release` branch is created.
*   `hotfix/*`: For urgent fixes to the `main` branch.

### Pull Request Process

1.  Create a new `feature/*` branch from the `develop` branch.
2.  Follow the TDD cycle for all code changes (see below).
3.  Ensure all tests are passing.
4.  Ensure your code lints.
5.  Open a pull request from your feature branch to the `develop` branch.
6.  The PR will be reviewed, and once approved, it will be merged.

### Test-Driven Development (TDD)

We adhere to a strict Red-Green-Refactor cycle.

1.  **Red**: Write a new test that describes the feature or bug fix. It must fail, as the implementation does not exist yet.
2.  **Green**: Write the simplest possible implementation code to make the test pass.
3.  **Refactor**: Improve the implementation code. Ensure that all tests still pass after refactoring.

No pull request will be approved unless it includes tests for the new functionality and all tests are passing.
