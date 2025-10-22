# CLI Extensibility Examples

This directory contains practical examples of how to use the Cortex CLI Extensibility System.

## Examples Overview

1. **Basic Plugin** - Simple plugin with commands and templates
2. **Database Plugin** - Database management commands and templates
3. **API Generator** - Generate API endpoints and documentation
4. **Testing Plugin** - Testing utilities and templates
5. **Deployment Plugin** - Deployment automation and templates

## Getting Started

1. Install the Cortex CLI:
   ```bash
   npm install -g @cortex/cli
   ```

2. Navigate to an example directory:
   ```bash
   cd examples/cli-extensibility/basic-plugin
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the plugin:
   ```bash
   npm run build
   ```

5. Load the plugin:
   ```bash
   cortex plugin load ./dist/plugin.js
   ```

## Example Structure

Each example follows this structure:

```
example-name/
├── README.md           # Example documentation
├── package.json        # Plugin package configuration
├── src/
│   ├── plugin.ts       # Main plugin implementation
│   ├── commands/       # Command implementations
│   ├── templates/      # Template definitions
│   └── hooks/          # Hook implementations
├── tests/              # Plugin tests
└── dist/               # Built plugin output
```

## Available Examples

### 1. Basic Plugin

A simple plugin demonstrating basic functionality:

- **Commands**: `hello`, `version`
- **Templates**: `greeting`, `config`
- **Hooks**: `pre-command`, `post-command`

**Usage:**
```bash
cortex hello --name "World"
cortex generate greeting --name "World" --output "greeting.txt"
```

### 2. Database Plugin

Database management commands and templates:

- **Commands**: `db:create`, `db:migrate`, `db:seed`
- **Templates**: `database-schema`, `migration`, `model`
- **Hooks**: `pre-migration`, `post-migration`

**Usage:**
```bash
cortex db:create --name "myapp"
cortex generate database-schema --table "users" --output "schema.sql"
```

### 3. API Generator

Generate API endpoints and documentation:

- **Commands**: `generate:api`, `generate:docs`
- **Templates**: `api-endpoint`, `api-docs`, `api-test`
- **Hooks**: `pre-generation`, `post-generation`

**Usage:**
```bash
cortex generate:api --endpoint "users" --method "GET"
cortex generate:docs --output "api-docs.md"
```

### 4. Testing Plugin

Testing utilities and templates:

- **Commands**: `test:unit`, `test:integration`, `test:e2e`
- **Templates**: `test-suite`, `test-case`, `mock`
- **Hooks**: `pre-test`, `post-test`

**Usage:**
```bash
cortex test:unit --path "src/components"
cortex generate test-suite --component "Button" --output "Button.test.ts"
```

### 5. Deployment Plugin

Deployment automation and templates:

- **Commands**: `deploy:staging`, `deploy:production`, `rollback`
- **Templates**: `dockerfile`, `k8s-manifest`, `helm-chart`
- **Hooks**: `pre-deploy`, `post-deploy`

**Usage:**
```bash
cortex deploy:staging --environment "staging"
cortex generate dockerfile --runtime "node" --output "Dockerfile"
```

## Plugin Development

### Creating a New Plugin

1. Create a new directory:
   ```bash
   mkdir my-plugin
   cd my-plugin
   ```

2. Initialize package.json:
   ```bash
   npm init -y
   ```

3. Install dependencies:
   ```bash
   npm install @cortex/cli
   ```

4. Create the plugin structure:
   ```bash
   mkdir -p src/{commands,templates,hooks}
   ```

5. Implement your plugin:
   ```typescript
   // src/plugin.ts
   import { CortexPlugin } from '@cortex/cli/extensibility';
   
   export const plugin: CortexPlugin = {
     name: 'my-plugin',
     version: '1.0.0',
     description: 'My custom plugin',
     commands: [],
     templates: [],
     hooks: []
   };
   ```

6. Build and test:
   ```bash
   npm run build
   npm test
   ```

### Plugin Configuration

Each plugin should have a `package.json` with the following structure:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My custom plugin",
  "main": "dist/plugin.js",
  "types": "dist/plugin.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@cortex/cli": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  },
  "cortex": {
    "plugin": true,
    "entry": "dist/plugin.js"
  }
}
```

## Testing

Each example includes comprehensive tests:

```bash
# Run all tests
npm test

# Run specific test
npm test -- --testNamePattern="command"

# Run with coverage
npm test -- --coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your example
4. Write tests
5. Submit a pull request

## License

This project is licensed under the MIT License.