/**
 * Hello Command
 * Simple greeting command
 */

import type { CLICommand } from '@cortex/cli/extensibility';

export const helloCommand: CLICommand = {
  name: 'hello',
  description: 'Say hello to someone',
  options: [
    {
      name: 'name',
      alias: 'n',
      type: 'string',
      description: 'Name to greet',
      required: true
    },
    {
      name: 'formal',
      alias: 'f',
      type: 'boolean',
      description: 'Use formal greeting',
      default: false
    }
  ],
  action: async (args: string[], options: Record<string, unknown>): Promise<void> => {
    const name = options['name'] as string;
    const formal = options['formal'] as boolean;
    
    if (!name) {
      throw new Error('Name is required');
    }
    
    const greeting = formal 
      ? `Good day, ${name}. It is a pleasure to meet you.`
      : `Hello, ${name}! Nice to meet you.`;
    
    console.log(greeting);
  }
};