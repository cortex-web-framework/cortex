/**
 * Project structure generator
 * Zero dependencies, strictest TypeScript configuration
 */

import type { ProjectConfig } from '../types.js';
import { fileUtils } from '../utils/fs.js';
import { writeFileSync } from 'node:fs';

/**
 * Create complete project structure
 */
export async function createProjectStructure(config: ProjectConfig): Promise<void> {
  // Create directory structure
  const directories = [
    'src',
    'src/actors',
    'src/routes',
    'src/middleware',
    'src/services',
    'src/types',
    'src/utils',
    'tests',
    'tests/unit',
    'tests/integration',
    'tests/e2e',
    'public',
    'docs',
  ] as const;
  
  directories.forEach(dir => {
    fileUtils.ensureDir(dir);
  });
  
  // Generate core files
  await generatePackageJson(config);
  await generateTsConfig(config);
  await generateMainFile(config);
  await generateActorSystem(config);
  await generateRoutes(config);
  await generateMiddleware(config);
  await generateTests(config);
  await generateDocs(config);
  await generateDockerFiles(config);
  await generateGitIgnore();
  await generateReadme(config);
}

/**
 * Generate package.json
 */
async function generatePackageJson(config: ProjectConfig): Promise<void> {
  const dependencies: Record<string, string> = {
    '@cortex/framework': '^1.0.0',
  };
  
  const devDependencies: Record<string, string> = {
    '@types/node': '^20.0.0',
    'typescript': '^5.0.0',
    'tsx': '^4.0.0',
  };
  
  // Add testing dependencies
  if (config.testing.framework === 'vitest') {
    devDependencies['vitest'] = '^1.0.0';
    devDependencies['@vitest/ui'] = '^1.0.0';
    devDependencies['@vitest/coverage-v8'] = '^1.0.0';
  } else if (config.testing.framework === 'jest') {
    devDependencies['jest'] = '^29.0.0';
    devDependencies['@types/jest'] = '^29.0.0';
    devDependencies['ts-jest'] = '^29.0.0';
  }
  
  // Add integration dependencies
  if (config.integrations.redis) {
    dependencies['ioredis'] = '^5.0.0';
    devDependencies['@types/ioredis'] = '^5.0.0';
  }
  
  if (config.integrations.postgres) {
    dependencies['pg'] = '^8.0.0';
    devDependencies['@types/pg'] = '^8.0.0';
  }
  
  if (config.integrations.websocket) {
    dependencies['ws'] = '^8.0.0';
    devDependencies['@types/ws'] = '^8.0.0';
  }
  
  if (config.integrations.auth) {
    dependencies['jsonwebtoken'] = '^9.0.0';
    dependencies['bcryptjs'] = '^2.4.3';
    devDependencies['@types/jsonwebtoken'] = '^9.0.0';
    devDependencies['@types/bcryptjs'] = '^2.4.0';
  }
  
  const packageJson = {
    name: config.name,
    version: config.version,
    description: config.description || 'A Cortex Framework application',
    main: 'dist/index.js',
    type: 'module',
    scripts: {
      dev: 'cortex serve',
      build: 'cortex build',
      start: 'node dist/index.js',
      test: 'cortex test',
      'test:watch': 'cortex test --watch',
      'test:coverage': 'cortex test --coverage',
      'test:e2e': 'cortex test --e2e',
      lint: 'cortex lint',
      format: 'cortex format',
      typecheck: 'cortex typecheck',
      deploy: 'cortex deploy',
    },
    dependencies,
    devDependencies,
    engines: {
      node: '>=18.0.0',
    },
    keywords: ['cortex', 'framework', 'actor-system', 'typescript'],
    author: '',
    license: 'MIT',
  };
  
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
}

/**
 * Generate TypeScript configuration
 */
async function generateTsConfig(config: ProjectConfig): Promise<void> {
  if (!config.typescript.enabled) return;
  
  const tsConfig = {
    compilerOptions: {
      target: config.typescript.target,
      module: 'ESNext',
      moduleResolution: 'node',
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      allowJs: true,
      strict: config.typescript.strict,
      noEmit: false,
      declaration: true,
      outDir: './dist',
      rootDir: './src',
      resolveJsonModule: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      types: ['node'],
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', 'tests'],
  };
  
  writeFileSync('tsconfig.json', JSON.stringify(tsConfig, null, 2));
}

/**
 * Generate main application file
 */
async function generateMainFile(config: ProjectConfig): Promise<void> {
  const extension = config.typescript.enabled ? 'ts' : 'js';
  const content = `import { CortexHttpServer } from '@cortex/framework';
import { ActorSystem } from '@cortex/framework';
import { EventBus } from '@cortex/framework';
import { Logger } from '@cortex/framework';
import { MetricsCollector } from '@cortex/framework';
import { Tracer } from '@cortex/framework';
import { HealthCheckRegistry } from '@cortex/framework';

// Initialize core systems
const eventBus = EventBus.getInstance();
const logger = Logger.getInstance();
const actorSystem = new ActorSystem(eventBus, {
  enableMetrics: true,
  enableTracing: true,
  serviceName: '${config.name}',
});

// Initialize observability
const metricsCollector = new MetricsCollector();
const tracer = new Tracer({ serviceName: '${config.name}' });
const healthRegistry = new HealthCheckRegistry();

// Create HTTP server
const server = new CortexHttpServer(parseInt(process.env["PORT"] || '${config.devServer.port}'));

// Add observability middleware
server.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metricsCollector.createCounter('http_requests_total', 'Total HTTP requests').inc();
    metricsCollector.createHistogram('http_request_duration_seconds', 'HTTP request duration').observe(duration / 1000);
  });
  
  next();
});

// Health check endpoint
server.get('/health', async (req, res) => {
  const results = await healthRegistry.checkAll();
  const overallStatus = await healthRegistry.getOverallStatus();
  
  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks: Object.fromEntries(results),
  });
});

// Metrics endpoint
server.get('/metrics', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(metricsCollector.toPrometheusFormat());
});

// Example route
server.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Cortex Framework!',
    version: '${config.version}',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const start = async () => {
  try {
    await server.start();
    logger.info(\`🚀 Server running on port \${server.port}\`);
    logger.info(\`📊 Metrics available at http://localhost:\${server.port}/metrics\`);
    logger.info(\`🏥 Health check at http://localhost:\${server.port}/health\`);
  } catch (error) {
    logger["error"]('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await server.stop();
  process.exit(0);
});

start();
`;

  writeFileSync(`src/index.${extension}`, content);
}

/**
 * Generate Actor System setup
 */
async function generateActorSystem(config: ProjectConfig): Promise<void> {
  const extension = config.typescript.enabled ? 'ts' : 'js';
  
  const content = `import { Actor } from '@cortex/framework';

/**
 * Example Actor
 */
export class ExampleActor extends Actor {
  constructor(id: string, system: any) {
    super(id, system);
  }

  async receive(message: any): Promise<void> {
    console.log(\`Actor \${this.id} received message:\`, message);
    
    // Process message here
    // You can send messages to other actors, update state, etc.
  }
}

/**
 * Actor Supervisor
 */
export class ActorSupervisor extends Actor {
  private children: Map<string, Actor> = new Map();

  constructor(id: string, system: any) {
    super(id, system);
  }

  async receive(message: any): Promise<void> {
    if (message.type === 'create_actor') {
      const actorId = message.actorId;
      const ActorClass = message.ActorClass;
      
      try {
        const actor = new ActorClass(actorId, this.system);
        this.children.set(actorId, actor);
        console.log(\`Created actor: \${actorId}\`);
      } catch (error) {
        console["error"](\`Failed to create actor \${actorId}:\`, error);
      }
    }
  }
}
`;

  writeFileSync(`src/actors/ExampleActor.${extension}`, content);
}

/**
 * Generate routes
 */
async function generateRoutes(config: ProjectConfig): Promise<void> {
  const extension = config.typescript.enabled ? 'ts' : 'js';
  
  const content = `import http from 'node:http';

type Request = http.IncomingMessage;
type Response = http.ServerResponse;

/**
 * API Routes
 */
export const apiRoutes = (app: any) => {
  // Example API route
  app.get('/api/status', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }));
  });

  // Example POST route
  app.post('/api/echo', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      message: 'Echo: ' + req.body?.message,
      timestamp: new Date().toISOString(),
    }));
  });
};
`;

  writeFileSync(`src/routes/api.${extension}`, content);
}

/**
 * Generate middleware
 */
async function generateMiddleware(config: ProjectConfig): Promise<void> {
  const extension = config.typescript.enabled ? 'ts' : 'js';
  
  const content = `import http from 'node:http';

type Request = http.IncomingMessage;
type Response = http.ServerResponse;
type NextFunction = () => void;

/**
 * CORS middleware
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
  } else {
    next();
  }
};

/**
 * Request logging middleware
 */
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(\`\${req.method} \${req.url} - \${res.statusCode} (\${duration}ms)\`);
  });
  
  next();
};

/**
 * Error handling middleware
 */
export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console["error"]('Error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env["NODE_ENV"] === 'development' ? err.message : 'Something went wrong',
  });
};
`;

  writeFileSync(`src/middleware/index.${extension}`, content);
}

/**
 * Generate test files
 */
async function generateTests(config: ProjectConfig): Promise<void> {
  if (config.testing.framework === 'none') return;
  
  const extension = config.typescript.enabled ? 'ts' : 'js';
  
  // Unit tests
  const unitTestContent = `import { describe, it, expect } from '${config.testing.framework === 'vitest' ? 'vitest' : 'jest'}';
import { ExampleActor } from '../src/actors/ExampleActor';

describe('ExampleActor', () => {
  it('should create actor instance', () => {
    const actor = new ExampleActor('test-actor', null);
    expect(actor).toBeDefined();
    expect(actor.id).toBe('test-actor');
  });
});
`;

  writeFileSync(`tests/unit/ExampleActor.test.${extension}`, unitTestContent);
  
  // Integration tests
  const integrationTestContent = `import { describe, it, expect } from '${config.testing.framework === 'vitest' ? 'vitest' : 'jest'}';
import { CortexHttpServer } from '@cortex/framework';

describe('API Integration Tests', () => {
  let server: CortexHttpServer;

  beforeAll(async () => {
    server = new CortexHttpServer(3001);
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should respond to health check', async () => {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.status).toBeDefined();
  });
});
`;

  writeFileSync(`tests/integration/api.test.${extension}`, integrationTestContent);
}

/**
 * Generate documentation
 */
async function generateDocs(config: ProjectConfig): Promise<void> {
  const readmeContent = `# ${config.name}

${config.description || 'A Cortex Framework application'}

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

### Building

\`\`\`bash
npm run build
\`\`\`

### Testing

\`\`\`bash
npm test
\`\`\`

## Project Structure

\`\`\`
src/
├── actors/          # Actor System components
├── routes/          # API routes
├── middleware/      # Node.js HTTP middleware
├── services/        # Business logic services
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
\`\`\`

## Features

- ✅ Actor System architecture
- ✅ TypeScript support
- ✅ Built-in observability (metrics, tracing, health checks)
- ✅ Hot Module Replacement
- ✅ Comprehensive testing setup
${config.integrations.redis ? '- ✅ Redis integration' : ''}
${config.integrations.postgres ? '- ✅ PostgreSQL integration' : ''}
${config.integrations.websocket ? '- ✅ WebSocket support' : ''}
${config.integrations.auth ? '- ✅ Authentication system' : ''}

## API Endpoints

- \`GET /health\` - Health check
- \`GET /metrics\` - Prometheus metrics
- \`GET /\` - Welcome message

## License

MIT
`;

  writeFileSync('README.md', readmeContent);
}

/**
 * Generate Docker files
 */
async function generateDockerFiles(config: ProjectConfig): Promise<void> {
  const dockerfileContent = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE ${config.devServer.port}

CMD ["node", "dist/index.js"]
`;

  writeFileSync('Dockerfile', dockerfileContent);
  
  const dockerComposeContent = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "${config.devServer.port}:${config.devServer.port}"
    environment:
      - NODE_ENV=production
      - PORT=${config.devServer.port}
${config.integrations.redis ? `    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"` : ''}
${config.integrations.postgres ? `
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${config.name}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data` : ''}

volumes:
${config.integrations.postgres ? '  postgres_data:' : ''}
`;

  writeFileSync('docker-compose.yml', dockerComposeContent);
}

/**
 * Generate .gitignore
 */
async function generateGitIgnore(): Promise<void> {
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
.next/
.nuxt/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;

  writeFileSync('.gitignore', gitignoreContent);
}

/**
 * Generate README
 */
async function generateReadme(_config: ProjectConfig): Promise<void> {
  // This is handled by generateDocs
}