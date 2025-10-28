/**
 * Version command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import type { CLICommand } from '../types.js';
import { colors } from '../utils/colors.js';

/**
 * Version command - displays version information
 */
export const versionCommand: CLICommand = {
  name: 'version',
  description: 'Show version information',
  options: [],
  action: async (_args: string[], _options: Record<string, unknown>): Promise<void> => {
    const packageVersion = '1.0.0';
    const nodeVersion = process.version;
    const platform = `${process.platform}-${process.arch}`;

    console.log(colors.bold('Cortex Framework'));
    console.log();
    console.log(`${colors.cyan('CLI Version:')}    ${packageVersion}`);
    console.log(`${colors.cyan('Node Version:')}   ${nodeVersion}`);
    console.log(`${colors.cyan('Platform:')}       ${platform}`);
    console.log();
  },
};
