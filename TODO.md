## TODO: Cortex Web Framework Development

### Phase 1: Foundation & Immediate Fixes

*   [test] Verify `themeManager` Bug Fix - **COMPLETED (Local Build Verified)**
    *   Trigger new UI component build and deployment (or local simulation).
    *   Access deployed application/local simulation in browser.
    *   Check browser console for `Uncaught SyntaxError: Identifier 'themeManager' has already been declared`.
    *   If error persists, re-investigate bundling and `themeManager` declaration/usage.
*   [setup] Set Up Development Environment for New Component (Text Input) - **COMPLETED**
    *   Ensure Node.js, npm/yarn, TypeScript compiler are installed and configured.
    *   Verify `tsconfig.json` and `tsconfig.build-ui.json` are set for strict TypeScript.
    *   Familiarize with existing component structure and testing patterns.

### Phase 2: Component Development - Text Input

*   [design] Design Text Input Component API - **COMPLETED**
    *   Identify core functionalities: basic text input, placeholder, value, disabled, read-only, type, label association.
    *   Consider common use cases and user interactions.
    *   Define attributes for declarative usage.
    *   Define properties for programmatic access.
    *   Define custom events (`input`, `change`, `focus`, `blur`).
    *   Outline accessibility considerations (ARIA, keyboard navigation).
*   [frontend] [test] Implement Text Input Component (TDD) - **BLOCKED (Persistent Test Environment Issue)**
    *   **Red (Test First)**:
        *   Create `ui-text-input.test.ts`.
        *   Write failing test for component renders.
        *   Write tests for properties (`value`, `placeholder`).
        *   Write tests for events (`input`, `change`).
        *   Write tests for states (`disabled`, `readonly`).
        *   Write tests for accessibility (`aria-label`, keyboard interaction).
        *   Write tests for strict TypeScript type checking (no `any`).
    *   **Green (Code to Pass)**:
        *   Create `ui-text-input.ts`.
        *   Implement minimal HTML structure and CSS.
        *   Implement properties and event handlers to pass tests.
        *   Adhere to "ZERO Dependencies" pledge.
        *   Adhere to "Super Strict TypeScript" standards.
    *   **Refactor**:
        *   Improve code structure, readability, and maintainability.
        *   Optimize CSS for consistency and performance.
        *   Ensure Shadow DOM is correctly implemented.

### Phase 3: Quality Assurance & Refinement

*   [build] Integrate Text Input into `ui-bundle.js` - **COMPLETED**
    *   Run `scripts/build-ui.js`.
    *   Verify `ui-text-input.js` is included in the bundle.
    *   Check console for new bundling errors.
*   [test] Perform Initial QA for Text Input - **BLOCKED (Persistent Test Environment Issue)**
    *   **Cross-Browser Compatibility**: Test in Chrome, Firefox, Safari, Edge.
    *   **Mobile Responsiveness**: Verify display and interaction on various screen sizes.
    *   **Accessibility**: Manually check keyboard navigation, screen reader, ARIA.
    *   **Performance**: Basic check for rendering performance.

### Phase 4: Iterative Component Development

*   [management] Prioritize Next Components (Parallelizable)
    *   Review "Form Controls & Inputs" in `remaining-todos.md`.
    *   Prioritize based on dependencies or user impact (e.g., Textarea, Number Input, Select).
*   [frontend] [test] Repeat Component Development Cycle (Parallelizable) - **BLOCKED (Persistent Test Environment Issue)**
    *   For each prioritized component:
        *   Design API.
        *   Implement with TDD.
        *   Integrate into `ui-bundle.js`.
        *   Perform Initial QA.

### Phase 5: Comprehensive Quality Assurance & Standards Enforcement

*   [test] Implement Pending QA Tasks (Parallelizable) - **BLOCKED (Persistent Test Environment Issue)**
    *   **Theme Switching**: Implement and test light/dark modes.
    *   **Responsive Design**: Verify all components on various screen sizes.
    *   **Accessibility Compliance**: Conduct thorough WCAG 2.1 AA audits.
    *   **Form Validation**: Implement and verify validation for form components.
    *   **CSS Consistency**: Ensure consistent styling.
    *   **Event Handling**: Verify all component events.
    *   **Shadow DOM Styling**: Verify Shadow DOM works.
    *   **Component Props Verification**: Ensure properties/attributes work with strict typing.
    *   **Bundle Integrity**: Verify `ui-bundle.js` loads correctly.
    *   **Cross-Browser Compatibility**: Comprehensive testing across browsers.
    *   **Performance Optimization**: Measure and optimize component rendering/bundle size.
*   [standards] Enforce Development Standards (Ongoing/Parallelizable)
    *   **TypeScript Strict Mode**: Regularly review code for any deviations from strict TypeScript configuration.
    *   **Clean Code Standards**: Conduct code reviews for clean code and linting.
    *   **TDD Workflow**: Ensure TDD cycle for new features/bug fixes.

### Phase 6: Documentation & Release Preparation

*   [docs] Update Documentation (Parallelizable)
    *   Update `docs/API_REFERENCE.md` for new components.
    *   Create/update examples in `examples/`.
    *   Review and update `README.md` and other relevant docs.
*   [release] Prepare for Release
    *   Perform final end-to-end test of component library.
    *   Ensure robust build scripts and optimized bundles.
    *   Review `LICENSE` and `CODE_OF_CONDUCT.md`.