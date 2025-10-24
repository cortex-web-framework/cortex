import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const componentsDir = path.join(projectRoot, 'src', 'ui', 'components');
const testsDir = path.join(projectRoot, 'tests', 'ui', 'components');

const componentName = process.argv[2];

if (!componentName) {
  console.error('Usage: node scripts/generate-component.js <component-name>');
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
const componentContent = `
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('${componentKebabCase}')
export class ${componentPascalCase} extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      color: var(--cortex-text-color, #333);
      background-color: var(--cortex-background-color, #f0f0f0);
      border: 1px solid var(--cortex-border-color, #ccc);
      border-radius: var(--cortex-border-radius, 4px);
    }
  `

  @property({ type: String })
  message = 'Hello, Cortex!';

  render() {
    return html`<p>${this.message}</p>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    '${componentKebabCase}': ${componentPascalCase};
  }
}
`;
fs.writeFileSync(path.join(componentPath, `${componentKebabCase}.ts`), componentContent);

// Test .ts file content
const testContent = `
import { ${componentPascalCase} } from '../../../../src/ui/components/${componentKebabCase}/${componentKebabCase}';

describe('${componentPascalCase}', () => {
  it('should render with default message', async () => {
    const element = document.createElement('${componentKebabCase}');
    document.body.appendChild(element);
    await element.updateComplete;
    expect(element.shadowRoot?.querySelector('p')?.textContent).toBe('Hello, Cortex!');
    document.body.removeChild(element);
  });

  it('should render with a custom message', async () => {
    const element = document.createElement('${componentKebabCase}');
    element.message = 'Custom Message';
    document.body.appendChild(element);
    await element.updateComplete;
    expect(element.shadowRoot?.querySelector('p')?.textContent).toBe('Custom Message');
    document.body.removeChild(element);
  });
});
`;
fs.writeFileSync(path.join(testPath, `${componentKebabCase}.test.ts`), testContent);

// Storybook .ts file content
const storyContent = `
import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './${componentKebabCase}';

const meta: Meta = {
  title: 'Components/${componentPascalCase}',
  component: '${componentKebabCase}',
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'The message to display',
      defaultValue: 'Hello, Cortex!',
    },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    message: 'Hello, Cortex!',
  },
  render: (args) => html`<${componentKebabCase} message="${args.message}"></${componentKebabCase}>
`,
};

export const CustomMessage: Story = {
  args: {
    message: 'This is a custom message!',
  },
  render: (args) => html`<${componentKebabCase} message="${args.message}"></${componentKebabCase}>
`,
};
`;
fs.writeFileSync(path.join(componentPath, `${componentKebabCase}.stories.ts`), storyContent);

console.log(`Component '${componentKebabCase}' generated successfully!`);
console.log(`- Component: ${path.join(componentPath, `${componentKebabCase}.ts`)}`);
console.log(`- Test: ${path.join(testPath, `${componentKebabCase}.test.ts`)}`);
console.log(`- Story: ${path.join(componentPath, `${componentKebabCase}.stories.ts`)}`);
