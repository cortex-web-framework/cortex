/**
 * Command Discovery Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import { readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import type { 
  CLICommand, 
  CommandDiscovery, 
  ValidationResult, 
  ValidationError 
} from './types.js';

/**
 * Command Discovery Implementation
 */
export class CortexCommandDiscovery implements CommandDiscovery {
  /**
   * Discover commands from a directory
   */
  async discoverCommands(directory: string): Promise<readonly CLICommand[]> {
    const commands: CLICommand[] = [];
    
    try {
      const entries = await readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && this.isCommandFile(entry.name)) {
          const commandPath = join(directory, entry.name);
          try {
            const command = await this.loadCommand(commandPath);
            commands.push(command);
          } catch (error) {
            console.warn(`Failed to load command from ${commandPath}:`, error);
          }
        } else if (entry.isDirectory()) {
          // Recursively discover commands from subdirectories
          const subCommands = await this.discoverCommands(join(directory, entry.name));
          commands.push(...subCommands);
        }
      }
    } catch (error) {
      throw new Error(`Failed to discover commands from ${directory}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return commands;
  }

  /**
   * Load a single command from a file
   */
  async loadCommand(modulePath: string): Promise<CLICommand> {
    try {
      // Check if file exists and is readable
      await stat(modulePath);
      
      // Load the module
      const module = await import(modulePath);
      
      // Extract the command (default export or named export)
      const command = module.default || module.command || module;
      
      if (!command || typeof command !== 'object') {
        throw new Error(`Invalid command format in ${modulePath}`);
      }

      // Validate the command
      const validation = this.validateCommand(command);
      if (!validation.valid) {
        throw new Error(`Command validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      return command;
    } catch (error) {
      throw new Error(`Failed to load command from ${modulePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate a command
   */
  validateCommand(command: CLICommand): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Check required properties
    if (!command.name || typeof command.name !== 'string') {
      errors.push({
        type: 'REQUIRED_FIELD',
        field: 'name',
        message: 'Command name is required and must be a string',
        code: 'MISSING_NAME'
      });
    }
    
    if (!command.description || typeof command.description !== 'string') {
      errors.push({
        type: 'REQUIRED_FIELD',
        field: 'description',
        message: 'Command description is required and must be a string',
        code: 'MISSING_DESCRIPTION'
      });
    }
    
    if (!command.action || typeof command.action !== 'function') {
      errors.push({
        field: 'action',
        message: 'Command action is required and must be a function',
        code: 'MISSING_ACTION'
      });
    }
    
    // Validate options if provided
    if (command.options) {
      for (let i = 0; i < command.options.length; i++) {
        const option = command.options[i];
        if (!option.name || typeof option.name !== 'string') {
          errors.push({
            field: `options[${i}].name`,
            message: 'Option name is required and must be a string',
            code: 'INVALID_OPTION_NAME'
          });
        }
        
        if (!option.description || typeof option.description !== 'string') {
          errors.push({
            field: `options[${i}].description`,
            message: 'Option description is required and must be a string',
            code: 'INVALID_OPTION_DESCRIPTION'
          });
        }
        
        if (!option.type || typeof option.type !== 'string') {
          errors.push({
            field: `options[${i}].type`,
            message: 'Option type is required and must be a string',
            code: 'INVALID_OPTION_TYPE'
          });
        }
        
        if (!['string', 'number', 'boolean', 'array'].includes(option.type)) {
          errors.push({
            field: `options[${i}].type`,
            message: 'Option type must be one of: string, number, boolean, array',
            code: 'INVALID_OPTION_TYPE_VALUE'
          });
        }
      }
    }
    
    // Validate subcommands if provided
    if (command.subcommands) {
      for (let i = 0; i < command.subcommands.length; i++) {
        const subcommand = command.subcommands[i];
        const subcommandValidation = this.validateCommand(subcommand);
        if (!subcommandValidation.valid) {
          for (const error of subcommandValidation.errors) {
            errors.push({
              field: `subcommands[${i}].${error.field}`,
              message: error.message,
              code: error.code
            });
          }
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Check if a file is a command file
   */
  private isCommandFile(filename: string): boolean {
    const ext = extname(filename).toLowerCase();
    return ext === '.js' || ext === '.mjs' || ext === '.ts';
  }
}