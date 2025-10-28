/**
 * Build command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import type { CLICommand, ProjectConfig } from '../types.js';
import { colors } from '../utils/colors.js';
import { fileUtils } from '../utils/fs.js';

/**
 * Build command - builds project for production
 */
export const buildCommand: CLICommand = {
  name: 'build',
  description: 'Build project for production',
  options: [
    {
      name: 'minify',
      description: 'Minify output',
      type: 'boolean',
      alias: 'm',
    },
    {
      name: 'sourcemap',
      description: 'Generate source maps',
      type: 'boolean',
      alias: 's',
    },
    {
      name: 'watch',
      description: 'Watch for changes',
      type: 'boolean',
      alias: 'w',
      default: false,
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

      const minify = (options['minify'] as boolean) ?? config.build.minify;
      const sourcemap = (options['sourcemap'] as boolean) ?? config.build.sourcemap;
      const watch = (options['watch'] as boolean) ?? false;

      console.log(colors.blue('🔨 Building project for production...'));
      console.log(colors.info(`   Target: ${config.build.target}`));
      console.log(colors.info(`   Minify: ${minify ? 'yes' : 'no'}`));
      console.log(colors.info(`   Sourcemap: ${sourcemap ? 'yes' : 'no'}`));
      console.log(colors.info(`   Watch: ${watch ? 'yes' : 'no'}`));
      console.log();

      // Check if package.json has a build script
      if (fileUtils.exists('package.json')) {
        const pkgContent = readFileSync('package.json', 'utf-8');
        const pkg = JSON.parse(pkgContent);

        if (pkg.scripts && pkg.scripts.build) {
          // Use the existing build script
          console.log(colors.success('✅ Using npm run build'));

          return new Promise<void>((resolve, reject) => {
            const child = spawn('npm', ['run', 'build'], {
              stdio: 'inherit',
              shell: true,
              env: {
                ...process.env,
                NODE_ENV: 'production',
                MINIFY: minify ? 'true' : 'false',
                SOURCEMAP: sourcemap ? 'true' : 'false',
              }
            });

            child.on('error', (error: Error) => {
              console.error(colors.error('❌ Build failed:'), error.message);
              reject(error);
            });

            child.on('exit', (code: number | null) => {
              if (code === 0) {
                console.log(colors.success('\n✅ Build completed successfully!'));
                console.log(colors.info('   Output directory: dist/'));
                resolve();
              } else {
                console.error(colors.error(`❌ Build failed with code ${code}`));
                reject(new Error(`Build failed with code ${code}`));
              }
            });
          });
        }
      }

      // If no build script, use TypeScript compiler
      if (config.typescript.enabled) {
        console.log(colors.info('📝 No build script found, using TypeScript compiler...'));

        if (!fileUtils.exists('tsconfig.json')) {
          throw new Error('tsconfig.json not found. Cannot build TypeScript project.');
        }

        return new Promise<void>((resolve, reject) => {
          const tscArgs = ['--project', 'tsconfig.json'];
          if (watch) {
            tscArgs.push('--watch');
          }

          const child = spawn('tsc', tscArgs, {
            stdio: 'inherit',
            shell: true,
            env: {
              ...process.env,
              NODE_ENV: 'production',
            }
          });

          child.on('error', (error: Error) => {
            console.error(colors.error('❌ Build failed:'), error.message);
            console.log(colors.warning('\n💡 Tip: Make sure TypeScript is installed:'));
            console.log(colors.cyan('   npm install --save-dev typescript'));
            reject(error);
          });

          child.on('exit', (code: number | null) => {
            if (code === 0 || watch) {
              if (!watch) {
                console.log(colors.success('\n✅ Build completed successfully!'));
                console.log(colors.info('   Output directory: dist/'));
              }
              resolve();
            } else {
              console.error(colors.error(`❌ Build failed with code ${code}`));
              reject(new Error(`Build failed with code ${code}`));
            }
          });

          if (watch) {
            // Handle graceful shutdown for watch mode
            process.on('SIGINT', () => {
              console.log(colors.warning('\n⚠️  Stopping build watcher...'));
              child.kill('SIGINT');
              process.exit(0);
            });
          }
        });
      }

      throw new Error('No build configuration found. Add a "build" script to package.json.');

    } catch (error) {
      console.error(colors.error('❌ Build failed:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  },
};
