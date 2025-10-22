import * as fs from 'node:fs';
import * as path from 'node:path';

export class Config {
  private static instance: Config;
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
    const deepMerge = (target: Record<string, any>, source: Record<string, any>): Record<string, any> => {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
            target[key] = deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      }
      return target;
    };

    let loadedConfig: Record<string, any> = {};

    // 1. Load from default.json
    const defaultConfigPath = path.join(this.configDir, 'default.json');
    if (fs.existsSync(defaultConfigPath)) {
      const defaultContent = fs.readFileSync(defaultConfigPath, 'utf-8');
      loadedConfig = deepMerge(loadedConfig, JSON.parse(defaultContent));
    }

    // 2. Load from environment-specific file (overrides default)
    const env = process.env["NODE_ENV"] || 'development';
    const envConfigPath = path.join(this.configDir, `${env}.json`);
    if (fs.existsSync(envConfigPath)) {
      const envContent = fs.readFileSync(envConfigPath, 'utf-8');
      loadedConfig = deepMerge(loadedConfig, JSON.parse(envContent));
    }

    this.config = loadedConfig;

    // 3. Load from environment variables (highest precedence)
    for (const key in process.env) {
      if (key.startsWith('CORTEX_')) {
        const configKey = key.substring(7).toLowerCase().replace(/_(\w)/g, (g) => `.${g[1]}`);
        this.set(configKey, process.env[key]);
      }
    }
  }

  private set(key: string, value: any): void {
    const parts = key.split('.');
    let current: Record<string, any> = this.config;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = value;
      } else {
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }

  public get<T>(key: string, defaultValue?: T): T | undefined {
    const parts = key.split('.');
    let current: Record<string, any> = this.config;
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
