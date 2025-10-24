import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const componentsDir = path.join(projectRoot, 'src', 'ui', 'components');
const testsDir = path.join(projectRoot, 'tests', 'ui', 'components');
const scriptsDir = path.join(projectRoot, 'scripts');

const componentName = process.argv[2];

if (!componentName) {
  console.error('Usage: node scripts/generate-component.mjs <component-name>');
  process.exit(1);
}

const componentKebabCase = componentName.toLowerCase();
const componentPascalCase = componentKebabCase.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');

const componentPath = path.join(componentsDir, componentKebabCase);
const testPath = path.join(testsDir, componentKebabCase);

// Create component directory
fs.mkdirSync(componentPath, { recursive: true });
fs.mkdirSync(testPath, { recursive: true });

// Component .ts file content
const componentTemplate = fs.readFileSync(path.join(scriptsDir, 'component.template.ts'), 'utf8');
const componentContent = componentTemplate
  .replace(/{{componentKebabCase}}/g, componentKebabCase)
  .replace(/{{componentPascalCase}}/g, componentPascalCase);
fs.writeFileSync(path.join(componentPath, `${componentKebabCase}.ts`), componentContent);

// Test .ts file content
const testTemplate = fs.readFileSync(path.join(scriptsDir, 'test.template.ts'), 'utf8');
const testContent = testTemplate
    .replace(/{{componentKebabCase}}/g, componentKebabCase)
    .replace(/{{componentPascalCase}}/g, componentPascalCase);
fs.writeFileSync(path.join(testPath, `${componentKebabCase}.test.ts`), testContent);



console.log(`Component '${componentKebabCase}' generated successfully!`);
console.log(`- Component: ${path.join(componentPath, `${componentKebabCase}.ts`)}`);
console.log(`- Test: ${path.join(testPath, `${componentKebabCase}.test.ts`)}`);