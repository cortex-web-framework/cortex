import { IncomingMessage, ServerResponse } from 'node:http';
import { buildSchema, GraphQLSchema, graphql } from 'graphql';

// Utility for defining GraphQL schemas
export function createGraphQLSchema(typeDefs: string, resolvers: any): GraphQLSchema {
  const schema = buildSchema(typeDefs);
  // Attach resolvers to the schema
  // This is a simplified approach. In a real app, you'd use makeExecutableSchema from @graphql-tools/schema
  // or similar to properly link resolvers.
  return new GraphQLSchema({
    query: schema.getQueryType(),
    mutation: schema.getMutationType(),
    subscription: schema.getSubscriptionType(),
    // @ts-ignore - This is a simplified example, direct assignment is not how it works with graphql-js
    _queryType: resolvers.Query,
    _mutationType: resolvers.Mutation,
    _subscriptionType: resolvers.Subscription,
  });
}

interface GraphQLOptions {
  schema: GraphQLSchema;
  context?: (req: IncomingMessage, res: ServerResponse) => any;
}

export function graphqlMiddleware(options: GraphQLOptions) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url === '/graphql' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const { query, variables } = JSON.parse(body);
          const contextValue = options.context ? options.context(req, res) : {};
          const result = await graphql({
            schema: options.schema,
            source: query,
            variableValues: variables,
            contextValue: contextValue,
          });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (error: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ errors: [{ message: error.message }] }));
        }
      });
    } else {
      next();
    }
  };
}
