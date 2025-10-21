#!/usr/bin/env node

/**
 * Cortex Framework CLI
 * Zero dependencies, strictest TypeScript configuration
 */

import { createCLI } from './core/cli';
import { createCommand } from './commands/create';
import { colors } from './utils/colors';
import { processUtils } from './utils/process';

/**
 * CLI Configuration
 */
const cliConfig = {
  name: 'cortex',
  version: '1.0.0',
  description: 'Cortex Framework CLI - Advanced Web Framework with Actor System',
  commands: [
    createCommand,
  ],
  globalOptions: [
    {
      name: 'verbose',
      description: 'Enable verbose output',
      type: 'boolean' as const,
      default: false,
    },
    {
      name: 'silent',
      description: 'Suppress all output',
      type: 'boolean' as const,
      default: false,
    },
    {
      name: 'no-color',
      description: 'Disable colored output',
      type: 'boolean' as const,
      default: false,
    },
    {
      name: 'config',
      description: 'Path to configuration file',
      type: 'string' as const,
      default: 'cortex.json',
    },
  ],
} as const;

/**
 * Display banner
 */
function displayBanner(): void {
  const banner = `
${colors.cyan(colors.bold(`
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║    ██████╗ ██████╗ ████████╗████████╗███████╗██╗  ██╗        ║
    ║   ██╔═══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝╚██╗██╔╝        ║
    ║   ██║   ██║██████╔╝██║   ██║   ██║   █████╗   ╚███╔╝         ║
    ║   ██║   ██║██╔══██╗██║   ██║   ██║   ██╔══╝   ██╔██╗         ║
    ║   ╚██████╔╝██║  ██║╚██████╔╝   ██║   ███████╗██╔╝ ██╗        ║
    ║    ╚═════╝ ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝        ║
    ║                                                              ║
    ║              🚀 Advanced Web Framework CLI                    ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
`))}

${colors.gray('Welcome to Cortex Framework CLI!')}
${colors.gray('Building the future of web applications with Actor System architecture.')}
`;

  console.log(banner);
}

/**
 * Check system requirements
 */
function checkSystemRequirements(): void {
  const nodeVersion = process.version;
  const minNodeVersion = '18.0.0';
  
  // Simple version comparison
  const currentVersion = nodeVersion.replace('v', '').split('.').map(Number);
  const minVersion = minNodeVersion.split('.').map(Number);
  
  let isCompatible = true;
  for (let i = 0; i < 3; i++) {
    if (currentVersion[i] < minVersion[i]) {
      isCompatible = false;
      break;
    }
  }
  
  if (!isCompatible) {
    console.error(colors.error(`❌ Node.js version ${minNodeVersion} or higher is required. Current: ${nodeVersion}`));
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    // Display banner
    displayBanner();
    
    // Check system requirements
    checkSystemRequirements();
    
    // Create CLI instance
    const cli = createCLI(cliConfig);
    
    // Parse command line arguments
    await cli.parse();
    
  } catch (error) {
    console.error(colors.error('❌ Unexpected error:'), error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Handle uncaught exceptions
processUtils.onUncaughtException((error) => {
  console.error(colors.error('Uncaught Exception:'), error.message);
  process.exit(1);
});

// Handle unhandled rejections
processUtils.onUnhandledRejection((reason) => {
  console.error(colors.error('Unhandled Rejection:'), reason);
  process.exit(1);
});

// Run main function
main().catch((error) => {
  console.error(colors.error('Failed to start CLI:'), error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});