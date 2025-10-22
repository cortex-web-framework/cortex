/**
 * Database Plugin
 * Database management commands and templates
 */

import type { CortexPlugin } from '@cortex/cli/extensibility';
import { createDatabaseCommand } from './commands/create-database.js';
import { migrateCommand } from './commands/migrate.js';
import { seedCommand } from './commands/seed.js';
import { schemaTemplate } from './templates/schema.js';
import { migrationTemplate } from './templates/migration.js';
import { modelTemplate } from './templates/model.js';
import { preMigrationHook } from './hooks/pre-migration.js';
import { postMigrationHook } from './hooks/post-migration.js';

export const plugin: CortexPlugin = {
  name: 'database-plugin',
  version: '1.0.0',
  description: 'Database management commands and templates',
  commands: [createDatabaseCommand, migrateCommand, seedCommand],
  templates: [schemaTemplate, migrationTemplate, modelTemplate],
  hooks: [preMigrationHook, postMigrationHook]
};

export default plugin;