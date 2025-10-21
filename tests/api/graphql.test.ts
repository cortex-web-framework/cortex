import { test } from 'node:test';
import assert from 'node:assert';
import { createGraphQLSchema, graphqlMiddleware } from '../../src/api/graphql';
import { IncomingMessage, ServerResponse } from 'node:http';

// Mock Request and Response objects for middleware testing
class MockRequest extends IncomingMessage {
  public url: string = '';
  public method: string = '';
  private _body: string = '';

  constructor(url: string, method: string, body: any = {}) {
    super({} as any);
    this.url = url;
    this.method = method;
    this._body = JSON.stringify(body);
  }

  override on(event: string, listener: (...args: any[]) => void): this {
    if (event === 'data') {
      listener(Buffer.from(this._body));
    } else if (event === 'end') {
      listener();
    }
    return this;
  }
}

class MockResponse extends ServerResponse {
  public headers: Record<string, string> = {};
  public statusCode: number = 200;
  public _endCalled: boolean = false;
  public _data: any[] = [];

  constructor() {
    super({} as any);
  }

  override setHeader(name: string, value: string | number | readonly string[]): this {
    this.headers[name] = value.toString();
    return this;
  }

  override getHeader(name: string): string | undefined {
    return this.headers[name];
  }

  override end(chunk?: any, ...args: any[]): this {
    this._endCalled = true;
    if (chunk) {
      this._data.push(chunk);
    }
    const callback = args.find(arg => typeof arg === 'function');
    if (callback) {
      callback();
    }
    return this;
  }
}

test('createGraphQLSchema should return a GraphQLSchema object', () => {
  const typeDefs = `
    type Query {
      hello: String
    }
  `;
  const resolvers = {
    Query: {
      hello: () => 'Hello world!',
    },
  };
  const schema = createGraphQLSchema(typeDefs, resolvers);
  assert.ok(schema, 'Schema should be created');
  // @ts-ignore
  assert.strictEqual(schema._queryType.hello(), 'Hello world!', 'Resolver should be linked');
});

test('graphqlMiddleware should handle GraphQL queries', async (_t, done) => {
  const typeDefs = `
    type Query {
      hello: String
    }
  `;
  const resolvers = {
    Query: {
      hello: () => 'Hello from GraphQL!',
    },
  };
  const schema = createGraphQLSchema(typeDefs, resolvers);

  const req = new MockRequest('/graphql', 'POST', { query: '{ hello }' });
  const res = new MockResponse();

  const middleware = graphqlMiddleware({ schema });
  await new Promise<void>((resolve) => {
    middleware(req as any, res as any, () => {
      assert.fail('Next should not be called for GraphQL requests');
      resolve();
    });
    // Simulate end of request stream
    req.emit('end');
    setTimeout(resolve, 10); // Allow async operations to complete
  });

  assert.strictEqual(res.statusCode, 200, 'Status code should be 200');
  assert.strictEqual(res.getHeader('Content-Type'), 'application/json', 'Content-Type should be application/json');
  assert.ok(res._endCalled, 'Response should be ended');
  const responseBody = JSON.parse(res._data[0].toString());
  assert.deepStrictEqual(responseBody, { data: { hello: 'Hello from GraphQL!' } }, 'Response body should contain GraphQL result');
  done();
});

test('graphqlMiddleware should call next for non-GraphQL requests', async (t, done) => {
  const typeDefs = `
    type Query {
      hello: String
    }
  `;
  const resolvers = {
    Query: {
      hello: () => 'Hello from GraphQL!',
    },
  };
  const schema = createGraphQLSchema(typeDefs, resolvers);

  const req = new MockRequest('/not-graphql', 'GET');
  const res = new MockResponse();
  let nextCalled = false;

  const middleware = graphqlMiddleware({ schema });
  await new Promise<void>((resolve) => {
    middleware(req as any, res as any, () => {
      nextCalled = true;
      resolve();
    });
    setTimeout(resolve, 10); // Allow async operations to complete
  });

  assert.strictEqual(nextCalled, true, 'Next should be called for non-GraphQL requests');
  assert.strictEqual(res.statusCode, 200, 'Status code should be 200');
  assert.strictEqual(res._endCalled, false, 'Response should not be ended');
  done();
});
