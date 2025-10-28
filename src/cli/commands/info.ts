/**
 * Info command implementation
 * Shows project information and configuration
 * Zero dependencies, strictest TypeScript configuration
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import { colors } from '../utils/colors.js';
import { processOps } from '../utils/process.js';
import type { CLICommand } from '../types.js';

/**
 * Info command
 */
export const infoCommand: CLICommand = {
  name: 'info',
  description: 'Show project information',
  options: [
    {
      name: 'detailed',
      description: 'Show detailed information',
      type: 'boolean',
      default: false,
      alias: 'd',
    },
  ],
  action: async (_args, options) => {
    const detailed = options.detailed === true;
    const cwd = processOps.cwd();

    console.log('');
    console.log(colors.bold('📊 Project Information'));
    console.log('');

    // Check if package.json exists
    const packageJsonPath = join(cwd, 'package.json');
    if (!existsSync(packageJsonPath)) {
      console.error(colors.error('Error: package.json not found. Are you in a Cortex project directory?'));
      processOps.exit(1);
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Basic information
    console.log(colors.info('Name:        ') + colors.cyan(packageJson.name || 'N/A'));
    console.log(colors.info('Version:     ') + colors.cyan(packageJson.version || 'N/A'));
    console.log(colors.info('Description: ') + (packageJson.description || 'N/A'));
    console.log('');

    // Dependencies
    const deps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});

    console.log(colors.bold('📦 Dependencies'));
    console.log(colors.info(`Production:  `) + colors.cyan(deps.length.toString()));
    console.log(colors.info(`Development: `) + colors.cyan(devDeps.length.toString()));
    console.log('');

    if (detailed) {
      if (deps.length > 0) {
        console.log(colors.bold('Production Dependencies:'));
        deps.forEach((dep) => {
          console.log(`  ${colors.cyan(dep)}: ${packageJson.dependencies[dep]}`);
        });
        console.log('');
      }

      if (devDeps.length > 0) {
        console.log(colors.bold('Development Dependencies:'));
        devDeps.forEach((dep) => {
          console.log(`  ${colors.cyan(dep)}: ${packageJson.devDependencies[dep]}`);
        });
        console.log('');
      }
    }

    // Configuration files
    console.log(colors.bold('⚙️  Configuration'));
    const configFiles = [
      { name: 'TypeScript', file: 'tsconfig.json' },
      { name: 'Git', file: '.git' },
      { name: 'ESLint', file: '.eslintrc.json' },
      { name: 'Prettier', file: '.prettierrc' },
      { name: 'Docker', file: 'Dockerfile' },
      { name: 'Docker Compose', file: 'docker-compose.yml' },
    ];

    configFiles.forEach(({ name, file }) => {
      const exists = existsSync(join(cwd, file));
      const status = exists ? colors.success('✓') : colors.dim('✗');
      console.log(`${status} ${name.padEnd(16)} ${exists ? colors.cyan(file) : colors.dim(file)}`);
    });

    console.log('');

    // Cortex-specific configuration
    if (packageJson.cortex) {
      console.log(colors.bold('🧠 Cortex Configuration'));
      const cortexConfig = packageJson.cortex;

      Object.entries(cortexConfig).forEach(([key, value]) => {
        console.log(`  ${colors.info(key + ':').padEnd(20)} ${colors.cyan(JSON.stringify(value))}`);
      });

      console.log('');
    }

    // Scripts
    if (packageJson.scripts && detailed) {
      console.log(colors.bold('📜 Available Scripts'));
      Object.entries(packageJson.scripts).forEach(([name, script]) => {
        console.log(`  ${colors.cyan(name)}`);
        console.log(`    ${colors.dim(script as string)}`);
      });
      console.log('');
    }

    // System information
    console.log(colors.bold('💻 System'));
    console.log(colors.info('Node.js:     ') + colors.cyan(processOps.version));
    console.log(colors.info('Platform:    ') + colors.cyan(`${processOps.platform} ${processOps.arch}`));
    console.log(colors.info('Working Dir: ') + colors.cyan(cwd));
    console.log('');
  },
};
