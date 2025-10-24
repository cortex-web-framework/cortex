## Test Plan

**Phase 1: Core Infrastructure Validation**
1.  **Generate a Test Component:** I will use the `scripts/generate-component.js` script to create a new UI component named `test-component`. This will validate that the component scaffolding process is working as expected.
2.  **Build the Component:** I will execute the `scripts/build-ui.js` script to build the newly created `test-component`. This will verify the custom build process.
3.  **Unit Test the Component:** I will run the `scripts/test-ui.js` script to execute the unit tests for the `test-component`. This will ensure the testing infrastructure is functioning correctly.

**Phase 2: Example Application**
1.  **Create an Example App:** I will create a new directory `examples/ui-component-test-app` containing an `index.html` and a `main.js`.
2.  **Integrate the Component:** The `main.js` will import and use the `test-component`, and the `index.html` will host the application. This will test the component's integration and usage.

**Phase 3: Verification**
1.  **Serve the App:** I will start a simple HTTP server to serve the example application.
2.  **Manual Verification:** I will then provide you with the URL to the running application so you can manually verify that the `test-component` renders and functions correctly.

## Phase 1: Core Infrastructure Validation

- **Generate a Test Component:** `test-component` generated successfully.
- **Build the Component:** Build successful after fixing dependencies and type errors.
- **Unit Test the Component:** All tests passed, including the new `test-component` test.

## Phase 1: Core Infrastructure Validation (Second Attempt)

- **Uninstall Dependencies:** Uninstalled `lit` and `@storybook/web-components`.
- **Update Component Templates:** Updated component and test templates to use vanilla Web Components.
- **Generate a Test Component:** `test-component` regenerated successfully.
- **Build the Component:** Build successful after fixing type errors.
- **Unit Test the Component:** All tests passed, including the new `test-component` test.

## Phase 2: Example Application

1.  **Create an Example App:** Created a new directory `examples/ui-component-test-app` with `index.html` and `main.js`.
2.  **Integrate the Component:** The `main.js` imports the `ui-bundle.js` which contains the `test-component`.

## Phase 3: Verification

1.  **Serve the App:** Started a simple HTTP server on port 8888.
2.  **Manual Verification:** Please open the following URL in your browser to verify that the `test-component` renders and functions correctly: [http://172.25.150.64:8888/examples/ui-component-test-app/](http://172.25.150.64:8888/examples/ui-component-test-app/)