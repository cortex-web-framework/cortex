/**
 * Project configuration
 * Zero dependencies, strictest TypeScript configuration
 */

import { ProjectConfig } from '../types.js';
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Default project configuration
 */
export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  name: 'cortex-app',
  version: '1.0.0',
  description: 'A Cortex Framework application',
  typescript: {
    enabled: true,
    strict: true,
    target: 'ES2022',
  },
  testing: {
    framework: 'vitest',
    coverage: true,
    e2e: true,
  },
  devServer: {
    port: 3000,
    host: 'localhost',
    https: false,
    hmr: true,
  },
  build: {
    target: 'universal',
    minify: true,
    sourcemap: true,
    bundle: true,
  },
  actorSystem: {
    enabled: true,
    supervision: true,
    clustering: false,
    persistence: false,
  },
  observability: {
    metrics: true,
    tracing: true,
    health: true,
    logging: 'structured',
  },
  integrations: {},
  deployment: {
    platform: 'none',
  },
} as const;

/**
 * Load project configuration from file
 */
export function loadProjectConfig(configPath: string = 'cortex.json'): ProjectConfig | null {
  try {
    const content = readFileSync(configPath, 'utf8');
    const config = JSON.parse(content) as Partial<ProjectConfig>;
    
    // Merge with defaults
    return {
      ...DEFAULT_PROJECT_CONFIG,
      ...config,
      typescript: { ...DEFAULT_PROJECT_CONFIG.typescript, ...config.typescript },
      testing: { ...DEFAULT_PROJECT_CONFIG.testing, ...config.testing },
      devServer: { ...DEFAULT_PROJECT_CONFIG.devServer, ...config.devServer },
      build: { ...DEFAULT_PROJECT_CONFIG.build, ...config.build },
      actorSystem: { ...DEFAULT_PROJECT_CONFIG.actorSystem, ...config.actorSystem },
      observability: { ...DEFAULT_PROJECT_CONFIG.observability, ...config.observability },
      integrations: { ...DEFAULT_PROJECT_CONFIG.integrations, ...config.integrations },
      deployment: { ...DEFAULT_PROJECT_CONFIG.deployment, ...config.deployment },
    };
  } catch {
    return null;
  }
}

/**
 * Save project configuration to file
 */
export function saveProjectConfig(config: ProjectConfig, configPath: string = 'cortex.json'): void {
  const content = JSON.stringify(config, null, 2);
  writeFileSync(configPath, content, 'utf8');
}

/**
 * Validate project configuration
 */
export function validateProjectConfig(config: Partial<ProjectConfig>): string[] {
  const errors: string[] = [];

  if (config.name && typeof config.name !== 'string') {
    errors.push('Project name must be a string');
  }

  if (config.name && !/^[a-z0-9-]+$/.test(config.name)) {
    errors.push('Project name must contain only lowercase letters, numbers, and hyphens');
  }

  if (config.devServer?.port && (config.devServer.port < 1 || config.devServer.port > 65535)) {
    errors.push('Port must be between 1 and 65535');
  }

  if (config.testing?.framework && !['vitest', 'jest', 'deno', 'none'].includes(config.testing.framework)) {
    errors.push('Testing framework must be one of: vitest, jest, deno, none');
  }

  if (config.build?.target && !['node', 'browser', 'universal'].includes(config.build.target)) {
    errors.push('Build target must be one of: node, browser, universal');
  }

  if (config.deployment?.platform && !['vercel', 'aws', 'docker', 'kubernetes', 'none'].includes(config.deployment.platform)) {
    errors.push('Deployment platform must be one of: vercel, aws, docker, kubernetes, none');
  }

  return errors;
}