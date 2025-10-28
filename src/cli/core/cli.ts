/**
 * Cortex CLI Core
 * Zero dependencies, strictest TypeScript configuration
 */

import type { CLICommand, CLIConfig, CLIOutput, CLIInput } from '../types.js';
import { CLIError } from '../types.js';
import { colors } from '../utils/colors.js';
import { processOps } from '../utils/process.js';

/**
 * Default CLI output implementation
 */
class DefaultCLIOutput implements CLIOutput {
  write(message: string): void {
    process.stdout.write(message);
  }

  writeError(message: string): void {
    process.stderr.write(colors["error"](message));
  }

  writeSuccess(message: string): void {
    process.stdout.write(colors.success(message));
  }

  writeWarning(message: string): void {
    process.stdout.write(colors.warning(message));
  }

  writeInfo(message: string): void {
    process.stdout.write(colors.info(message));
  }
}

/**
 * Default CLI input implementation
 */
class DefaultCLIInput implements CLIInput {
  async readLine(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      process.stdout.write(prompt);
      process.stdin.setEncoding('utf8');
      
      let input = '';
      process.stdin.once('data', (data: string) => {
        input = data.trim();
        resolve(input);
      });
    });
  }

  async readPassword(prompt: string): Promise<string> {
    // Simple password input (no masking in this implementation)
    return this.readLine(prompt);
  }

  async confirm(message: string): Promise<boolean> {
    const response = await this.readLine(`${message} (y/N): `);
    return response.toLowerCase() === 'y' || response.toLowerCase() === 'yes';
  }

  async select(message: string, choices: readonly string[]): Promise<string> {
    console.log(message);
    choices.forEach((choice, index) => {
      console.log(`  ${index + 1}. ${choice}`);
    });
    
    const response = await this.readLine('Enter choice (1-' + choices.length + '): ');
    const index = parseInt(response, 10) - 1;
    
    if (index >= 0 && index < choices.length) {
      return choices[index]!;
    }
    
    throw new CLIError('Invalid selection', 'INVALID_SELECTION');
  }

  async multiSelect(message: string, choices: readonly string[]): Promise<readonly string[]> {
    console.log(message);
    choices.forEach((choice, index) => {
      console.log(`  ${index + 1}. ${choice}`);
    });
    
    const response = await this.readLine('Enter choices (comma-separated, e.g., 1,3,5): ');
    const indices = response.split(',').map(s => parseInt(s.trim(), 10) - 1);
    
    const selected: string[] = [];
    for (const index of indices) {
      if (index >= 0 && index < choices.length) {
        selected.push(choices[index]!);
      }
    }
    
    return selected;
  }
}

/**
 * CLI Parser
 */
export class CLIParser {
  private readonly config: CLIConfig;
  private readonly output: CLIOutput;

  constructor(config: CLIConfig, output: CLIOutput = new DefaultCLIOutput(), _input: CLIInput = new DefaultCLIInput()) {
    this.config = config;
    this.output = output;
  }

  /**
   * Parse command line arguments
   */
  async parse(args: readonly string[] = processOps.argv): Promise<void> {
    try {
      // Remove node and script path
      const commandArgs = args.slice(2);

      if (commandArgs.length === 0) {
        this.showHelp();
        return;
      }

      // Check for global --help or --version
      if (commandArgs.includes('--help') || commandArgs.includes('-h')) {
        if (commandArgs.length === 1) {
          this.showHelp();
          return;
        }
      }

      if (commandArgs.includes('--version') || commandArgs.includes('-v')) {
        this.output.write(`${this.config.version}\n`);
        return;
      }

      const command = commandArgs[0]!;
      const commandArgs_ = commandArgs.slice(1);

      await this.executeCommand(command, commandArgs_);
    } catch (error) {
      if (error instanceof CLIError) {
        this.output.writeError(`Error: ${error.message}\n`);
        processOps.exit(error.exitCode);
      } else {
        this.output.writeError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        processOps.exit(1);
      }
    }
  }

  /**
   * Execute command
   */
  private async executeCommand(commandName: string, args: readonly string[]): Promise<void> {
    const command = this.findCommand(commandName);
    if (!command) {
      this.output.writeError(`Unknown command: ${commandName}\n`);
      this.showHelp();
      return;
    }

    // Check for command-specific help
    if (args.includes('--help') || args.includes('-h')) {
      this.showCommandHelp(command);
      return;
    }

    const options = this.parseOptions(args, command.options ?? []);
    await command.action([...args], options);
  }

  /**
   * Find command by name
   */
  private findCommand(name: string): CLICommand | undefined {
    return this.config.commands.find(cmd => cmd.name === name);
  }

  /**
   * Parse command options
   */
  private parseOptions(args: readonly string[], options: readonly any[]): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    let i = 0;

    while (i < args.length) {
      const arg = args[i]!;
      
      if (arg.startsWith('--')) {
        const optionName = arg.slice(2);
        const option = options.find(opt => opt.name === optionName);
        
        if (option) {
          if (option.type === 'boolean') {
            result[optionName] = true;
          } else {
            i++;
            if (i < args.length) {
              result[optionName] = this.convertValue(args[i]!, option.type);
            } else {
              throw new CLIError(`Option --${optionName} requires a value`, 'MISSING_OPTION_VALUE');
            }
          }
        } else {
          throw new CLIError(`Unknown option: --${optionName}`, 'UNKNOWN_OPTION');
        }
      } else if (arg.startsWith('-')) {
        const alias = arg.slice(1);
        const option = options.find(opt => opt.alias === alias);
        
        if (option) {
          if (option.type === 'boolean') {
            result[option.name] = true;
          } else {
            i++;
            if (i < args.length) {
              result[option.name] = this.convertValue(args[i]!, option.type);
            } else {
              throw new CLIError(`Option -${alias} requires a value`, 'MISSING_OPTION_VALUE');
            }
          }
        } else {
          throw new CLIError(`Unknown option: -${alias}`, 'UNKNOWN_OPTION');
        }
      }
      
      i++;
    }

    return result;
  }

  /**
   * Convert string value to appropriate type
   */
  private convertValue(value: string, type: string): unknown {
    switch (type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new CLIError(`Invalid number: ${value}`, 'INVALID_NUMBER');
        }
        return num;
      case 'boolean':
        return value.toLowerCase() === 'true' || value === '1';
      default:
        return value;
    }
  }

  /**
   * Show help
   */
  private showHelp(): void {
    this.output.write(colors.bold(`${this.config.name} v${this.config.version}\n`));
    this.output.write(`${this.config.description}\n\n`);

    this.output.write(colors.bold('Commands:\n'));
    this.config.commands.forEach(command => {
      this.output.write(`  ${colors.cyan(command.name.padEnd(20))} ${command.description}\n`);
    });

    this.output.write('\n');
    this.output.write(colors.bold('Global Options:\n'));
    this.config.globalOptions.forEach(option => {
      const alias = option.alias ? `-${option.alias}, ` : '    ';
      this.output.write(`  ${alias}--${option.name.padEnd(20)} ${option.description}\n`);
    });

    this.output.write('\n');
    this.output.write(`Use '${this.config.name} <command> --help' for more information about a command.\n`);
  }

  /**
   * Show command-specific help
   */
  private showCommandHelp(command: CLICommand): void {
    this.output.write(colors.bold(`${this.config.name} ${command.name}\n`));
    this.output.write(`${command.description}\n\n`);

    this.output.write(colors.bold('Usage:\n'));
    this.output.write(`  ${this.config.name} ${command.name} [options]\n\n`);

    if (command.options && command.options.length > 0) {
      this.output.write(colors.bold('Options:\n'));
      command.options.forEach(option => {
        const alias = option.alias ? `-${option.alias}, ` : '    ';
        const required = option.required ? ' (required)' : '';
        const defaultValue = option.default !== undefined ? ` (default: ${option.default})` : '';
        this.output.write(`  ${alias}--${option.name.padEnd(20)} ${option.description}${required}${defaultValue}\n`);
      });
      this.output.write('\n');
    }

    if (command.subcommands && command.subcommands.length > 0) {
      this.output.write(colors.bold('Subcommands:\n'));
      command.subcommands.forEach(subcmd => {
        this.output.write(`  ${colors.cyan(subcmd.name.padEnd(20))} ${subcmd.description}\n`);
      });
      this.output.write('\n');
    }
  }
}

/**
 * Create CLI instance
 */
export function createCLI(config: CLIConfig): CLIParser {
  return new CLIParser(config);
}