import * as fs from 'node:fs';
import * as path from 'node:path';

export class Config {
  private static instance: Config;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private config: Record<string, any> = {};
  private configDir: string;

  private constructor(configDir?: string) {
    this.configDir = configDir || path.join(process.cwd(), 'config');
    this.loadConfig();
  }

  public static getInstance(configDir?: string): Config {
    if (!Config.instance) {
      Config.instance = new Config(configDir);
    } else if (configDir && Config.instance.configDir !== configDir) {
      // If a different configDir is provided, re-initialize the instance
      Config.instance = new Config(configDir);
    }
    return Config.instance;
  }

  private loadConfig(): void {
    // Helper for deep merging objects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deepMerge = (target: Record<string, any>, source: Record<string, any>): Record<string, any> => {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sourceVal: any = source[key];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const targetVal: any = target[key];
          if (
            typeof sourceVal === 'object' &&
            sourceVal !== null &&
            !Array.isArray(sourceVal) &&
            typeof targetVal === 'object' &&
            targetVal !== null &&
            !Array.isArray(targetVal)
          ) {
            target[key] = deepMerge(targetVal, sourceVal);
          } else {
            target[key] = sourceVal;
          }
        }
      }
      return target;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let loadedConfig: Record<string, any> = {};

    // 1. Load from default.json
    const defaultConfigPath = path.join(this.configDir, 'default.json');
    if (fs.existsSync(defaultConfigPath)) {
      const defaultContent = fs.readFileSync(defaultConfigPath, 'utf-8');
      loadedConfig = deepMerge(loadedConfig, JSON.parse(defaultContent) as Record<string, unknown>);
    }

    // 2. Load from environment-specific file (overrides default)
    const env = process.env.NODE_ENV || 'development';
    const envConfigPath = path.join(this.configDir, `${env}.json`);
    if (fs.existsSync(envConfigPath)) {
      const envContent = fs.readFileSync(envConfigPath, 'utf-8');
      loadedConfig = deepMerge(loadedConfig, JSON.parse(envContent) as Record<string, unknown>);
    }

    this.config = loadedConfig;

    // 3. Load from environment variables (highest precedence)
    for (const key in process.env) {
      if (Object.prototype.hasOwnProperty.call(process.env, key) && key.startsWith('CORTEX_')) {
        const configKey = key.substring(7).toLowerCase().replace(/_(\w)/g, (g) => `.${g[1]}`);
        const value = process.env[key];
        this.set(configKey, value);
      }
    }
  }

  private set(key: string, value: unknown): void {
    const parts = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: Record<string, any> = this.config;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      if (i === parts.length - 1) {
        current[part] = value;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const next: any = current[part];
        if (!next || typeof next !== 'object') {
          current[part] = {};
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        current = current[part] as Record<string, any>;
      }
    }
  }

  public get<T>(key: string, defaultValue?: T): T | undefined {
    const parts = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = this.config;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return defaultValue;
      }
    }
    return current as T;
  }
}
