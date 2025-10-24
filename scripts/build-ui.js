import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const uiSrcDir = path.join(projectRoot, 'src', 'ui');
const uiDistDir = path.join(projectRoot, 'dist', 'ui');
const uiComponentsDistDir = path.join(uiDistDir, 'components');

console.log('Building UI components...');

// Ensure dist/ui directory exists
if (!fs.existsSync(uiDistDir)) {
  fs.mkdirSync(uiDistDir, { recursive: true });
}

try {
  // 1. Compile TypeScript files from src/ui to dist/ui using tsconfig.build-ui.json
  execSync(`tsc --project ${path.join(projectRoot, 'tsconfig.build-ui.json')}`, { stdio: 'inherit' });
  console.log('UI TypeScript compilation successful.');

  // 2. Concatenate and minify CSS files (Placeholder for now)
  console.log('Processing UI CSS files (Lit components embed CSS directly).');

  // 3. Bundle Web Component definitions into a single JavaScript file
  console.log('Bundling UI components...');
  const componentFiles = getAllJsFiles(uiComponentsDistDir);
  let bundleContent = 'import { themeManager } from '../../theme/theme-manager.js';\n'; // Add themeManager import once
  for (const file of componentFiles) {
    let fileContent = fs.readFileSync(file, 'utf8');
    // Remove existing themeManager imports from individual files
    fileContent = fileContent.replace(/import\{themeManager\}from\s*['"]\.\.\/\.\.\/theme\/theme-manager\.js['"];?/g, '');
    bundleContent += fileContent + '\n';
  }
  fs.writeFileSync(path.join(uiDistDir, 'ui-bundle.js'), minifyJs(bundleContent), 'utf8');
  console.log('UI components bundled and minified into ui-bundle.js.');

} catch (error) {
  console.error('UI build failed:', error.message);
  process.exit(1);
}

function getAllJsFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllJsFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      if (file.endsWith('.js') && !file.endsWith('.test.js') && !file.endsWith('.metadata.js') && !file.endsWith('.stories.js')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

function minifyJs(code) {
  // Very basic minification: remove comments and extra whitespace
  // This is a simplified approach and not a full-fledged minifier.
  let minifiedCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ''); // Remove comments
  minifiedCode = minifiedCode.replace(/\s+/g, ' '); // Replace multiple spaces with single space
  minifiedCode = minifiedCode.replace(/\s*([{}();,=:])\s*/g, '$1'); // Remove spaces around braces, parens, semicolons, commas, equals, colons
  minifiedCode = minifiedCode.trim(); // Trim leading/trailing whitespace
  return minifiedCode;
}
