/**
 * Build command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { existsSync } from 'fs';
import { join } from 'path';
import type { CLICommand } from '../types.js';
import { colors } from '../utils/colors.js';
import { processUtils } from '../utils/process.js';

/**
 * Build command
 */
export const buildCommand: CLICommand = {
  name: 'build',
  description: 'Build project for production',
  options: [
    {
      name: 'minify',
      alias: 'm',
      description: 'Minify output',
      type: 'boolean',
      default: true,
    },
    {
      name: 'sourcemap',
      alias: 's',
      description: 'Generate source maps',
      type: 'boolean',
      default: true,
    },
    {
      name: 'target',
      alias: 't',
      description: 'Build target (node, browser, universal)',
      type: 'string',
      default: 'node',
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

      console.log(colors.info('🔨 Building project...'));

      const minify = options['minify'] as boolean ?? true;
      const sourcemap = options['sourcemap'] as boolean ?? true;
      const target = options['target'] as string ?? 'node';

      console.log(`  Target: ${colors.cyan(target)}`);
      console.log(`  Minify: ${minify ? colors.success('✓') : colors.error('✗')}`);
      console.log(`  Source Maps: ${sourcemap ? colors.success('✓') : colors.error('✗')}`);

      try {
        // Run build script if it exists
        processUtils.execCommand('npm run build');
        console.log(colors.success('\n✅ Build completed successfully!'));
      } catch (error) {
        console.log(colors.error('\n❌ Build failed'));
        process.exit(1);
      }
    } catch (error) {
      console.error(colors.error('❌ Build error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  },
};
