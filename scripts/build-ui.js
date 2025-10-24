import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const uiSrcDir = path.join(projectRoot, 'src', 'ui');
const uiDistDir = path.join(projectRoot, 'dist', 'ui');
const uiCssDir = path.join(uiSrcDir, 'styles'); // Assuming global UI styles might live here

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
  const compiledJsFiles = fs.readdirSync(uiDistDir).filter(file => file.endsWith('.js'));
  let bundleContent = '';
  for (const file of compiledJsFiles) {
    bundleContent += fs.readFileSync(path.join(uiDistDir, file), 'utf8') + '\n';
  }
  fs.writeFileSync(path.join(uiDistDir, 'ui-bundle.js'), minifyJs(bundleContent), 'utf8');
  console.log('UI components bundled and minified into ui-bundle.js.');

} catch (error) {
  console.error('UI build failed:', error.message);
  process.exit(1);
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

