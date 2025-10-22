/**
 * Create command implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { writeFileSync } from 'fs';

import { createProjectStructure } from '../generators/project.js';

import { colors } from '../utils/colors.js';
import { fileUtils } from '../utils/fs.js';
import { processUtils } from '../utils/process.js';
import { CLICommand, ProjectConfig } from '../types.js';
import { DEFAULT_PROJECT_CONFIG } from '../config/project.js';

/**
 * Create command
 */
export const createCommand: CLICommand = {
  name: 'create',
  description: 'Create a new Cortex project',
  options: [
    {
      name: 'name',
      description: 'Project name',
      type: 'string',
      required: true,
    },
    {
      name: 'typescript',
      description: 'Enable TypeScript',
      type: 'boolean',
      default: true,
    },
    {
      name: 'testing',
      description: 'Testing framework',
      type: 'string',
      default: 'vitest',
    },
    {
      name: 'port',
      description: 'Development server port',
      type: 'number',
      default: 3000,
    },
    {
      name: 'https',
      description: 'Enable HTTPS in development',
      type: 'boolean',
      default: false,
    },
    {
      name: 'redis',
      description: 'Include Redis integration',
      type: 'boolean',
      default: false,
    },
    {
      name: 'postgres',
      description: 'Include PostgreSQL integration',
      type: 'boolean',
      default: false,
    },
    {
      name: 'websocket',
      description: 'Include WebSocket support',
      type: 'boolean',
      default: false,
    },
    {
      name: 'auth',
      description: 'Include authentication system',
      type: 'boolean',
      default: false,
    },
    {
      name: 'deploy',
      description: 'Deployment platform',
      type: 'string',
      default: 'none',
    },
    {
      name: 'yes',
      description: 'Skip interactive prompts',
      type: 'boolean',
      default: false,
    },
    {
      name: 'skip-git',
      description: 'Skip Git initialization',
      type: 'boolean',
      default: false,
    },
    {
      name: 'skip-install',
      description: 'Skip dependency installation',
      type: 'boolean',
      default: false,
    },
  ],
  action: async (args: string[], options: Record<string, unknown>): Promise<void> => {
    try {
      // Get project name from args or options
      const projectName = args[0] || (options.name as string);
      if (!projectName) {
        throw new Error('Project name is required');
      }

      // Validate project name
      if (!/^[a-z0-9-]+$/.test(projectName)) {
        throw new Error('Project name must contain only lowercase letters, numbers, and hyphens');
      }

      // Create project configuration
      const config: ProjectConfig = {
        ...DEFAULT_PROJECT_CONFIG,
        name: projectName,
        typescript: {
          enabled: options.typescript as boolean ?? true,
          strict: true,
          target: 'ES2022',
        },
        testing: {
          framework: (options.testing as 'vitest' | 'jest' | 'deno' | 'none') ?? 'vitest',
          coverage: true,
          e2e: true,
        },
        devServer: {
          port: (options.port as number) ?? 3000,
          host: 'localhost',
          https: (options.https as boolean) ?? false,
          hmr: true,
        },
        integrations: {
          redis: (options.redis as boolean) ?? false,
          postgres: (options.postgres as boolean) ?? false,
          websocket: (options.websocket as boolean) ?? false,
          auth: (options.auth as boolean) ?? false,
        },
        deployment: {
          platform: (options.deploy as 'vercel' | 'aws' | 'docker' | 'kubernetes' | 'none') ?? 'none',
        },
      };

      // Check if project directory already exists
      if (fileUtils.isDirectory(projectName)) {
        throw new Error(`Directory ${projectName} already exists`);
      }

      // Create project directory
      fileUtils.ensureDir(projectName);
      const originalCwd = process.cwd();
      process.chdir(projectName);

      try {
        // Generate project structure
        console.log(colors.blue('📁 Creating project structure...'));
        await createProjectStructure(config);

        // Initialize Git repository
        if (!(options['skip-git'] as boolean)) {
          console.log(colors.blue('🔧 Initializing Git repository...'));
          try {
            processUtils.execCommand('git init');
            processUtils.execCommand('git add .');
            processUtils.execCommand('git commit -m "Initial commit"');
            console.log(colors.success('✅ Git repository initialized'));
          } catch (error) {
            console.log(colors.warning('⚠️  Git initialization failed, continuing...'));
          }
        }

        // Install dependencies
        if (!(options['skip-install'] as boolean)) {
          console.log(colors.blue('📦 Installing dependencies...'));
          try {
            processUtils.execCommand('npm install');
            console.log(colors.success('✅ Dependencies installed'));
          } catch (error) {
            console.log(colors.warning('⚠️  Dependency installation failed, continuing...'));
          }
        }

        // Save configuration
        const configPath = 'cortex.json';
        const configContent = JSON.stringify(config, null, 2);
        writeFileSync(configPath, configContent);

        // Display success message
        console.log(colors.success(`
🎉 Project created successfully!

Next steps:
  ${colors.cyan('cd ' + projectName)}
  ${colors.cyan('cortex serve')}        # Start development server
  ${colors.cyan('cortex generate actor MyActor')}  # Create your first actor
  ${colors.cyan('cortex test')}         # Run tests

Happy coding! 🚀
        `));

      } finally {
        // Restore original working directory
        process.chdir(originalCwd);
      }

    } catch (error) {
      console.error(colors.error('❌ Failed to create project:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  },
};