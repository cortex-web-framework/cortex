/**
 * Cortex CLI Types
 * Zero dependencies, strictest TypeScript configuration
 */

/**
 * CLI Configuration
 */
export interface CLIConfig {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly commands: readonly CLICommand[];
  readonly globalOptions: readonly CLIOption[];
}

/**
 * CLI Command structure
 */
export interface CLICommand {
  readonly name: string;
  readonly description: string;
  readonly action: (args: string[], options: Record<string, unknown>) => Promise<void>;
  readonly options?: readonly CLIOption[] | undefined;
  readonly subcommands?: CLICommand[] | undefined;
}

/**
 * CLI Option definition
 */
export interface CLIOption {
  readonly name: string;
  readonly description: string;
  readonly type: 'string' | 'boolean' | 'number';
  readonly required?: boolean;
  readonly default?: unknown;
  readonly alias?: string;
}

/**
 * CLI Configuration
 */
export interface CLIConfig {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly commands: readonly CLICommand[];
  readonly globalOptions: readonly CLIOption[];
}

/**
 * Project Configuration
 */
export interface ProjectConfig {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly typescript: {
    readonly enabled: boolean;
    readonly strict: boolean;
    readonly target: string;
  };
  readonly testing: {
    readonly framework: 'vitest' | 'jest' | 'deno' | 'none';
    readonly coverage: boolean;
    readonly e2e: boolean;
  };
  readonly devServer: {
    readonly port: number;
    readonly host: string;
    readonly https: boolean;
    readonly hmr: boolean;
  };
  readonly build: {
    readonly target: 'node' | 'browser' | 'universal';
    readonly minify: boolean;
    readonly sourcemap: boolean;
    readonly bundle: boolean;
  };
  readonly actorSystem: {
    readonly enabled: boolean;
    readonly supervision: boolean;
    readonly clustering: boolean;
    readonly persistence: boolean;
  };
  readonly observability: {
    readonly metrics: boolean;
    readonly tracing: boolean;
    readonly health: boolean;
    readonly logging: 'console' | 'json' | 'structured';
  };
  readonly integrations: {
    readonly redis?: boolean;
    readonly postgres?: boolean;
    readonly websocket?: boolean;
    readonly auth?: boolean;
  };
  readonly deployment: {
    readonly platform: 'vercel' | 'aws' | 'docker' | 'kubernetes' | 'none';
    readonly region?: string;
    readonly environment?: string;
  };
}

/**
 * CLI Error types
 */
export class CLIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly exitCode: number = 1
  ) {
    super(message);
    this.name = 'CLIError';
  }
}

/**
 * System information
 */
export interface SystemInfo {
  readonly node: string;
  readonly platform: string;
  readonly arch: string;
  readonly cwd: string;
  readonly memory: NodeJS.MemoryUsage;
  readonly uptime: number;
}

/**
 * Project structure
 */
export interface ProjectStructure {
  readonly directories: readonly string[];
  readonly files: readonly ProjectFile[];
}

/**
 * Project file definition
 */
export interface ProjectFile {
  readonly path: string;
  readonly content: string;
  readonly executable?: boolean;
}

/**
 * Generator options
 */
export interface GeneratorOptions {
  readonly name: string;
  readonly type: 'actor' | 'service' | 'route' | 'middleware' | 'test';
  readonly template?: string;
  readonly withTests?: boolean;
  readonly withTypes?: boolean;
  readonly withDocumentation?: boolean;
}

/**
 * CLI Output interface
 */
export interface CLIOutput {
  write(message: string): void;
  writeError(message: string): void;
  writeSuccess(message: string): void;
  writeWarning(message: string): void;
  writeInfo(message: string): void;
}

/**
 * CLI Input interface
 */
export interface CLIInput {
  readLine(prompt: string): Promise<string>;
  readPassword(prompt: string): Promise<string>;
  confirm(message: string): Promise<boolean>;
  select(message: string, choices: readonly string[]): Promise<string>;
  multiSelect(message: string, choices: readonly string[]): Promise<readonly string[]>;
}

/**
 * File system operations
 */
export interface FileSystem {
  exists(path: string): boolean;
  readFile(path: string): string;
  writeFile(path: string, content: string): void;
  mkdir(path: string, recursive?: boolean): void;
  readdir(path: string): readonly string[];
  stat(path: string): any;
  chmod(path: string, mode: number): void;
}

/**
 * Process operations
 */
export interface ProcessOps {
  exit(code: number): never;
  cwd(): string;
  chdir(path: string): void;
  env: NodeJS.ProcessEnv;
  argv: readonly string[];
  version: string;
  platform: string;
  arch: string;
  memoryUsage(): NodeJS.MemoryUsage;
  uptime(): number;
}