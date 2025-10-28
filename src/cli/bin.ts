#!/usr/bin/env node
/**
 * Cortex CLI Entry Point
 * Executable entry for the cortex command-line tool
 */

import { createCLI } from './core/cli.js';
import { createCommand } from './commands/create.js';
import { versionCommand } from './commands/version.js';
import { infoCommand } from './commands/info.js';
import { serveCommand } from './commands/serve.js';
import { buildCommand } from './commands/build.js';
import { testCommand } from './commands/test.js';
import { generateCommand } from './commands/generate.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get package.json version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));

// Create CLI configuration
const cli = createCLI({
  name: 'cortex',
  version: packageJson.version || '1.0.0',
  description: 'Cortex Framework CLI - Build reactive, distributed systems with the Actor model',
  commands: [
    createCommand,
    versionCommand,
    infoCommand,
    serveCommand,
    buildCommand,
    testCommand,
    generateCommand,
  ],
  globalOptions: [
    {
      name: 'help',
      alias: 'h',
      description: 'Show help information',
      type: 'boolean',
    },
    {
      name: 'version',
      alias: 'v',
      description: 'Show version information',
      type: 'boolean',
    },
  ],
});

// Parse command line arguments
cli.parse(process.argv).catch((error: Error) => {
  console.error('CLI Error:', error.message);
  process.exit(1);
});
