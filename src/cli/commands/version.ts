/**
 * Version command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { CLICommand } from '../types.js';
import { colors } from '../utils/colors.js';

/**
 * Version command
 */
export const versionCommand: CLICommand = {
  name: 'version',
  description: 'Show Cortex CLI version',
  action: async (): Promise<void> => {
    try {
      // Get package.json version
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const packageJson = JSON.parse(readFileSync(join(__dirname, '../../../package.json'), 'utf-8'));

      console.log(colors.bold(`Cortex Framework v${packageJson.version}`));
      console.log(`Node.js ${process.version}`);
      console.log(`Platform: ${process.platform}-${process.arch}`);
    } catch (error) {
      console.error(colors.error('❌ Failed to read version information'));
      process.exit(1);
    }
  },
};
