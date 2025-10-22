/**
 * API Generator Plugin
 * Generate API endpoints and documentation
 */

import type { CortexPlugin } from '@cortex/cli/extensibility';
import { generateApiCommand } from './commands/generate-api.js';
import { generateDocsCommand } from './commands/generate-docs.js';
import { apiEndpointTemplate } from './templates/api-endpoint.js';
import { apiDocsTemplate } from './templates/api-docs.js';
import { apiTestTemplate } from './templates/api-test.js';
import { preGenerationHook } from './hooks/pre-generation.js';
import { postGenerationHook } from './hooks/post-generation.js';

export const plugin: CortexPlugin = {
  name: 'api-generator-plugin',
  version: '1.0.0',
  description: 'Generate API endpoints and documentation',
  commands: [generateApiCommand, generateDocsCommand],
  templates: [apiEndpointTemplate, apiDocsTemplate, apiTestTemplate],
  hooks: [preGenerationHook, postGenerationHook]
};

export default plugin;