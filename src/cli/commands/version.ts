/**
 * Version command implementation
 * Displays version information
 * Zero dependencies, strictest TypeScript configuration
 */

import { colors } from '../utils/colors.js';
import { processOps } from '../utils/process.js';
import type { CLICommand } from '../types.js';

/**
 * Version command
 */
export const versionCommand: CLICommand = {
  name: 'version',
  description: 'Show version information',
  options: [],
  action: async () => {
    console.log('');
    console.log(colors.bold('Cortex Framework CLI'));
    console.log('');
    console.log(colors.info('CLI Version:     ') + colors.cyan('1.0.0'));
    console.log(colors.info('Node.js Version: ') + colors.cyan(processOps.version));
    console.log(colors.info('Platform:        ') + colors.cyan(`${processOps.platform} ${processOps.arch}`));
    console.log('');
  },
};
