import { ComponentMetadata } from '../../metadata.js';

export const uiCodeMetadata: ComponentMetadata = {
  tag: 'ui-code',
  name: 'Code',
  category: 'Display',
  description:
    'A code display component with syntax language specification, optional line numbers, and copy to clipboard functionality. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'code',
      type: 'string | undefined',
      description: 'The code content to display',
      isAttribute: true,
    },
    {
      name: 'language',
      type: "'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json' | 'bash' | 'sql' | 'yaml' | 'xml' | 'plaintext'",
      default: "'plaintext'",
      description: 'Programming language for display classification',
      isAttribute: true,
    },
    {
      name: 'showLineNumbers',
      type: 'boolean',
      default: 'true',
      description: 'Display line numbers on the left side',
      isAttribute: true,
    },
    {
      name: 'copyable',
      type: 'boolean',
      default: 'true',
      description: 'Show copy to clipboard button',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-surface-light',
      description: 'Background color of code block',
      default: '#f5f5f5',
    },
    {
      name: '--ui-color-text',
      description: 'Text color of code',
      default: '#333333',
    },
    {
      name: '--ui-color-border',
      description: 'Border color of code block',
      default: '#dddddd',
    },
  ],
  examples: [
    {
      title: 'JavaScript Code',
      code: `<ui-code language="javascript" code="function hello() {\n  console.log('Hello, World!');\n}"></ui-code>`,
      description: 'Display JavaScript code with line numbers',
    },
    {
      title: 'Python Code',
      code: `<ui-code language="python" code="def hello():\n    print('Hello, World!')"></ui-code>`,
      description: 'Display Python code',
    },
    {
      title: 'JSON Code',
      code: `<ui-code language="json" code='{"name": "John", "age": 30}'></ui-code>`,
      description: 'Display JSON data',
    },
    {
      title: 'Without Line Numbers',
      code: `<ui-code language="html" showLineNumbers="false" code="<div>Hello</div>"></ui-code>`,
      description: 'Code block without line numbers',
    },
    {
      title: 'Not Copyable',
      code: `<ui-code language="bash" copyable="false" code="npm install package-name"></ui-code>`,
      description: 'Code block without copy button',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-code',
};
