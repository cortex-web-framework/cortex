/**
 * Serve command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { existsSync } from 'fs';
import { join } from 'path';
import type { CLICommand } from '../types.js';
import { colors } from '../utils/colors.js';

/**
 * Serve command
 */
export const serveCommand: CLICommand = {
  name: 'serve',
  description: 'Start development server',
  options: [
    {
      name: 'port',
      alias: 'p',
      description: 'Port to run server on',
      type: 'number',
    },
    {
      name: 'host',
      description: 'Host to bind to',
      type: 'string',
      default: 'localhost',
    },
    {
      name: 'open',
      alias: 'o',
      description: 'Open browser on start',
      type: 'boolean',
      default: false,
    },
  ],
  action: async (_args: string[], options: Record<string, unknown>): Promise<void> => {
    try {
      const cwd = process.cwd();

      // Check if this is a Cortex project
      const configPath = join(cwd, 'cortex.json');
      if (!existsSync(configPath)) {
        console.log(colors.warning('⚠️  No Cortex project found in current directory'));
        console.log(`Run ${colors.cyan('cortex create <name>')} to create a new project`);
        process.exit(1);
        return;
      }

      const port = options['port'] as number ?? 3000;
      const host = options['host'] as string ?? 'localhost';

      console.log(colors.info(`🚀 Starting development server on http://${host}:${port}...`));
      console.log(colors.warning('\n⚠️  Development server functionality will be available in v1.1.0'));
      console.log('\nFor now, you can run your Cortex application manually:');
      console.log(`  ${colors.cyan('npm start')}`);
      console.log(`  ${colors.cyan('node dist/index.js')}`);
    } catch (error) {
      console.error(colors.error('❌ Failed to start development server:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  },
};
