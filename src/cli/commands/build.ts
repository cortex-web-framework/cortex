/**
 * Build command implementation
 * Builds Cortex projects for production
 * Zero dependencies, strictest TypeScript configuration
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync, rmSync } from 'fs';
import { join, relative, dirname, extname } from 'path';
import { spawn } from 'child_process';

import { colors } from '../utils/colors.js';
import { processOps } from '../utils/process.js';
import type { CLICommand } from '../types.js';

/**
 * Build command
 */
export const buildCommand: CLICommand = {
  name: 'build',
  description: 'Build project for production',
  options: [
    {
      name: 'minify',
      description: 'Minify output',
      type: 'boolean',
      default: true,
      alias: 'm',
    },
    {
      name: 'sourcemap',
      description: 'Generate source maps',
      type: 'boolean',
      default: true,
      alias: 's',
    },
    {
      name: 'clean',
      description: 'Clean output directory before build',
      type: 'boolean',
      default: true,
      alias: 'c',
    },
    {
      name: 'watch',
      description: 'Watch for changes and rebuild',
      type: 'boolean',
      default: false,
      alias: 'w',
    },
  ],
  action: async (_args, options) => {
    const minify = options.minify !== false;
    const sourcemap = options.sourcemap !== false;
    const clean = options.clean !== false;
    const watch = options.watch === true;

    console.log(colors.bold('\n📦 Building Cortex Project\n'));

    // Check if package.json exists
    const cwd = processOps.cwd();
    const packageJsonPath = join(cwd, 'package.json');

    if (!existsSync(packageJsonPath)) {
      console.error(colors.error('Error: package.json not found. Are you in a Cortex project directory?'));
      processOps.exit(1);
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const outDir = packageJson.cortex?.outDir || 'dist';
    const outPath = join(cwd, outDir);

    console.log(colors.info(`📦 Project: ${packageJson.name}`));
    console.log(colors.info(`📂 Output: ${outDir}`));
    console.log(colors.info(`🔧 Minify: ${minify ? 'enabled' : 'disabled'}`));
    console.log(colors.info(`🗺️  Source maps: ${sourcemap ? 'enabled' : 'disabled'}`));
    console.log('');

    // Clean output directory if requested
    if (clean && existsSync(outPath)) {
      console.log(colors.info('🧹 Cleaning output directory...'));
      rmSync(outPath, { recursive: true, force: true });
    }

    // Ensure output directory exists
    if (!existsSync(outPath)) {
      mkdirSync(outPath, { recursive: true });
    }

    // Check for TypeScript
    const tsConfigPath = join(cwd, 'tsconfig.json');
    const usesTypescript = existsSync(tsConfigPath);

    if (usesTypescript) {
      console.log(colors.info('🔨 Compiling TypeScript...'));

      // Run TypeScript compiler
      const tscArgs = [
        'tsc',
        '--project', tsConfigPath,
        '--outDir', outDir,
      ];

      if (sourcemap) {
        tscArgs.push('--sourceMap');
      }

      if (watch) {
        tscArgs.push('--watch');
      }

      await new Promise<void>((resolve, reject) => {
        const tsc = spawn('npx', tscArgs, {
          stdio: 'inherit',
          cwd,
        });

        tsc.on('error', (error) => {
          console.error(colors.error(`\n❌ TypeScript compilation failed: ${error.message}`));
          reject(error);
        });

        tsc.on('exit', (code) => {
          if (code !== 0 && !watch) {
            console.error(colors.error(`\n❌ TypeScript compilation failed with code ${code}`));
            reject(new Error(`TypeScript compilation failed with code ${code}`));
          } else if (!watch) {
            resolve();
          }
        });

        // In watch mode, keep the process running
        if (watch) {
          console.log(colors.info('\n👀 Watching for changes...\n'));
        }
      });
    } else {
      console.log(colors.info('📋 Copying JavaScript files...'));

      // Copy JS files from src to dist
      const srcDir = join(cwd, 'src');
      if (existsSync(srcDir)) {
        copyDirectory(srcDir, outPath);
      }
    }

    if (!watch) {
      // Copy additional files
      console.log(colors.info('📋 Copying additional files...'));

      const filesToCopy = ['package.json', 'README.md', 'LICENSE'];
      filesToCopy.forEach((file) => {
        const srcPath = join(cwd, file);
        const destPath = join(outPath, file);
        if (existsSync(srcPath)) {
          const content = readFileSync(srcPath, 'utf-8');
          writeFileSync(destPath, content);
        }
      });

      // Generate production package.json
      const prodPackageJson = {
        ...packageJson,
        devDependencies: undefined,
        scripts: {
          start: 'node index.js',
        },
      };
      writeFileSync(
        join(outPath, 'package.json'),
        JSON.stringify(prodPackageJson, null, 2)
      );

      console.log('');
      console.log(colors.success('✅ Build complete!'));
      console.log('');
      console.log(colors.info(`📂 Output directory: ${relative(cwd, outPath)}`));
      console.log(colors.info('🚀 Ready for deployment'));
      console.log('');
    }
  },
};

/**
 * Copy directory recursively
 */
function copyDirectory(src: string, dest: string): void {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else if (extname(entry) === '.js' || extname(entry) === '.json') {
      const content = readFileSync(srcPath, 'utf-8');
      const destDir = dirname(destPath);
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      writeFileSync(destPath, content);
    }
  }
}
