/**
 * ExampleActor - Manages and executes code examples
 * Provides pre-built Cortex code examples and output
 */

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  category: 'actor' | 'eventbus' | 'http' | 'resilience' | 'middleware';
  code: string;
  expectedOutput: string;
  tags: string[];
}

export type ExampleMessage =
  | { type: 'get-examples'; category?: string }
  | { type: 'get-example'; id: string }
  | { type: 'run-example'; id: string }
  | { type: 'list-categories' }
  | { type: 'search'; query: string };

export interface ExampleResponse {
  success: boolean;
  data?: CodeExample | CodeExample[] | string[];
  output?: string;
  metadata?: {
    total: number;
    categories?: { [key: string]: number };
  };
  error?: string;
  message?: string;
}

export class ExampleActor {
  private examples: Map<string, CodeExample> = new Map();
  private idCounter: number = 1;

  constructor() {
    this.initializeExamples();
  }

  /**
   * Initialize with example code snippets
   */
  private initializeExamples(): void {
    const examples = [
      {
        title: 'Creating Your First Actor',
        description: 'Learn how to create and use a basic actor',
        category: 'actor' as const,
        code: `import { ActorSystem, EventBus } from 'cortex';

const eventBus = EventBus.getInstance();
const actorSystem = new ActorSystem(eventBus);

class GreeterActor {
  async handle(message: any) {
    console.log(\`Hello, \${message.name}!\`);
  }
}

const greeter = actorSystem.createActor(GreeterActor);
greeter.send({ name: 'Cortex' });`,
        expectedOutput: 'Hello, Cortex!',
        tags: ['basic', 'actor', 'beginner'],
      },
      {
        title: 'Using the Event Bus',
        description: 'Publish and subscribe to events',
        category: 'eventbus' as const,
        code: `import { EventBus } from 'cortex';

const bus = EventBus.getInstance();

bus.on('user:created', (event) => {
  console.log(\`User created: \${event.userId}\`);
});

bus.emit('user:created', {
  userId: 'user-123',
  email: 'user@example.com'
});`,
        expectedOutput: 'User created: user-123',
        tags: ['eventbus', 'pubsub', 'intermediate'],
      },
      {
        title: 'Building a REST Endpoint',
        description: 'Create a simple HTTP GET endpoint',
        category: 'http' as const,
        code: `import { CortexHttpServer } from 'cortex';

const server = new CortexHttpServer(3000);

server.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({
    id: userId,
    name: 'John Doe'
  }));
});

await server.start();
console.log('Server listening on port 3000');`,
        expectedOutput: '{"id":"123","name":"John Doe"}',
        tags: ['http', 'rest', 'intermediate'],
      },
      {
        title: 'Using Middleware',
        description: 'Add middleware to your routes',
        category: 'middleware' as const,
        code: `const server = new CortexHttpServer(3000);

// Global middleware
server.use((req, res, next) => {
  console.log(\`[\${req.method}] \${req.url}\`);
  next();
});

// Route with middleware
server.get('/protected',
  authMiddleware,
  (req, res) => {
    res.end('Protected endpoint');
  }
);`,
        expectedOutput: '[GET] /protected\nProtected endpoint',
        tags: ['middleware', 'advanced'],
      },
      {
        title: 'Circuit Breaker Pattern',
        description: 'Implement fault tolerance with circuit breaker',
        category: 'resilience' as const,
        code: `import { CircuitBreaker } from 'cortex/resilience';

const breaker = new CircuitBreaker({
  threshold: 5,
  timeout: 60000
});

async function unreliableOperation() {
  return breaker.execute(async () => {
    // Your operation here
    return await fetchExternalAPI();
  });
}`,
        expectedOutput: 'Circuit breaker protects against cascading failures',
        tags: ['resilience', 'advanced', 'fault-tolerance'],
      },
      {
        title: 'Error Handling in Actors',
        description: 'Handle errors gracefully in actor messages',
        category: 'actor' as const,
        code: `class SafeActor {
  async handle(message: any) {
    try {
      if (!message.value) {
        throw new Error('Missing required field');
      }
      console.log(\`Processing: \${message.value}\`);
    } catch (error) {
      console.error(\`Error: \${error.message}\`);
    }
  }
}`,
        expectedOutput: 'Error: Missing required field',
        tags: ['actor', 'error-handling', 'intermediate'],
      },
    ];

    examples.forEach(example => {
      const id = `example-${this.idCounter++}`;
      this.examples.set(id, { ...example, id });
    });
  }

  /**
   * Handle incoming messages
   */
  async handle(message: ExampleMessage): Promise<ExampleResponse> {
    try {
      switch (message.type) {
        case 'get-examples':
          return this.getExamples(message.category);
        case 'get-example':
          return this.getExample(message.id);
        case 'run-example':
          return this.runExample(message.id);
        case 'list-categories':
          return this.listCategories();
        case 'search':
          return this.searchExamples(message.query);
        default:
          return {
            success: false,
            error: 'Unknown message type',
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all examples, optionally filtered by category
   */
  private getExamples(category?: string): ExampleResponse {
    let examples = Array.from(this.examples.values());

    if (category) {
      examples = examples.filter(e => e.category === category);
    }

    return {
      success: true,
      data: examples,
      metadata: {
        total: examples.length,
      },
    };
  }

  /**
   * Get a specific example
   */
  private getExample(id: string): ExampleResponse {
    const example = this.examples.get(id);

    if (!example) {
      return {
        success: false,
        error: `Example with id "${id}" not found`,
      };
    }

    return {
      success: true,
      data: example,
    };
  }

  /**
   * Run an example and return the output
   * Note: This is a simplified version that returns the expected output
   * In production, you might use a sandboxed environment like vm2 or a separate service
   */
  private runExample(id: string): ExampleResponse {
    const example = this.examples.get(id);

    if (!example) {
      return {
        success: false,
        error: `Example with id "${id}" not found`,
      };
    }

    // In production, you would safely execute the code here
    // For now, we return the expected output
    return {
      success: true,
      data: example,
      output: example.expectedOutput,
      message: `Example "${example.title}" executed successfully`,
    };
  }

  /**
   * List all categories with counts
   */
  private listCategories(): ExampleResponse {
    const categories: { [key: string]: number } = {};

    this.examples.forEach(example => {
      categories[example.category] = (categories[example.category] || 0) + 1;
    });

    return {
      success: true,
      data: Object.keys(categories),
      metadata: {
        total: Object.keys(categories).length,
        categories,
      },
    };
  }

  /**
   * Search examples by title, description, or tags
   */
  private searchExamples(query: string): ExampleResponse {
    const lowerQuery = query.toLowerCase();
    const results = Array.from(this.examples.values()).filter(
      example =>
        example.title.toLowerCase().includes(lowerQuery) ||
        example.description.toLowerCase().includes(lowerQuery) ||
        example.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    return {
      success: true,
      data: results,
      metadata: {
        total: results.length,
      },
    };
  }
}
