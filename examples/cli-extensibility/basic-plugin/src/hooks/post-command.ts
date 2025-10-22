/**
 * Post-Command Hook
 * Executes after any command completes
 */

import type { Hook } from '@cortex/cli/extensibility';

export const postCommandHook: Hook = {
  name: 'post-command',
  event: 'after:command',
  handler: async (context) => {
    console.log(`[Hook] Command completed: ${context.command}`);
    console.log(`[Hook] Execution time: ${Date.now() - context.data.startTime}ms`);
  }
};