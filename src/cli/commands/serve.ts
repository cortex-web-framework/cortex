/**
 * Serve command implementation
 * Starts a development server for Cortex projects
 * Zero dependencies, strictest TypeScript configuration
 */

import { readFileSync, existsSync, watchFile, unwatchFile } from 'fs';
import { join } from 'path';
import { spawn, type ChildProcess } from 'child_process';

import { colors } from '../utils/colors.js';
import { processOps } from '../utils/process.js';
import type { CLICommand } from '../types.js';

/**
 * Serve command
 */
export const serveCommand: CLICommand = {
  name: 'serve',
  description: 'Start development server with hot reload',
  options: [
    {
      name: 'port',
      description: 'Port to listen on',
      type: 'number',
      default: 3000,
      alias: 'p',
    },
    {
      name: 'host',
      description: 'Host to bind to',
      type: 'string',
      default: 'localhost',
      alias: 'h',
    },
    {
      name: 'watch',
      description: 'Enable file watching',
      type: 'boolean',
      default: true,
      alias: 'w',
    },
    {
      name: 'open',
      description: 'Open browser automatically',
      type: 'boolean',
      default: false,
      alias: 'o',
    },
  ],
  action: async (_args, options) => {
    const port = (options.port as number) || 3000;
    const host = (options.host as string) || 'localhost';
    const watch = options.watch !== false;
    const open = options.open === true;

    console.log(colors.bold('\n🚀 Starting Cortex Development Server\n'));

    // Check if package.json exists
    const cwd = processOps.cwd();
    const packageJsonPath = join(cwd, 'package.json');

    if (!existsSync(packageJsonPath)) {
      console.error(colors.error('Error: package.json not found. Are you in a Cortex project directory?'));
      processOps.exit(1);
    }

    // Read package.json to determine entry point
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const entryPoint = packageJson.main || 'dist/index.js';
    const srcEntry = packageJson.cortex?.entry || 'src/index.ts';

    console.log(colors.info(`📦 Project: ${packageJson.name}`));
    console.log(colors.info(`🔧 Entry: ${srcEntry}`));
    console.log(colors.info(`🌐 Server: http://${host}:${port}`));

    if (watch) {
      console.log(colors.info('👀 Watching for changes...'));
    }

    console.log('');

    let serverProcess: ChildProcess | null = null;
    let isRestarting = false;

    /**
     * Start the server process
     */
    const startServer = (): void => {
      if (serverProcess) {
        return;
      }

      // Check if TypeScript is being used
      const usesTypescript = existsSync(join(cwd, 'tsconfig.json'));

      if (usesTypescript) {
        // Use tsx or ts-node if available, otherwise compile first
        serverProcess = spawn('npx', ['tsx', srcEntry], {
          stdio: 'inherit',
          env: {
            ...process.env,
            PORT: port.toString(),
            HOST: host,
            NODE_ENV: 'development',
          },
        });
      } else {
        // Use node directly for JavaScript
        serverProcess = spawn('node', [entryPoint], {
          stdio: 'inherit',
          env: {
            ...process.env,
            PORT: port.toString(),
            HOST: host,
            NODE_ENV: 'development',
          },
        });
      }

      serverProcess.on('error', (error) => {
        console.error(colors.error(`\n❌ Server error: ${error.message}`));
      });

      serverProcess.on('exit', (code) => {
        serverProcess = null;
        if (!isRestarting && code !== 0) {
          console.error(colors.error(`\n❌ Server exited with code ${code}`));
        }
      });
    };

    /**
     * Stop the server process
     */
    const stopServer = (): Promise<void> => {
      return new Promise((resolve) => {
        if (!serverProcess) {
          resolve();
          return;
        }

        const timeout = setTimeout(() => {
          serverProcess?.kill('SIGKILL');
          resolve();
        }, 5000);

        serverProcess.once('exit', () => {
          clearTimeout(timeout);
          serverProcess = null;
          resolve();
        });

        serverProcess.kill('SIGTERM');
      });
    };

    /**
     * Restart the server
     */
    const restartServer = async (): Promise<void> => {
      if (isRestarting) {
        return;
      }

      isRestarting = true;
      console.log(colors.warning('\n🔄 Restarting server...'));

      await stopServer();

      // Small delay to ensure clean restart
      setTimeout(() => {
        startServer();
        console.log(colors.success('✅ Server restarted\n'));
        isRestarting = false;
      }, 100);
    };

    // Start initial server
    startServer();

    // Open browser if requested
    if (open) {
      const url = `http://${host}:${port}`;
      const openCommand = process.platform === 'darwin' ? 'open' :
                         process.platform === 'win32' ? 'start' : 'xdg-open';
      spawn(openCommand, [url], { stdio: 'ignore' });
    }

    // Watch for file changes
    if (watch) {
      const watchPaths = [
        join(cwd, 'src'),
        join(cwd, 'package.json'),
      ];

      const watchers = new Set<string>();

      const addWatch = (path: string): void => {
        if (!existsSync(path)) {
          return;
        }

        if (watchers.has(path)) {
          return;
        }

        watchers.add(path);
        watchFile(path, { interval: 500 }, () => {
          void restartServer();
        });
      };

      watchPaths.forEach(addWatch);

      // Cleanup on exit
      process.on('SIGINT', () => {
        watchers.forEach((path) => unwatchFile(path));
        void stopServer().then(() => {
          console.log(colors.info('\n👋 Server stopped'));
          processOps.exit(0);
        });
      });

      process.on('SIGTERM', () => {
        watchers.forEach((path) => unwatchFile(path));
        void stopServer().then(() => {
          processOps.exit(0);
        });
      });
    }

    // Keep process alive
    await new Promise(() => {
      // Intentionally empty - keep running until killed
    });
  },
};
