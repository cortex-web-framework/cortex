/**
 * Pre-Command Hook
 * Executes before any command runs
 */

import type { Hook } from '@cortex/cli/extensibility';

export const preCommandHook: Hook = {
  name: 'pre-command',
  event: 'before:command',
  handler: async (context) => {
    console.log(`[Hook] About to execute command: ${context.command}`);
    console.log(`[Hook] Arguments: ${context.args?.join(' ') || 'none'}`);
    console.log(`[Hook] Options:`, context.options || {});
    console.log(`[Hook] Working directory: ${context.workingDirectory}`);
  }
};