/**
 * Info command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { readFileSync } from 'fs';
import type { CLICommand, ProjectConfig } from '../types.js';
import { colors } from '../utils/colors.js';
import { fileUtils } from '../utils/fs.js';

/**
 * Info command - displays project information
 */
export const infoCommand: CLICommand = {
  name: 'info',
  description: 'Show project information',
  options: [],
  action: async (_args: string[], _options: Record<string, unknown>): Promise<void> => {
    try {
      // Load project configuration
      const configPath = 'cortex.json';
      if (!fileUtils.exists(configPath)) {
        throw new Error('Not a Cortex project. Run this command from a project directory.');
      }

      const configContent = readFileSync(configPath, 'utf-8');
      const config: ProjectConfig = JSON.parse(configContent);

      console.log(colors.bold(`\n${config.name} - Project Information\n`));

      // Basic Info
      console.log(colors.bold('Basic:'));
      console.log(`  ${colors.cyan('Name:')}        ${config.name}`);
      console.log(`  ${colors.cyan('Version:')}     ${config.version}`);
      if (config.description) {
        console.log(`  ${colors.cyan('Description:')} ${config.description}`);
      }

      // TypeScript
      console.log();
      console.log(colors.bold('TypeScript:'));
      console.log(`  ${colors.cyan('Enabled:')}     ${config.typescript.enabled ? 'Yes' : 'No'}`);
      if (config.typescript.enabled) {
        console.log(`  ${colors.cyan('Strict:')}      ${config.typescript.strict ? 'Yes' : 'No'}`);
        console.log(`  ${colors.cyan('Target:')}      ${config.typescript.target}`);
      }

      // Testing
      console.log();
      console.log(colors.bold('Testing:'));
      console.log(`  ${colors.cyan('Framework:')}   ${config.testing.framework}`);
      console.log(`  ${colors.cyan('Coverage:')}    ${config.testing.coverage ? 'Yes' : 'No'}`);
      console.log(`  ${colors.cyan('E2E:')}         ${config.testing.e2e ? 'Yes' : 'No'}`);

      // Dev Server
      console.log();
      console.log(colors.bold('Development Server:'));
      console.log(`  ${colors.cyan('Port:')}        ${config.devServer.port}`);
      console.log(`  ${colors.cyan('Host:')}        ${config.devServer.host}`);
      console.log(`  ${colors.cyan('HTTPS:')}       ${config.devServer.https ? 'Yes' : 'No'}`);
      console.log(`  ${colors.cyan('HMR:')}         ${config.devServer.hmr ? 'Yes' : 'No'}`);

      // Build
      console.log();
      console.log(colors.bold('Build:'));
      console.log(`  ${colors.cyan('Target:')}      ${config.build.target}`);
      console.log(`  ${colors.cyan('Minify:')}      ${config.build.minify ? 'Yes' : 'No'}`);
      console.log(`  ${colors.cyan('Sourcemap:')}   ${config.build.sourcemap ? 'Yes' : 'No'}`);
      console.log(`  ${colors.cyan('Bundle:')}      ${config.build.bundle ? 'Yes' : 'No'}`);

      // Actor System
      console.log();
      console.log(colors.bold('Actor System:'));
      console.log(`  ${colors.cyan('Enabled:')}     ${config.actorSystem.enabled ? 'Yes' : 'No'}`);
      if (config.actorSystem.enabled) {
        console.log(`  ${colors.cyan('Supervision:')} ${config.actorSystem.supervision ? 'Yes' : 'No'}`);
        console.log(`  ${colors.cyan('Clustering:')}  ${config.actorSystem.clustering ? 'Yes' : 'No'}`);
        console.log(`  ${colors.cyan('Persistence:')} ${config.actorSystem.persistence ? 'Yes' : 'No'}`);
      }

      // Observability
      console.log();
      console.log(colors.bold('Observability:'));
      console.log(`  ${colors.cyan('Metrics:')}     ${config.observability.metrics ? 'Yes' : 'No'}`);
      console.log(`  ${colors.cyan('Tracing:')}     ${config.observability.tracing ? 'Yes' : 'No'}`);
      console.log(`  ${colors.cyan('Health:')}      ${config.observability.health ? 'Yes' : 'No'}`);
      console.log(`  ${colors.cyan('Logging:')}     ${config.observability.logging}`);

      // Integrations
      const hasIntegrations = config.integrations.redis ||
                             config.integrations.postgres ||
                             config.integrations.websocket ||
                             config.integrations.auth;

      if (hasIntegrations) {
        console.log();
        console.log(colors.bold('Integrations:'));
        if (config.integrations.redis) console.log(`  ${colors.cyan('•')} Redis`);
        if (config.integrations.postgres) console.log(`  ${colors.cyan('•')} PostgreSQL`);
        if (config.integrations.websocket) console.log(`  ${colors.cyan('•')} WebSocket`);
        if (config.integrations.auth) console.log(`  ${colors.cyan('•')} Authentication`);
      }

      // Deployment
      if (config.deployment.platform !== 'none') {
        console.log();
        console.log(colors.bold('Deployment:'));
        console.log(`  ${colors.cyan('Platform:')}    ${config.deployment.platform}`);
        if (config.deployment.region) {
          console.log(`  ${colors.cyan('Region:')}      ${config.deployment.region}`);
        }
        if (config.deployment.environment) {
          console.log(`  ${colors.cyan('Environment:')} ${config.deployment.environment}`);
        }
      }

      console.log();

    } catch (error) {
      console.error(colors.error('❌ Failed to load project info:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  },
};
