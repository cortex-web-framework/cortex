/**
 * Basic Plugin Example
 * Demonstrates basic CLI extensibility functionality
 */

import type { CortexPlugin } from '@cortex/cli/extensibility';
import { helloCommand } from './commands/hello.js';
import { versionCommand } from './commands/version.js';
import { greetingTemplate } from './templates/greeting.js';
import { configTemplate } from './templates/config.js';
import { preCommandHook } from './hooks/pre-command.js';
import { postCommandHook } from './hooks/post-command.js';

export const plugin: CortexPlugin = {
  name: 'basic-plugin',
  version: '1.0.0',
  description: 'Basic plugin example demonstrating CLI extensibility',
  commands: [helloCommand, versionCommand],
  templates: [greetingTemplate, configTemplate],
  hooks: [preCommandHook, postCommandHook]
};

export default plugin;