/**
 * Serve command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import type { CLICommand, ProjectConfig } from '../types.js';
import { colors } from '../utils/colors.js';
import { fileUtils } from '../utils/fs.js';

/**
 * Serve command - starts development server
 */
export const serveCommand: CLICommand = {
  name: 'serve',
  description: 'Start development server',
  options: [
    {
      name: 'port',
      description: 'Port number',
      type: 'number',
      alias: 'p',
    },
    {
      name: 'host',
      description: 'Host address',
      type: 'string',
      alias: 'H',
    },
    {
      name: 'watch',
      description: 'Enable watch mode',
      type: 'boolean',
      alias: 'w',
      default: true,
    },
  ],
  action: async (_args: string[], options: Record<string, unknown>): Promise<void> => {
    try {
      // Load project configuration
      const configPath = 'cortex.json';
      if (!fileUtils.exists(configPath)) {
        throw new Error('Not a Cortex project. Run this command from a project directory.');
      }

      const configContent = readFileSync(configPath, 'utf-8');
      const config: ProjectConfig = JSON.parse(configContent);

      const port = (options['port'] as number) ?? config.devServer.port;
      const host = (options['host'] as string) ?? config.devServer.host;
      const watch = (options['watch'] as boolean) ?? true;

      console.log(colors.blue(`🚀 Starting Cortex development server...`));
      console.log(colors.info(`   Port: ${port}`));
      console.log(colors.info(`   Host: ${host}`));
      console.log(colors.info(`   Watch: ${watch ? 'enabled' : 'disabled'}`));
      console.log();

      // Check if package.json has a dev script
      if (fileUtils.exists('package.json')) {
        const pkgContent = readFileSync('package.json', 'utf-8');
        const pkg = JSON.parse(pkgContent);

        if (pkg.scripts && pkg.scripts.dev) {
          // Use the existing dev script
          console.log(colors.success('✅ Using npm run dev'));
          const child = spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            shell: true,
            env: {
              ...process.env,
              PORT: port.toString(),
              HOST: host,
            }
          });

          child.on('error', (error: Error) => {
            console.error(colors.error('❌ Failed to start server:'), error.message);
            process.exit(1);
          });

          child.on('exit', (code: number | null) => {
            if (code && code !== 0) {
              console.error(colors.error(`❌ Server exited with code ${code}`));
              process.exit(code);
            }
          });

          // Handle graceful shutdown
          process.on('SIGINT', () => {
            console.log(colors.warning('\n⚠️  Shutting down server...'));
            child.kill('SIGINT');
            process.exit(0);
          });

          return;
        }
      }

      // If no dev script, start with ts-node or node
      console.log(colors.info('📝 No dev script found, starting with ts-node...'));

      const entryFile = config.typescript.enabled ? 'src/index.ts' : 'src/index.js';
      if (!fileUtils.exists(entryFile)) {
        throw new Error(`Entry file not found: ${entryFile}`);
      }

      const runtime = config.typescript.enabled ? 'ts-node' : 'node';
      const watchArgs = watch && config.typescript.enabled ? ['--watch'] : [];

      const child = spawn(runtime, [...watchArgs, entryFile], {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          PORT: port.toString(),
          HOST: host,
          NODE_ENV: 'development',
        }
      });

      child.on('error', (error: Error) => {
        console.error(colors.error('❌ Failed to start server:'), error.message);
        console.log(colors.warning('\n💡 Tip: Make sure ts-node is installed:'));
        console.log(colors.cyan('   npm install --save-dev ts-node'));
        process.exit(1);
      });

      child.on('exit', (code: number | null) => {
        if (code && code !== 0) {
          console.error(colors.error(`❌ Server exited with code ${code}`));
          process.exit(code);
        }
      });

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log(colors.warning('\n⚠️  Shutting down server...'));
        child.kill('SIGINT');
        process.exit(0);
      });

    } catch (error) {
      console.error(colors.error('❌ Failed to start server:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  },
};
