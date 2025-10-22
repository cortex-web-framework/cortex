/**
 * Version Command
 * Display plugin version information
 */

import type { CLICommand } from '@cortex/cli/extensibility';

export const versionCommand: CLICommand = {
  name: 'version',
  description: 'Display plugin version information',
  options: [
    {
      name: 'verbose',
      alias: 'v',
      type: 'boolean',
      description: 'Show verbose version information',
      default: false
    }
  ],
  action: async (args: string[], options: Record<string, unknown>): Promise<void> => {
    const verbose = options['verbose'] as boolean;
    
    if (verbose) {
      console.log('Basic Plugin Version Information:');
      console.log('  Name: basic-plugin');
      console.log('  Version: 1.0.0');
      console.log('  Description: Basic plugin example demonstrating CLI extensibility');
      console.log('  Node.js Version:', process.version);
      console.log('  Platform:', process.platform);
      console.log('  Architecture:', process.arch);
    } else {
      console.log('1.0.0');
    }
  }
};