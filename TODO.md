# TODO: Cortex Website Implementation

This document outlines the detailed work breakdown for implementing the Cortex website, based on the approved `PLAN.md`. Each task is categorized and, where applicable, marked for parallel execution.

## 1. Project Setup and Initialization

*   [ ] **1.1. Initialize New Project**
    *   [ ] 1.1.1. Create `cortex-website` directory. [setup]
    *   [ ] 1.1.2. Run `npm init -y` inside `cortex-website`. [setup]
    *   [ ] 1.1.3. Build the local Cortex framework. [setup]
*   [ ] 1.1.3.1. Configure `tsconfig.json` in `cortex-website` to map `cortex` imports to the local framework's `dist` folder. [setup]
*   [ ] **1.1.4. Install dev dependencies: `npm install -D typescript`. [setup]**
    *   [ ] 1.1.5. Choose and install a build tool (e.g., `npm install -D vite` or configure `tsc` for compilation). [setup]
*   [ ] **1.2. Configure TypeScript**
    *   [ ] 1.2.1. Create `tsconfig.json` in the root for project-wide settings. [setup]
    *   [ ] 1.2.2. Create `tsconfig.frontend.json` in `src/frontend` for frontend-specific settings. [setup]
    *   [ ] 1.2.3. Create `tsconfig.backend.json` in `src/backend` for backend-specific settings. [setup]
    *   [ ] 1.2.4. Ensure `strict: true` and other strict type-checking options are enabled in all `tsconfig.json` files. [setup]
*   [ ] **1.4. Basic File Structure**
    *   [ ] 1.4.1. Create `src/frontend` directory. [setup]
    *   [ ] 1.4.2. Create `src/backend` directory. [setup]
    *   [ ] 1.4.3. Create `src/shared` directory for shared types/interfaces. [setup]
    *   [ ] 1.4.4. Create `public` directory for static assets. [setup]

## 2. Core Cortex Backend Implementation

*   [ ] **2.1. Initialize Cortex Server**
    *   [ ] 2.1.1. Create `src/backend/server.ts`. [backend]
    *   [ ] 2.1.2. Initialize `EventBus`, `ActorSystem`, and `CortexHttpServer`. [backend]
    *   [ ] 2.1.3. Configure `CortexHttpServer` to serve static files from `public` directory. [backend]
    *   [ ] 2.1.4. Define a basic `/api` route for future API endpoints. [backend]
    *   [ ] 2.1.5. **[Test]** Write unit tests for server initialization and static file serving. [test]
*   [ ] **2.2. Implement Configuration Management**
    *   [ ] 2.2.1. Create `src/backend/config.ts` using Cortex's `Config` module. [backend]
    *   [ ] 2.2.2. Define configuration for external links (GitHub, Twitter, etc.). [backend]
    *   [ ] 2.2.3. **[Test]** Write unit tests for configuration loading and environment-specific settings. [test]
*   [ ] **2.3. Implement Logging**
    *   [ ] 2.3.1. Integrate Cortex's `Logger` in `src/backend/server.ts`. [backend]
    *   [ ] 2.3.2. Configure log levels and output. [backend]
    *   [ ] 2.3.3. **[Test]** Write unit tests to verify logger functionality. [test]

## 3. Frontend Page Implementations

### 3.1. Homepage (`/`)

*   [ ] **3.1.1. HTML Structure:**
    *   [ ] 3.1.1.1. Create `public/index.html`. [frontend]
    *   [ ] 3.1.1.2. Implement hero section and feature areas based on `cortex_home_page:_hero_&_features_1/code.html` and `cortex_home_page:_hero_&_features_2/code.html`. [frontend]
*   [ ] **3.1.2. Styling:**
    *   [ ] 3.1.2.1. Apply custom CSS classes to match the design. [frontend]
*   [ ] **3.1.3. Dynamic Content (Optional):**
    *   [ ] 3.1.3.1. **[Backend]** Create `src/backend/features/featureActor.ts` to serve feature data. [backend]
    *   [ ] 3.1.3.2. **[Backend]** Define `/api/features` endpoint in `src/backend/server.ts`. [backend]
    *   [ ] 3.1.3.3. **[Frontend]** Implement JavaScript/TypeScript to fetch and render dynamic features. [frontend]
    *   [ ] 3.1.3.4. **[Test]** Write unit tests for `FeatureActor`. [test]
    *   [ ] 3.1.3.5. **[Test]** Write integration tests for `/api/features` endpoint. [test]

### 3.2. Architecture Visualization Page (`/architecture`)

*   [ ] **3.2.1. HTML Structure:**
    *   [ ] 3.2.1.1. Create `src/frontend/architecture.html`. [frontend]
    *   [ ] 3.2.1.2. Implement layout based on `cortex_architecture_visualization_1/code.html` and `cortex_architecture_visualization_2/code.html`. [frontend]
*   [ ] **3.2.2. Styling:**
    *   [ ] 3.2.2.1. Apply custom CSS, including animations and glassmorphic effects. [frontend]
*   [ ] **3.2.3. Interactivity:**
    *   [ ] 3.2.3.1. Implement JavaScript/TypeScript for hover effects and tooltips for architectural components. [frontend]
*   [ ] **3.2.4. Content Sourcing:**
    *   [ ] 3.2.4.1. Ensure descriptions are consistent with Cortex `README.md` and other documentation. [documentation]

### 3.3. Blog / News Section (`/blog`)

*   [ ] **3.3.1. HTML Structure:**
    *   [ ] 3.3.1.1. Create `src/frontend/blog.html` based on `cortex_blog_/_news/code.html`. [frontend]
*   [ ] **3.3.2. Styling:**
    *   [ ] 3.3.2.1. Apply custom CSS for article cards, search bar, and category filters. [frontend]
*   [ ] **3.3.3. Backend Actors:**
    *   [ ] 3.3.3.1. **[Backend]** Create `src/backend/blog/postActor.ts` for CRUD operations on blog posts. [backend]
    *   [ ] 3.3.3.2. **[Backend]** Create `src/backend/blog/blogServiceActor.ts` for fetching, searching, and filtering posts. [backend]
    *   [ ] 3.3.3.3. **[Test]** Write unit tests for `PostActor` and `BlogServiceActor`. [test]
*   [ ] **3.3.4. API Endpoints:**
    *   [ ] 3.3.4.1. **[Backend]** Define `/api/blog/posts` and `/api/blog/search` endpoints in `src/backend/server.ts`. [backend]
    *   [ ] 3.3.4.2. **[Test]** Write integration tests for blog API endpoints. [test]
*   [ ] **3.3.5. Frontend Logic:**
    *   [ ] 3.3.5.1. Implement JavaScript/TypeScript to fetch blog posts. [frontend]
    *   [ ] 3.3.5.2. Implement search input and category filtering logic. [frontend]
    *   [ ] 3.3.5.3. Dynamically render blog articles. [frontend]

### 3.4. Code Examples Showcase (`/examples`)

*   [ ] **3.4.1. HTML Structure:**
    *   [ ] 3.4.1.1. Create `src/frontend/examples.html` based on `cortex_code_examples_showcase_1/code.html` and `cortex_code_examples_showcase_2/code.html`. [frontend]
*   [ ] **3.4.2. Styling:**
    *   [ ] 3.4.2.1. Apply custom CSS for code blocks, console output, and navigation tabs. [frontend]
    *   [ ] 3.4.2.2. Ensure monospace font for code. [frontend]
*   [ ] **3.4.3. Backend Actors (Interactive Examples):**
    *   [ ] 3.4.3.1. **[Backend]** Create `src/backend/examples/codeRunnerActor.ts` for executing code snippets. [backend]
    *   [ ] 3.4.3.2. **[Backend]** Define `/api/examples/run` endpoint in `src/backend/server.ts`. [backend]
    *   [ ] 3.4.3.3. **[Test]** Write unit tests for `CodeRunnerActor`. [test]
    *   [ ] 3.4.3.4. **[Test]** Write integration tests for `/api/examples/run` endpoint. [test]
*   [ ] **3.4.4. Frontend Logic:**
    *   [ ] 3.4.4.1. Implement JavaScript/TypeScript to display code. [frontend]
    *   [ ] 3.4.4.2. Implement logic to send code to backend for execution (if interactive). [frontend]
    *   [ ] 3.4.4.3. Display execution results. [frontend]

### 3.5. Community & Contribution Page (`/community`)

*   [ ] **3.5.1. HTML Structure:**
    *   [ ] 3.5.1.1. Create `src/frontend/community.html` based on `cortex_community_&_contribution/code.html`. [frontend]
*   [ ] **3.5.2. Styling:**
    *   [ ] 3.5.2.1. Apply custom CSS for call-to-action cards and social links. [frontend]
*   [ ] **3.5.3. Dynamic Links:**
    *   [ ] 3.5.3.1. Use `Config` module to manage external links (GitHub, Twitter, LinkedIn). [backend]
    *   [ ] 3.5.3.2. Inject dynamic links into the frontend. [frontend]

### 3.6. About Us / Team Page (`/about`)

*   [ ] **3.6.1. HTML Structure:**
    *   [ ] 3.6.1.1. Create `src/frontend/about.html` based on `cortex_about_us_/_team/code.html`. [frontend]
*   [ ] **3.6.2. Styling:**
    *   [ ] 3.6.2.1. Apply custom CSS for team member cards and hero section. [frontend]
*   [ ] **3.6.3. Content Management:**
    *   [ ] 3.6.3.1. Manage team member data (names, roles, bios, images) via a JSON file or a `TeamActor`. [backend]
    *   [ ] 3.6.3.2. Implement frontend logic to render team members. [frontend]

## 4. General Technical Considerations

*   [ ] **4.1. Routing:**
    *   [ ] 4.1.1. Implement server-side routing using `CortexHttpServer` for all pages. [backend]
*   [ ] **4.2. Asset Management:**
    *   [ ] 4.2.1. Configure build process for JavaScript and CSS bundling and minification. [setup]
    *   [ ] 4.2.2. Implement cache busting for static assets. [setup]
*   [ ] **4.3. Error Handling:**
    *   [ ] 4.3.1. Implement robust error handling on both frontend and backend. [backend] [frontend]
*   [ ] **4.4. Performance:**
    *   [ ] 4.4.1. Optimize frontend assets (image compression, lazy loading). [frontend]
    *   [ ] 4.4.2. Optimize backend queries and actor performance. [backend]
*   [ ] **4.5. Security:**
    *   [ ] 4.5.1. Implement input validation using Cortex's security features. [backend]
    *   [ ] 4.5.2. Configure CORS policies in `CortexHttpServer`. [backend]

## 5. Testing Strategy

*   [ ] **5.1. Unit Tests:**
    *   [ ] 5.1.1. Write unit tests for all Cortex actors and backend services. [test]
    *   [ ] 5.1.2. Ensure 100% code coverage for critical backend logic. [test]
*   [ ] **5.2. Integration Tests:**
    *   [ ] 5.2.1. Test interaction between frontend and backend APIs. [test]
    *   [ ] 5.2.2. Verify data flow through `EventBus` and `ActorSystem`. [test]
*   [ ] **5.3. End-to-End (E2E) Tests:**
    *   [ ] 5.3.1. Set up Playwright/Cypress for E2E testing. [test]
    *   [ ] 5.3.2. Write E2E tests for critical user flows (e.g., navigating to pages, interacting with forms). [test]

## 6. Documentation

*   [ ] **6.1. README.md:**
    *   [ ] 6.1.1. Update project `README.md` with setup, run, and contribution instructions. [documentation]
*   [ ] **6.2. API Documentation:**
    *   [ ] 6.2.1. Document all backend API endpoints (e.g., using OpenAPI/Swagger). [documentation]
*   [ ] **6.3. Code Comments:**
    *   [ ] 6.3.1. Add clear and concise comments to complex code sections. [documentation]

## Parallelizable Tasks

*   **[P1]** Frontend HTML Structure and initial Tailwind Styling (3.1.1, 3.1.2, 3.2.1, 3.2.2, 3.3.1, 3.3.2, 3.4.1, 3.4.2, 3.5.1, 3.5.2, 3.6.1, 3.6.2)
*   **[P2]** Core Cortex Backend Implementation (2.1, 2.2, 2.3)
*   **[P3]** Backend Actors for Blog (3.3.3)
*   **[P4]** Backend Actors for Code Examples (3.4.3)
*   **[P5]** Unit Tests for Core Backend (2.1.5, 2.2.3, 2.3.3)
*   **[P6]** Unit Tests for Blog Actors (3.3.3.3)
*   **[P7]** Unit Tests for Code Example Actors (3.4.3.3)

## 7. Test Execution & Stability

*   [ ] **7.1. Investigate and Fix Test Hanging Issue:**
    *   [ ] 7.1.1. Analyze why `npm test` command is hanging, even with explicit server shutdown.
    *   [ ] 7.1.2. Ensure all asynchronous operations are properly awaited and resources are released.
    *   [ ] 7.1.3. Consider alternative test runners or configurations if necessary, while adhering to "ZERO DEPS" for the website project.