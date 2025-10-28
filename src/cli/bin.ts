#!/usr/bin/env node
/**
 * Cortex CLI Executable Entry Point
 * Zero dependencies, strictest TypeScript configuration
 */

import { CLIParser } from './core/cli.js';
import { createCommand } from './commands/create.js';
import { serveCommand } from './commands/serve.js';
import { buildCommand } from './commands/build.js';
import { testCommand } from './commands/test.js';
import { versionCommand } from './commands/version.js';
import { infoCommand } from './commands/info.js';
import { generateCommand } from './commands/generate.js';
import type { CLIConfig } from './types.js';

/**
 * CLI Configuration
 */
const config: CLIConfig = {
  name: 'cortex',
  version: '1.0.0',
  description: 'Cortex Framework - Build modern web applications with Actor-based architecture',
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
      description: 'Show help',
      type: 'boolean',
    },
    {
      name: 'version',
      alias: 'v',
      description: 'Show version',
      type: 'boolean',
    },
  ],
};

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const cli = new CLIParser(config);
  await cli.parse(process.argv);
}

// Run CLI
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
