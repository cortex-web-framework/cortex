import { test } from 'node:test';
import assert from 'node:assert';
import { createGraphQLSchema, graphqlMiddleware } from '../../src/api/graphql.js';
import { IncomingMessage, ServerResponse } from 'node:http';

// Mock Request and Response objects for middleware testing
const createMockRequest = (url: string, method: string, body: any = {}) => {
  const req = {
    url,
    method,
    headers: {},
    on: (event: string, listener: (...args: any[]) => void) => {
      if (event === 'data') {
        listener(Buffer.from(JSON.stringify(body)));
      } else if (event === 'end') {
        listener();
      }
    },
  };
  return req as unknown as IncomingMessage;
};

const createMockResponse = () => {
  const res = {
    headers: {} as Record<string, string>,
    statusCode: 200,
    _endCalled: false,
    _data: [] as any[],
    setHeader: function(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    getHeader: function(name: string) {
      return this.headers[name];
    },
    end: function(chunk?: any) {
      this._endCalled = true;
      if (chunk) {
        this._data.push(chunk);
      }
      return this;
    },
  };
  return res as unknown as ServerResponse;
};

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
  assert.strictEqual(schema.query.hello(), 'Hello world!', 'Resolver should be linked');
});

test('graphqlMiddleware should handle GraphQL queries', async () => {
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

  const req = createMockRequest('/graphql', 'POST', { query: '{ hello }' });
  const res = createMockResponse();

  const middleware = graphqlMiddleware({ schema });
  await new Promise<void>((resolve) => {
    middleware(req, res, () => {
      assert.fail('Next should not be called for GraphQL requests');
      resolve();
    });
    // Simulate end of request stream
    req.on('end', () => {});
    setTimeout(resolve, 10); // Allow async operations to complete
  });

  assert.strictEqual(res.statusCode, 200, 'Status code should be 200');
  assert.strictEqual(res.getHeader('Content-Type'), 'application/json', 'Content-Type should be application/json');
  assert.ok((res as any)._endCalled, 'Response should be ended');
  const responseBody = JSON.parse((res as any)._data[0].toString());
  assert.deepStrictEqual(responseBody, { data: { hello: 'Hello from GraphQL!' } }, 'Response body should contain GraphQL result');
});

test('graphqlMiddleware should call next for non-GraphQL requests', async () => {
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

  const req = createMockRequest('/not-graphql', 'GET');
  const res = createMockResponse();
  let nextCalled = false;

  const middleware = graphqlMiddleware({ schema });
  await new Promise<void>((resolve) => {
    middleware(req, res, () => {
      nextCalled = true;
      resolve();
    });
    setTimeout(resolve, 10); // Allow async operations to complete
  });

  assert.strictEqual(nextCalled, true, 'Next should be called for non-GraphQL requests');
  assert.strictEqual(res.statusCode, 200, 'Status code should be 200');
  assert.strictEqual((res as any)._endCalled, false, 'Response should not be ended');
});
