/**
 * Deployment Plugin
 * Deployment automation and templates
 */

import type { CortexPlugin } from '@cortex/cli/extensibility';
import { deployStagingCommand } from './commands/deploy-staging.js';
import { deployProductionCommand } from './commands/deploy-production.js';
import { rollbackCommand } from './commands/rollback.js';
import { dockerfileTemplate } from './templates/dockerfile.js';
import { k8sManifestTemplate } from './templates/k8s-manifest.js';
import { helmChartTemplate } from './templates/helm-chart.js';
import { preDeployHook } from './hooks/pre-deploy.js';
import { postDeployHook } from './hooks/post-deploy.js';

export const plugin: CortexPlugin = {
  name: 'deployment-plugin',
  version: '1.0.0',
  description: 'Deployment automation and templates',
  commands: [deployStagingCommand, deployProductionCommand, rollbackCommand],
  templates: [dockerfileTemplate, k8sManifestTemplate, helmChartTemplate],
  hooks: [preDeployHook, postDeployHook]
};

export default plugin;