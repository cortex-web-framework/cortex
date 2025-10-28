/**
 * Info command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { CLICommand, ProjectConfig } from '../types.js';
import { colors } from '../utils/colors.js';

/**
 * Info command
 */
export const infoCommand: CLICommand = {
  name: 'info',
  description: 'Show project information',
  action: async (): Promise<void> => {
    try {
      const cwd = process.cwd();

      // Check if cortex.json exists
      const configPath = join(cwd, 'cortex.json');
      if (!existsSync(configPath)) {
        console.log(colors.warning('⚠️  No Cortex project found in current directory'));
        console.log(`Run ${colors.cyan('cortex create <name>')} to create a new project`);
        return;
      }

      // Read project configuration
      const configContent = readFileSync(configPath, 'utf-8');
      const config: ProjectConfig = JSON.parse(configContent);

      // Display project information
      console.log(colors.bold('\n📦 Project Information\n'));
      console.log(`${colors.bold('Name:')}        ${colors.cyan(config.name)}`);
      console.log(`${colors.bold('Version:')}     ${config.version}`);
      if (config.description) {
        console.log(`${colors.bold('Description:')} ${config.description}`);
      }

      console.log(colors.bold('\n⚙️  Configuration\n'));
      console.log(`${colors.bold('TypeScript:')}  ${config.typescript.enabled ? colors.success('✓') : colors.error('✗')}`);
      console.log(`${colors.bold('Testing:')}     ${config.testing.framework}`);
      console.log(`${colors.bold('Dev Server:')}  http://${config.devServer.host}:${config.devServer.port}`);

      if (config.integrations.redis || config.integrations.postgres || config.integrations.websocket || config.integrations.auth) {
        console.log(colors.bold('\n🔌 Integrations\n'));
        if (config.integrations.redis) console.log(`  ${colors.success('✓')} Redis`);
        if (config.integrations.postgres) console.log(`  ${colors.success('✓')} PostgreSQL`);
        if (config.integrations.websocket) console.log(`  ${colors.success('✓')} WebSocket`);
        if (config.integrations.auth) console.log(`  ${colors.success('✓')} Authentication`);
      }

      console.log(colors.bold('\n🏗️  Build Configuration\n'));
      console.log(`${colors.bold('Target:')}      ${config.build.target}`);
      console.log(`${colors.bold('Minify:')}      ${config.build.minify ? colors.success('✓') : colors.error('✗')}`);
      console.log(`${colors.bold('Source Maps:')} ${config.build.sourcemap ? colors.success('✓') : colors.error('✗')}`);

      console.log(colors.bold('\n🎭 Actor System\n'));
      console.log(`${colors.bold('Enabled:')}      ${config.actorSystem.enabled ? colors.success('✓') : colors.error('✗')}`);
      console.log(`${colors.bold('Supervision:')}  ${config.actorSystem.supervision ? colors.success('✓') : colors.error('✗')}`);
      console.log(`${colors.bold('Clustering:')}   ${config.actorSystem.clustering ? colors.success('✓') : colors.error('✗')}`);
      console.log(`${colors.bold('Persistence:')}  ${config.actorSystem.persistence ? colors.success('✓') : colors.error('✗')}`);

      console.log('');
    } catch (error) {
      console.error(colors.error('❌ Failed to read project information:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  },
};
