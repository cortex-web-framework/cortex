/**
 * Test command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import type { CLICommand, ProjectConfig } from '../types.js';
import { colors } from '../utils/colors.js';
import { fileUtils } from '../utils/fs.js';

/**
 * Test command - runs test suite
 */
export const testCommand: CLICommand = {
  name: 'test',
  description: 'Run test suite',
  options: [
    {
      name: 'watch',
      description: 'Watch for changes',
      type: 'boolean',
      alias: 'w',
      default: false,
    },
    {
      name: 'coverage',
      description: 'Generate coverage report',
      type: 'boolean',
      alias: 'c',
      default: false,
    },
    {
      name: 'filter',
      description: 'Filter tests by pattern',
      type: 'string',
      alias: 'f',
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

      const watch = (options['watch'] as boolean) ?? false;
      const coverage = (options['coverage'] as boolean) ?? false;
      const filter = (options['filter'] as string) ?? undefined;

      console.log(colors.blue('🧪 Running tests...'));
      console.log(colors.info(`   Framework: ${config.testing.framework}`));
      console.log(colors.info(`   Watch: ${watch ? 'yes' : 'no'}`));
      console.log(colors.info(`   Coverage: ${coverage ? 'yes' : 'no'}`));
      if (filter) {
        console.log(colors.info(`   Filter: ${filter}`));
      }
      console.log();

      // Check if package.json has test scripts
      if (fileUtils.exists('package.json')) {
        const pkgContent = readFileSync('package.json', 'utf-8');
        const pkg = JSON.parse(pkgContent);

        if (pkg.scripts) {
          let scriptName = 'test';
          const testArgs: string[] = [];

          // Determine which script to use
          if (watch && pkg.scripts['test:watch']) {
            scriptName = 'test:watch';
          } else if (coverage && pkg.scripts['test:coverage']) {
            scriptName = 'test:coverage';
          } else if (pkg.scripts.test) {
            scriptName = 'test';

            // Add framework-specific arguments
            if (watch) {
              if (config.testing.framework === 'vitest') {
                testArgs.push('--', '--watch');
              } else if (config.testing.framework === 'jest') {
                testArgs.push('--', '--watch');
              }
            }
            if (coverage) {
              if (config.testing.framework === 'vitest') {
                testArgs.push('--', '--coverage');
              } else if (config.testing.framework === 'jest') {
                testArgs.push('--', '--coverage');
              }
            }
          }

          if (pkg.scripts[scriptName]) {
            console.log(colors.success(`✅ Using npm run ${scriptName}`));

            return new Promise<void>((resolve, reject) => {
              const child = spawn('npm', ['run', scriptName, ...testArgs], {
                stdio: 'inherit',
                shell: true,
                env: {
                  ...process.env,
                  NODE_ENV: 'test',
                  TEST_FILTER: filter,
                }
              });

              child.on('error', (error: Error) => {
                console.error(colors.error('❌ Tests failed:'), error.message);
                reject(error);
              });

              child.on('exit', (code: number | null) => {
                if (code === 0 || watch) {
                  if (!watch) {
                    console.log(colors.success('\n✅ All tests passed!'));
                  }
                  resolve();
                } else {
                  console.error(colors.error(`❌ Tests failed with code ${code}`));
                  reject(new Error(`Tests failed with code ${code}`));
                }
              });

              if (watch) {
                // Handle graceful shutdown for watch mode
                process.on('SIGINT', () => {
                  console.log(colors.warning('\n⚠️  Stopping test watcher...'));
                  child.kill('SIGINT');
                  process.exit(0);
                });
              }
            });
          }
        }
      }

      // If no test script, try to use framework directly
      if (config.testing.framework === 'none') {
        throw new Error('No testing framework configured. Run "cortex create" to set up testing.');
      }

      console.log(colors.info(`📝 No test script found, using ${config.testing.framework} directly...`));

      return new Promise<void>((resolve, reject) => {
        const framework = config.testing.framework;
        const frameworkArgs: string[] = [];

        if (framework === 'vitest') {
          if (watch) frameworkArgs.push('--watch');
          if (coverage) frameworkArgs.push('--coverage');
          if (filter) frameworkArgs.push(filter);
        } else if (framework === 'jest') {
          if (watch) frameworkArgs.push('--watch');
          if (coverage) frameworkArgs.push('--coverage');
          if (filter) frameworkArgs.push(filter);
        }

        const child = spawn(framework, frameworkArgs, {
          stdio: 'inherit',
          shell: true,
          env: {
            ...process.env,
            NODE_ENV: 'test',
          }
        });

        child.on('error', (error: Error) => {
          console.error(colors.error('❌ Tests failed:'), error.message);
          console.log(colors.warning(`\n💡 Tip: Make sure ${framework} is installed:`));
          console.log(colors.cyan(`   npm install --save-dev ${framework}`));
          reject(error);
        });

        child.on('exit', (code: number | null) => {
          if (code === 0 || watch) {
            if (!watch) {
              console.log(colors.success('\n✅ All tests passed!'));
            }
            resolve();
          } else {
            console.error(colors.error(`❌ Tests failed with code ${code}`));
            reject(new Error(`Tests failed with code ${code}`));
          }
        });

        if (watch) {
          // Handle graceful shutdown for watch mode
          process.on('SIGINT', () => {
            console.log(colors.warning('\n⚠️  Stopping test watcher...'));
            child.kill('SIGINT');
            process.exit(0);
          });
        }
      });

    } catch (error) {
      console.error(colors.error('❌ Tests failed:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  },
};
