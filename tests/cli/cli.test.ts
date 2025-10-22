import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { CLIParser, createCLI } from '../../src/cli/core/cli.js';
import type { CLIConfig } from '../../src/cli/types.js';

describe('CLI Parser', () => {
  let mockOutput: any;
  let mockInput: any;
  let cli: CLIParser;

  beforeEach(() => {
    mockOutput = {
      write: (_msg: string) => {},
      writeError: (_msg: string) => {},
      writeSuccess: (_msg: string) => {},
      writeWarning: (_msg: string) => {},
      writeInfo: (_msg: string) => {},
    };

    mockInput = {
      readLine: async (_prompt: string) => 'test',
      readPassword: async (_prompt: string) => 'test',
      confirm: async (_message: string) => true,
      select: async (_message: string, choices: readonly string[]) => choices[0],
      multiSelect: async (_message: string, choices: readonly string[]) => [choices[0]],
    };

    const config: CLIConfig = {
      name: 'test-cli',
      version: '1.0.0',
      description: 'Test CLI',
      commands: [
        {
          name: 'test',
          description: 'Test command',
          action: async (_args: string[], _options: Record<string, unknown>) => {
            mockOutput.writeSuccess('Test command executed');
          },
        },
      ],
      globalOptions: [],
    };

    cli = new CLIParser(config, mockOutput, mockInput);
  });

  describe('parse', () => {
    it('should show help when no arguments provided', async () => {
      let helpShown = false;
      mockOutput.write = (msg: string) => {
        if (msg.includes('Commands:')) {
          helpShown = true;
        }
      };

      await cli.parse(['node', 'script']);
      assert.strictEqual(helpShown, true);
    });

    it('should execute command when provided', async () => {
      let commandExecuted = false;
      mockOutput.writeSuccess = (msg: string) => {
        if (msg === 'Test command executed') {
          commandExecuted = true;
        }
      };

      await cli.parse(['node', 'script', 'test']);
      assert.strictEqual(commandExecuted, true);
    });

    it('should handle unknown command', async () => {
      let errorShown = false;
      mockOutput.writeError = (msg: string) => {
        if (msg.includes('Unknown command')) {
          errorShown = true;
        }
      };

      await cli.parse(['node', 'script', 'unknown']);
      assert.strictEqual(errorShown, true);
    });
  });
});

describe('createCLI', () => {
  it('should create CLI instance with default output and input', () => {
    const config: CLIConfig = {
      name: 'test-cli',
      version: '1.0.0',
      description: 'Test CLI',
      commands: [],
      globalOptions: [],
    };

    const cli = createCLI(config);
    assert.ok(cli instanceof CLIParser);
  });
});