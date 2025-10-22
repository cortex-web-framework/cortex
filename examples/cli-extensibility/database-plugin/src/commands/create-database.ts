/**
 * Create Database Command
 * Creates a new database
 */

import type { CLICommand } from '@cortex/cli/extensibility';

export const createDatabaseCommand: CLICommand = {
  name: 'db:create',
  description: 'Create a new database',
  options: [
    {
      name: 'name',
      alias: 'n',
      type: 'string',
      description: 'Database name',
      required: true
    },
    {
      name: 'type',
      alias: 't',
      type: 'string',
      description: 'Database type',
      choices: ['postgresql', 'mysql', 'sqlite', 'mongodb'],
      default: 'postgresql'
    },
    {
      name: 'host',
      type: 'string',
      description: 'Database host',
      default: 'localhost'
    },
    {
      name: 'port',
      type: 'number',
      description: 'Database port',
      default: 5432
    },
    {
      name: 'username',
      alias: 'u',
      type: 'string',
      description: 'Database username',
      default: 'postgres'
    },
    {
      name: 'password',
      alias: 'p',
      type: 'string',
      description: 'Database password'
    }
  ],
  action: async (args: string[], options: Record<string, unknown>): Promise<void> => {
    const name = options['name'] as string;
    const type = options['type'] as string;
    const host = options['host'] as string;
    const port = options['port'] as number;
    const username = options['username'] as string;
    const password = options['password'] as string;
    
    if (!name) {
      throw new Error('Database name is required');
    }
    
    console.log(`Creating ${type} database: ${name}`);
    console.log(`Host: ${host}:${port}`);
    console.log(`Username: ${username}`);
    
    // Simulate database creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ Database '${name}' created successfully!`);
    
    // Generate connection string
    const connectionString = generateConnectionString(type, host, port, username, password, name);
    console.log(`Connection string: ${connectionString}`);
  }
};

function generateConnectionString(
  type: string,
  host: string,
  port: number,
  username: string,
  password: string,
  database: string
): string {
  switch (type) {
    case 'postgresql':
      return `postgresql://${username}:${password}@${host}:${port}/${database}`;
    case 'mysql':
      return `mysql://${username}:${password}@${host}:${port}/${database}`;
    case 'sqlite':
      return `sqlite:${database}.db`;
    case 'mongodb':
      return `mongodb://${username}:${password}@${host}:${port}/${database}`;
    default:
      return `unknown://${host}:${port}/${database}`;
  }
}