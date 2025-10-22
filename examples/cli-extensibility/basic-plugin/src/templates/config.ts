/**
 * Config Template
 * Template for generating configuration files
 */

import type { Template } from '@cortex/cli/extensibility';

export const configTemplate: Template = {
  name: 'config',
  description: 'Generate a configuration file',
  files: [
    {
      path: '{{outputPath}}/{{configName}}.json',
      content: `{
  "name": "{{projectName}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "main": "{{mainFile}}",
  "scripts": {
    {{#each scripts}}
    "{{@key}}": "{{this}}"{{#unless @last}},{{/unless}}
    {{/each}}
  },
  "dependencies": {
    {{#each dependencies}}
    "{{@key}}": "{{this}}"{{#unless @last}},{{/unless}}
    {{/each}}
  },
  "devDependencies": {
    {{#each devDependencies}}
    "{{@key}}": "{{this}}"{{#unless @last}},{{/unless}}
    {{/each}}
  }{{#if author}},
  "author": "{{author}}"{{/if}}{{#if license}},
  "license": "{{license}}"{{/if}}
}
`
    },
    {
      path: '{{outputPath}}/{{configName}}.ts',
      content: `/**
 * {{projectName}} Configuration
 * Generated on {{timestamp}}
 */

export interface {{configName}}Config {
  name: string;
  version: string;
  description: string;
  main: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;{{#if author}}
  author?: string;{{/if}}{{#if license}}
  license?: string;{{/if}}
}

export const defaultConfig: {{configName}}Config = {
  name: "{{projectName}}",
  version: "{{version}}",
  description: "{{description}}",
  main: "{{mainFile}}",
  scripts: {
    {{#each scripts}}
    "{{@key}}": "{{this}}"{{#unless @last}},{{/unless}}
    {{/each}}
  },
  dependencies: {
    {{#each dependencies}}
    "{{@key}}": "{{this}}"{{#unless @last}},{{/unless}}
    {{/each}}
  },
  devDependencies: {
    {{#each devDependencies}}
    "{{@key}}": "{{this}}"{{#unless @last}},{{/unless}}
    {{/each}}
  }{{#if author}},
  author: "{{author}}"{{/if}}{{#if license}},
  license: "{{license}}"{{/if}}
};
`
    }
  ],
  variables: [
    {
      name: 'projectName',
      type: 'string',
      required: true,
      description: 'Project name'
    },
    {
      name: 'configName',
      type: 'string',
      required: false,
      default: 'config',
      description: 'Configuration file name'
    },
    {
      name: 'outputPath',
      type: 'string',
      required: false,
      default: '.',
      description: 'Output directory path'
    },
    {
      name: 'version',
      type: 'string',
      required: false,
      default: '1.0.0',
      description: 'Project version'
    },
    {
      name: 'description',
      type: 'string',
      required: false,
      default: 'A new project',
      description: 'Project description'
    },
    {
      name: 'mainFile',
      type: 'string',
      required: false,
      default: 'index.js',
      description: 'Main entry file'
    },
    {
      name: 'scripts',
      type: 'object',
      required: false,
      default: {},
      description: 'NPM scripts'
    },
    {
      name: 'dependencies',
      type: 'object',
      required: false,
      default: {},
      description: 'Production dependencies'
    },
    {
      name: 'devDependencies',
      type: 'object',
      required: false,
      default: {},
      description: 'Development dependencies'
    },
    {
      name: 'author',
      type: 'string',
      required: false,
      description: 'Project author'
    },
    {
      name: 'license',
      type: 'string',
      required: false,
      default: 'MIT',
      description: 'Project license'
    }
  ]
};