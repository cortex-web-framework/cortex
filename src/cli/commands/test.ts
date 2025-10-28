/**
 * Test command implementation
 * Runs tests for Cortex projects
 * Zero dependencies, strictest TypeScript configuration
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

import { colors } from '../utils/colors.js';
import { processOps } from '../utils/process.js';
import type { CLICommand } from '../types.js';

/**
 * Test command
 */
export const testCommand: CLICommand = {
  name: 'test',
  description: 'Run test suite',
  options: [
    {
      name: 'watch',
      description: 'Watch for changes and re-run tests',
      type: 'boolean',
      default: false,
      alias: 'w',
    },
    {
      name: 'coverage',
      description: 'Generate coverage report',
      type: 'boolean',
      default: false,
      alias: 'c',
    },
    {
      name: 'verbose',
      description: 'Verbose output',
      type: 'boolean',
      default: false,
      alias: 'v',
    },
    {
      name: 'filter',
      description: 'Filter tests by pattern',
      type: 'string',
      alias: 'f',
    },
  ],
  action: async (_args, options) => {
    const watch = options.watch === true;
    const coverage = options.coverage === true;
    const verbose = options.verbose === true;
    const filter = options.filter as string | undefined;

    console.log(colors.bold('\n🧪 Running Cortex Tests\n'));

    // Check if package.json exists
    const cwd = processOps.cwd();
    const packageJsonPath = join(cwd, 'package.json');

    if (!existsSync(packageJsonPath)) {
      console.error(colors.error('Error: package.json not found. Are you in a Cortex project directory?'));
      processOps.exit(1);
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Determine test framework
    const hasVitest = packageJson.devDependencies?.vitest || packageJson.dependencies?.vitest;
    const hasJest = packageJson.devDependencies?.jest || packageJson.dependencies?.jest;
    const hasNode = !hasVitest && !hasJest;

    console.log(colors.info(`📦 Project: ${packageJson.name}`));
    console.log(colors.info(`🧪 Test framework: ${hasVitest ? 'Vitest' : hasJest ? 'Jest' : 'Node.js'}`));

    if (watch) {
      console.log(colors.info('👀 Watch mode enabled'));
    }

    if (coverage) {
      console.log(colors.info('📊 Coverage enabled'));
    }

    console.log('');

    let testProcess: ReturnType<typeof spawn>;
    let testArgs: string[] = [];
    let testCommand: string;

    if (hasVitest) {
      // Use Vitest
      testCommand = 'npx';
      testArgs = ['vitest'];

      if (!watch) {
        testArgs.push('run');
      }

      if (coverage) {
        testArgs.push('--coverage');
      }

      if (verbose) {
        testArgs.push('--reporter=verbose');
      }

      if (filter) {
        testArgs.push('--grep', filter);
      }
    } else if (hasJest) {
      // Use Jest
      testCommand = 'npx';
      testArgs = ['jest'];

      if (watch) {
        testArgs.push('--watch');
      }

      if (coverage) {
        testArgs.push('--coverage');
      }

      if (verbose) {
        testArgs.push('--verbose');
      }

      if (filter) {
        testArgs.push('--testNamePattern', filter);
      }
    } else {
      // Use Node.js built-in test runner
      testCommand = 'node';
      testArgs = ['--test'];

      if (watch) {
        testArgs.push('--watch');
      }

      if (coverage) {
        testArgs.push('--experimental-test-coverage');
      }

      // Check for TypeScript
      const usesTypescript = existsSync(join(cwd, 'tsconfig.json'));
      if (usesTypescript) {
        // Ensure tests are compiled first
        console.log(colors.info('🔨 Compiling TypeScript tests...'));

        const compileArgs = ['tsc', '--project', 'tsconfig.test.json'];
        const tscProcess = spawn('npx', compileArgs, {
          stdio: 'inherit',
          cwd,
        });

        await new Promise<void>((resolve, reject) => {
          tscProcess.on('error', reject);
          tscProcess.on('exit', (code) => {
            if (code !== 0) {
              reject(new Error(`TypeScript compilation failed with code ${code}`));
            } else {
              resolve();
            }
          });
        });

        console.log(colors.success('✅ TypeScript compiled\n'));

        // Run compiled tests
        testArgs.push('dist-tests/tests');
      } else {
        testArgs.push('tests');
      }

      if (filter) {
        testArgs.push('--test-name-pattern', filter);
      }
    }

    console.log(colors.info(`🚀 Running: ${testCommand} ${testArgs.join(' ')}\n`));

    // Run tests
    testProcess = spawn(testCommand, testArgs, {
      stdio: 'inherit',
      cwd,
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });

    await new Promise<void>((resolve, reject) => {
      testProcess.on('error', (error) => {
        console.error(colors.error(`\n❌ Test execution error: ${error.message}`));
        reject(error);
      });

      testProcess.on('exit', (code) => {
        if (code !== 0) {
          console.error(colors.error(`\n❌ Tests failed with code ${code}`));
          processOps.exit(code ?? 1);
        } else {
          console.log('');
          console.log(colors.success('✅ All tests passed!'));
          console.log('');
          resolve();
        }
      });
    });
  },
};
