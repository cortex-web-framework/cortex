#!/usr/bin/env node
/**
 * Cortex CLI Entry Point
 * Zero dependencies, strictest TypeScript configuration
 */

import { createCLI } from './core/cli.js';
import { createCommand } from './commands/create.js';
import { serveCommand } from './commands/serve.js';
import { buildCommand } from './commands/build.js';
import { testCommand } from './commands/test.js';
import { versionCommand } from './commands/version.js';
import { infoCommand } from './commands/info.js';
import { generateCommand } from './commands/generate.js';
import type { CLIConfig } from './types.js';

const packageJson = {
  name: 'cortex',
  version: '1.0.0',
  description: 'A comprehensive, production-ready framework for building reactive, distributed, and event-driven systems'
};

const config: CLIConfig = {
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  commands: [
    createCommand,
    serveCommand,
    buildCommand,
    testCommand,
    versionCommand,
    infoCommand,
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
};

const cli = createCLI(config);
cli.parse(process.argv).catch((error: Error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
