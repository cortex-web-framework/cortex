/**
 * Greeting Template
 * Template for generating greeting files
 */

import type { Template } from '@cortex/cli/extensibility';

export const greetingTemplate: Template = {
  name: 'greeting',
  description: 'Generate a greeting file',
  files: [
    {
      path: '{{outputPath}}/{{name}}.txt',
      content: `Hello, {{name}}!

{{#if formal}}
It is a pleasure to meet you. I hope you are having a wonderful day.
{{else}}
Nice to meet you! How are you doing today?
{{/if}}

{{#if includeTimestamp}}
Generated on: {{timestamp}}
{{/if}}

Best regards,
{{#if sender}}{{sender}}{{else}}The CLI{{/if}}
`
    }
  ],
  variables: [
    {
      name: 'name',
      type: 'string',
      required: true,
      description: 'Name to greet'
    },
    {
      name: 'outputPath',
      type: 'string',
      required: false,
      default: '.',
      description: 'Output directory path'
    },
    {
      name: 'formal',
      type: 'boolean',
      required: false,
      default: false,
      description: 'Use formal greeting style'
    },
    {
      name: 'includeTimestamp',
      type: 'boolean',
      required: false,
      default: true,
      description: 'Include timestamp in greeting'
    },
    {
      name: 'sender',
      type: 'string',
      required: false,
      description: 'Sender name'
    }
  ]
};