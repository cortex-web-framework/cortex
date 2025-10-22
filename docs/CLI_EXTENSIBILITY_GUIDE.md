# CLI Extensibility Guide

## Overview

The Cortex CLI Extensibility System provides a powerful plugin architecture that allows developers to extend the CLI with custom commands, templates, and hooks. The system is built with zero dependencies and follows strict TypeScript guidelines.

## Architecture

### Core Components

1. **Plugin Registry** - Manages plugin registration and discovery
2. **Template Registry** - Handles template management and rendering
3. **Hook Registry** - Manages event hooks and callbacks
4. **Plugin Loader** - Loads and validates plugins dynamically
5. **Template Engine** - Renders templates with variables and logic
6. **Security Sandbox** - Provides isolated execution environments
7. **Performance Optimizer** - Optimizes plugin and template performance
8. **GitHub Installer** - Installs plugins from GitHub repositories

### Key Features

- **Zero Dependencies**: Built entirely with Node.js built-ins
- **Type Safety**: Full TypeScript support with strict type checking
- **Security**: Sandboxed execution environments
- **Performance**: Multi-level caching and optimization
- **Extensibility**: Plugin, template, and hook systems
- **GitHub Integration**: Install plugins directly from GitHub

## Quick Start

### 1. Basic Plugin Structure

```typescript
// my-plugin.ts
export interface MyPlugin {
  name: string;
  version: string;
  description: string;
  commands: CLICommand[];
  templates: Template[];
  hooks: Hook[];
}

export const plugin: MyPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My custom plugin',
  commands: [
    {
      name: 'my-command',
      description: 'Execute my custom command',
      action: async (args, options) => {
        console.log('Hello from my plugin!');
      }
    }
  ],
  templates: [],
  hooks: []
};
```

### 2. Template System

```typescript
// template.ts
export const myTemplate: Template = {
  name: 'my-template',
  description: 'My custom template',
  files: [
    {
      path: 'src/{{name}}.ts',
      content: `
        export class {{name}} {
          constructor(public config: {{configType}}) {}
          
          public async {{methodName}}(): Promise<void> {
            console.log('{{greeting}}');
          }
        }
      `
    }
  ],
  variables: [
    {
      name: 'name',
      type: 'string',
      required: true,
      description: 'Class name'
    },
    {
      name: 'configType',
      type: 'string',
      required: false,
      default: 'Config',
      description: 'Configuration type'
    }
  ]
};
```

### 3. Hook System

```typescript
// hooks.ts
export const myHooks: Hook[] = [
  {
    name: 'pre-command',
    event: 'before:command',
    handler: async (context) => {
      console.log(`About to execute: ${context.command}`);
    }
  },
  {
    name: 'post-command',
    event: 'after:command',
    handler: async (context) => {
      console.log(`Command completed: ${context.command}`);
    }
  }
];
```

## Advanced Usage

### Security Sandboxing

```typescript
import { SecuritySandbox } from '@cortex/cli/extensibility';

const sandbox = new SecuritySandbox({
  maxMemory: 100 * 1024 * 1024, // 100MB
  maxExecutionTime: 5000, // 5 seconds
  allowedModules: ['fs', 'path'],
  deniedModules: ['child_process', 'os']
});

const result = await sandbox.execute(pluginCode);
```

### Performance Optimization

```typescript
import { CortexPerformanceOptimizer } from '@cortex/cli/extensibility';

const optimizer = new CortexPerformanceOptimizer({
  cacheSize: 1000,
  compressionEnabled: true,
  lazyLoading: true
});

// Optimize a plugin
const optimizedPlugin = await optimizer.optimizePlugin(plugin);

// Enable caching
await optimizer.enableCaching('templates');

// Collect metrics
const metrics = optimizer.getMetrics();
```

### GitHub Integration

```typescript
import { GitHubInstaller } from '@cortex/cli/extensibility';

const installer = new GitHubInstaller();

// Install from GitHub
const result = await installer.installFromGitHub('user/repo');

// Search plugins
const plugins = await installer.searchPlugins('template');
```

## Best Practices

### 1. Plugin Development

- Use TypeScript for type safety
- Follow the plugin interface contract
- Implement proper error handling
- Use the security sandbox for untrusted code
- Optimize for performance

### 2. Template Design

- Use clear variable names
- Provide helpful descriptions
- Include validation rules
- Support conditional logic
- Test with various inputs

### 3. Hook Implementation

- Keep hooks lightweight
- Avoid blocking operations
- Use proper error handling
- Document hook behavior
- Test hook interactions

### 4. Security Considerations

- Validate all inputs
- Use the security sandbox
- Limit resource usage
- Sanitize user data
- Follow principle of least privilege

## Examples

### Example 1: Database Plugin

```typescript
export const databasePlugin: CortexPlugin = {
  name: 'database-plugin',
  version: '1.0.0',
  description: 'Database management commands',
  commands: [
    {
      name: 'db:create',
      description: 'Create a new database',
      action: async (args, options) => {
        const dbName = args[0];
        if (!dbName) {
          throw new Error('Database name is required');
        }
        // Create database logic
        console.log(`Created database: ${dbName}`);
      }
    }
  ],
  templates: [
    {
      name: 'database-schema',
      description: 'Database schema template',
      files: [
        {
          path: 'schema/{{tableName}}.sql',
          content: `
            CREATE TABLE {{tableName}} (
              id SERIAL PRIMARY KEY,
              {{#each columns}}
              {{name}} {{type}}{{#if nullable}} NULL{{else}} NOT NULL{{/if}},
              {{/each}}
              created_at TIMESTAMP DEFAULT NOW()
            );
          `
        }
      ],
      variables: [
        {
          name: 'tableName',
          type: 'string',
          required: true,
          description: 'Table name'
        },
        {
          name: 'columns',
          type: 'array',
          required: true,
          description: 'Table columns'
        }
      ]
    }
  ],
  hooks: []
};
```

### Example 2: API Generator Plugin

```typescript
export const apiGeneratorPlugin: CortexPlugin = {
  name: 'api-generator',
  version: '1.0.0',
  description: 'Generate API endpoints',
  commands: [
    {
      name: 'generate:api',
      description: 'Generate API endpoint',
      action: async (args, options) => {
        const endpoint = args[0];
        const method = options.method as string || 'GET';
        // Generate API endpoint logic
        console.log(`Generated ${method} endpoint: ${endpoint}`);
      }
    }
  ],
  templates: [
    {
      name: 'api-endpoint',
      description: 'API endpoint template',
      files: [
        {
          path: 'src/api/{{endpoint}}.ts',
          content: `
            import { Request, Response } from 'express';
            
            export const {{method}}{{endpoint}} = async (req: Request, res: Response) => {
              try {
                // {{description}}
                const result = await {{serviceName}}.{{method}}(req.body);
                res.json(result);
              } catch (error) {
                res.status(500).json({ error: error.message });
              }
            };
          `
        }
      ],
      variables: [
        {
          name: 'endpoint',
          type: 'string',
          required: true,
          description: 'Endpoint path'
        },
        {
          name: 'method',
          type: 'string',
          required: true,
          description: 'HTTP method'
        },
        {
          name: 'description',
          type: 'string',
          required: false,
          description: 'Endpoint description'
        }
      ]
    }
  ],
  hooks: []
};
```

## Troubleshooting

### Common Issues

1. **Plugin Loading Errors**
   - Check plugin structure
   - Verify TypeScript compilation
   - Check security sandbox settings

2. **Template Rendering Issues**
   - Validate template syntax
   - Check variable definitions
   - Verify template engine configuration

3. **Performance Problems**
   - Enable caching
   - Use performance optimizer
   - Check memory usage

4. **Security Concerns**
   - Review sandbox configuration
   - Validate input data
   - Check resource limits

### Debug Mode

Enable debug mode to get detailed logging:

```bash
DEBUG=cortex:cli:* npm run cli
```

## API Reference

### Plugin Interface

```typescript
interface CortexPlugin {
  name: string;
  version: string;
  description: string;
  commands: CLICommand[];
  templates: Template[];
  hooks: Hook[];
}
```

### Template Interface

```typescript
interface Template {
  name: string;
  description: string;
  files: TemplateFile[];
  variables: TemplateVariable[];
}
```

### Hook Interface

```typescript
interface Hook {
  name: string;
  event: string;
  handler: (context: HookContext) => Promise<void>;
}
```

## Contributing

1. Follow the coding standards
2. Write comprehensive tests
3. Update documentation
4. Submit pull requests
5. Follow the security guidelines

## License

This project is licensed under the MIT License.