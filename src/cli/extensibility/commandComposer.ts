/**
 * Command Composer Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import type { 
  CLICommand, 
  CLIOption, 
  CommandComposer, 
  CommandExtension 
} from './types.js';

/**
 * Command Composer Implementation
 */
export class CortexCommandComposer implements CommandComposer {
  /**
   * Compose a base command with extensions
   */
  compose(baseCommand: CLICommand, extensions: readonly CommandExtension[]): CLICommand {
    let options = [...(baseCommand.options || [])];
    let subcommands = [...(baseCommand.subcommands || [])];
    let action = baseCommand.action;

    // Apply extensions
    for (const extension of extensions) {
      switch (extension.type) {
        case 'option':
          options = [...this.mergeOptions(options, [extension.data as CLIOption])];
          break;
        case 'subcommand':
          subcommands = [...this.mergeSubcommands(subcommands, [extension.data as CLICommand])];
          break;
        case 'action':
          // Replace the action function
          action = extension.data as (args: string[], options: Record<string, unknown>) => Promise<void>;
          break;
      }
    }

    return {
      name: baseCommand.name,
      description: baseCommand.description,
      action,
      options,
      subcommands
    };
  }

  /**
   * Merge multiple option arrays
   */
  mergeOptions(...optionsArrays: readonly CLIOption[][]): readonly CLIOption[] {
    const mergedOptions = new Map<string, CLIOption>();
    
    // Add all options from all arrays, with later ones overriding earlier ones
    for (const options of optionsArrays) {
      for (const option of options) {
        mergedOptions.set(option.name, option);
      }
    }
    
    return Array.from(mergedOptions.values());
  }

  /**
   * Merge multiple subcommand arrays
   */
  mergeSubcommands(...subcommandArrays: readonly CLICommand[][]): readonly CLICommand[] {
    const mergedSubcommands = new Map<string, CLICommand>();
    
    // Add all subcommands from all arrays, with later ones overriding earlier ones
    for (const subcommands of subcommandArrays) {
      for (const subcommand of subcommands) {
        mergedSubcommands.set(subcommand.name, subcommand);
      }
    }
    
    return Array.from(mergedSubcommands.values());
  }

  /**
   * Create a command extension for an option
   */
  createOptionExtension(name: string, description: string, type: 'string' | 'number' | 'boolean' | 'array', required = false, defaultValue?: unknown): CommandExtension {
    return {
      name: `option-${name}`,
      type: 'option',
      data: {
        name,
        description,
        type,
        required,
        default: defaultValue
      } as CLIOption
    };
  }

  /**
   * Create a command extension for a subcommand
   */
  createSubcommandExtension(subcommand: CLICommand): CommandExtension {
    return {
      name: `subcommand-${subcommand.name}`,
      type: 'subcommand',
      data: subcommand
    };
  }

  /**
   * Create a command extension for an action
   */
  createActionExtension(name: string, action: (args: string[], options: Record<string, unknown>) => Promise<void>): CommandExtension {
    return {
      name: `action-${name}`,
      type: 'action',
      data: action
    };
  }

  /**
   * Validate command composition
   */
  validateComposition(baseCommand: CLICommand, extensions: readonly CommandExtension[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for duplicate option names
    const optionNames = new Set<string>();
    for (const option of baseCommand.options || []) {
      if (optionNames.has(option.name)) {
        errors.push(`Duplicate option name: ${option.name}`);
      }
      optionNames.add(option.name);
    }
    
    for (const extension of extensions) {
      if (extension.type === 'option') {
        const option = extension.data as CLIOption;
        if (optionNames.has(option.name)) {
          errors.push(`Duplicate option name in extension: ${option.name}`);
        }
        optionNames.add(option.name);
      }
    }
    
    // Check for duplicate subcommand names
    const subcommandNames = new Set<string>();
    for (const subcommand of baseCommand.subcommands || []) {
      if (subcommandNames.has(subcommand.name)) {
        errors.push(`Duplicate subcommand name: ${subcommand.name}`);
      }
      subcommandNames.add(subcommand.name);
    }
    
    for (const extension of extensions) {
      if (extension.type === 'subcommand') {
        const subcommand = extension.data as CLICommand;
        if (subcommandNames.has(subcommand.name)) {
          errors.push(`Duplicate subcommand name in extension: ${subcommand.name}`);
        }
        subcommandNames.add(subcommand.name);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a command from scratch
   */
  createCommand(
    name: string, 
    description: string, 
    action: (args: string[], options: Record<string, unknown>) => Promise<void>,
    options: readonly CLIOption[] = [],
    subcommands: readonly CLICommand[] = []
  ): CLICommand {
    return {
      name,
      description,
      action,
      options: [...options],
      subcommands: [...subcommands]
    };
  }

  /**
   * Clone a command with modifications
   */
  cloneCommand(
    command: CLICommand,
    modifications: {
      name?: string;
      description?: string;
      action?: (args: string[], options: Record<string, unknown>) => Promise<void>;
      options?: readonly CLIOption[];
      subcommands?: readonly CLICommand[];
    }
  ): CLICommand {
    return {
      name: modifications.name ?? command.name,
      description: modifications.description ?? command.description,
      action: modifications.action ?? command.action,
      options: modifications.options ? [...modifications.options] : command.options,
      subcommands: modifications.subcommands ? [...modifications.subcommands] : command.subcommands
    };
  }
}