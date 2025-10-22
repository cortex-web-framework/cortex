/**
 * Testing Plugin
 * Testing utilities and templates
 */

import type { CortexPlugin } from '@cortex/cli/extensibility';
import { testUnitCommand } from './commands/test-unit.js';
import { testIntegrationCommand } from './commands/test-integration.js';
import { testE2ECommand } from './commands/test-e2e.js';
import { testSuiteTemplate } from './templates/test-suite.js';
import { testCaseTemplate } from './templates/test-case.js';
import { mockTemplate } from './templates/mock.js';
import { preTestHook } from './hooks/pre-test.js';
import { postTestHook } from './hooks/post-test.js';

export const plugin: CortexPlugin = {
  name: 'testing-plugin',
  version: '1.0.0',
  description: 'Testing utilities and templates',
  commands: [testUnitCommand, testIntegrationCommand, testE2ECommand],
  templates: [testSuiteTemplate, testCaseTemplate, mockTemplate],
  hooks: [preTestHook, postTestHook]
};

export default plugin;