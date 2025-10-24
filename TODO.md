## TODO: Uncaught SyntaxError: Identifier 'themeManager' has already been declared

**Description:** The deployed GitHub Pages application is showing an `Uncaught SyntaxError: Identifier 'themeManager' has already been declared` error in the browser console. This indicates that the `themeManager` object is being declared multiple times, likely due to incorrect bundling of JavaScript files.

**Current Status:**
- The `scripts/build-ui.js` script has been modified to filter out `.test.js`, `.metadata.js`, and `.stories.js` files from the `ui-bundle.js`.
- The `scripts/build-ui.js` script has also been modified to remove duplicate `import { themeManager } from '../../theme/theme-manager.js';` statements from individual component files and add a single import at the beginning of the bundle.
- Despite these changes, the error persists, suggesting the bundling logic or deployment process still has an issue.

**Next Steps:**
1.  Verify the content of the `ui-bundle.js` file on the deployed GitHub Pages to confirm if the `themeManager` import is indeed duplicated or if there are other declarations.
2.  Inspect the build logs of the GitHub Actions workflow for the 'Build UI components' step to ensure the build script changes are being applied correctly and to see the output of the `console.log` statements added for debugging.
