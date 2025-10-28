/**
 * Test command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { existsSync } from 'fs';
import { join } from 'path';
import type { CLICommand } from '../types.js';
import { colors } from '../utils/colors.js';
import { processUtils } from '../utils/process.js';

/**
 * Test command
 */
export const testCommand: CLICommand = {
  name: 'test',
  description: 'Run test suite',
  options: [
    {
      name: 'watch',
      alias: 'w',
      description: 'Watch mode',
      type: 'boolean',
      default: false,
    },
    {
      name: 'coverage',
      alias: 'c',
      description: 'Generate coverage report',
      type: 'boolean',
      default: false,
    },
    {
      name: 'filter',
      alias: 'f',
      description: 'Filter tests by pattern',
      type: 'string',
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

      // Check if package.json exists
      const packageJsonPath = join(cwd, 'package.json');
      if (!existsSync(packageJsonPath)) {
        console.log(colors.error('❌ No package.json found'));
        process.exit(1);
        return;
      }

      const watch = options['watch'] as boolean ?? false;
      const coverage = options['coverage'] as boolean ?? false;
      const filter = options['filter'] as string;

      console.log(colors.info('🧪 Running tests...'));

      let command = 'npm test';
      if (watch) {
        command = 'npm run test:watch';
      } else if (coverage) {
        command = 'npm run test:coverage';
      }

      if (filter) {
        console.log(`  Filter: ${colors.cyan(filter)}`);
      }

      try {
        processUtils.execCommand(command);
        console.log(colors.success('\n✅ All tests passed!'));
      } catch (error) {
        console.log(colors.error('\n❌ Tests failed'));
        process.exit(1);
      }
    } catch (error) {
      console.error(colors.error('❌ Test error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  },
};
