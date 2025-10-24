const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const uiSrcDir = path.join(projectRoot, 'src', 'ui');
const uiDocsSrcDir = path.join(projectRoot, 'src', 'ui-docs');
const uiDocsDistDir = path.join(projectRoot, 'dist', 'ui-docs');
const uiDistDir = path.join(projectRoot, 'dist', 'ui'); // Compiled UI components

console.log('Building UI documentation...');

// Ensure dist/ui-docs directory exists
if (!fs.existsSync(uiDocsDistDir)) {
  fs.mkdirSync(uiDocsDistDir, { recursive: true });
}

try {
  // Create a basic index.html for the documentation site
  const indexHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UI Component Documentation</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        nav a { margin-right: 15px; }
    </style>
</head>
<body>
    <h1>UI Component Library</h1>
    <nav>
        <a href="index.html">Home</a>
        <a href="ui-button.html">ui-button</a>
        <!-- More component links will be added here -->
    </nav>
    <hr>
    <h2>Welcome!</h2>
    <p>This is the documentation for our custom UI component library.</p>
    <script src="./ui/ui-bundle.js"></script> <!-- Link to compiled UI components -->
</body>
</html>
`;
  fs.writeFileSync(path.join(uiDocsDistDir, 'index.html'), indexHtmlContent, 'utf8');
  console.log('Generated index.html for documentation.');

  // Create a placeholder page for a component (e.g., ui-button)
  const buttonDocHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ui-button - Documentation</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        nav a { margin-right: 15px; }
        .component-example { border: 1px solid #ccc; padding: 20px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>ui-button Component</h1>
    <nav>
        <a href="index.html">Home</a>
        <a href="ui-button.html">ui-button</a>
    </nav>
    <hr>
    <h2>Description</h2>
    <p>A customizable button component.</p>

    <h2>Examples</h2>
    <div class="component-example">
        <h3>Default Button</h3>
        <ui-button>Click Me</ui-button>
    </div>
    <div class="component-example">
        <h3>Primary Button</h3>
        <ui-button variant="primary">Primary Action</ui-button>
    </div>
    <script src="./ui/ui-bundle.js"></script> <!-- Link to compiled UI components -->
</body>
</html>
`;
  fs.writeFileSync(path.join(uiDocsDistDir, 'ui-button.html'), buttonDocHtmlContent, 'utf8');
  console.log('Generated ui-button.html for documentation.');

  // Copy compiled UI components to the docs site
  const uiBundlePath = path.join(uiDistDir, 'ui-bundle.js');
  const docsUiDir = path.join(uiDocsDistDir, 'ui');
  if (!fs.existsSync(docsUiDir)) {
    fs.mkdirSync(docsUiDir, { recursive: true });
  }
  if (fs.existsSync(uiBundlePath)) {
    fs.copyFileSync(uiBundlePath, path.join(docsUiDir, 'ui-bundle.js'));
    console.log('Copied ui-bundle.js to documentation site.');
  } else {
    console.warn('ui-bundle.js not found. Run build-ui.js first.');
  }

} catch (error) {
  console.error('UI documentation build failed:', error.message);
  process.exit(1);
}