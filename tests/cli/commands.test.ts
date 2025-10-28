/**
 * CLI Commands Tests
 * Tests for all CLI commands
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CLIParser } from '../../src/cli/core/cli.js';
import { createCommand } from '../../src/cli/commands/create.js';
import { serveCommand } from '../../src/cli/commands/serve.js';
import { buildCommand } from '../../src/cli/commands/build.js';
import { testCommand } from '../../src/cli/commands/test.js';
import { versionCommand } from '../../src/cli/commands/version.js';
import { infoCommand } from '../../src/cli/commands/info.js';
import { generateCommand } from '../../src/cli/commands/generate.js';
import type { CLIConfig, CLIOutput } from '../../src/cli/types.js';

/**
 * Mock CLI output for testing
 */
class MockOutput implements CLIOutput {
  public messages: string[] = [];
  public errors: string[] = [];
  public successes: string[] = [];
  public warnings: string[] = [];
  public infos: string[] = [];

  write(message: string): void {
    this.messages.push(message);
  }

  writeError(message: string): void {
    this.errors.push(message);
  }

  writeSuccess(message: string): void {
    this.successes.push(message);
  }

  writeWarning(message: string): void {
    this.warnings.push(message);
  }

  writeInfo(message: string): void {
    this.infos.push(message);
  }

  clear(): void {
    this.messages = [];
    this.errors = [];
    this.successes = [];
    this.warnings = [];
    this.infos = [];
  }
}

describe('CLI Commands', () => {
  test('should have all required commands', () => {
    const config: CLIConfig = {
      name: 'cortex',
      version: '1.0.0',
      description: 'Cortex Framework CLI',
      commands: [
        createCommand,
        serveCommand,
        buildCommand,
        testCommand,
        versionCommand,
        infoCommand,
        generateCommand,
      ],
      globalOptions: [],
    };

    assert.strictEqual(config.commands.length, 7);
    assert.ok(config.commands.find((cmd) => cmd.name === 'create'));
    assert.ok(config.commands.find((cmd) => cmd.name === 'serve'));
    assert.ok(config.commands.find((cmd) => cmd.name === 'build'));
    assert.ok(config.commands.find((cmd) => cmd.name === 'test'));
    assert.ok(config.commands.find((cmd) => cmd.name === 'version'));
    assert.ok(config.commands.find((cmd) => cmd.name === 'info'));
    assert.ok(config.commands.find((cmd) => cmd.name === 'generate'));
  });

  test('version command should have correct structure', () => {
    assert.strictEqual(versionCommand.name, 'version');
    assert.strictEqual(typeof versionCommand.description, 'string');
    assert.strictEqual(typeof versionCommand.action, 'function');
    assert.ok(Array.isArray(versionCommand.options));
  });

  test('serve command should have required options', () => {
    assert.strictEqual(serveCommand.name, 'serve');
    assert.ok(serveCommand.options);
    assert.ok(serveCommand.options!.find((opt) => opt.name === 'port'));
    assert.ok(serveCommand.options!.find((opt) => opt.name === 'host'));
    assert.ok(serveCommand.options!.find((opt) => opt.name === 'watch'));
    assert.ok(serveCommand.options!.find((opt) => opt.name === 'open'));
  });

  test('build command should have required options', () => {
    assert.strictEqual(buildCommand.name, 'build');
    assert.ok(buildCommand.options);
    assert.ok(buildCommand.options!.find((opt) => opt.name === 'minify'));
    assert.ok(buildCommand.options!.find((opt) => opt.name === 'sourcemap'));
    assert.ok(buildCommand.options!.find((opt) => opt.name === 'clean'));
    assert.ok(buildCommand.options!.find((opt) => opt.name === 'watch'));
  });

  test('test command should have required options', () => {
    assert.strictEqual(testCommand.name, 'test');
    assert.ok(testCommand.options);
    assert.ok(testCommand.options!.find((opt) => opt.name === 'watch'));
    assert.ok(testCommand.options!.find((opt) => opt.name === 'coverage'));
    assert.ok(testCommand.options!.find((opt) => opt.name === 'verbose'));
    assert.ok(testCommand.options!.find((opt) => opt.name === 'filter'));
  });

  test('generate command should have correct structure', () => {
    assert.strictEqual(generateCommand.name, 'generate');
    assert.strictEqual(typeof generateCommand.description, 'string');
    assert.strictEqual(typeof generateCommand.action, 'function');
    assert.ok(Array.isArray(generateCommand.options));
  });

  test('info command should have detailed option', () => {
    assert.strictEqual(infoCommand.name, 'info');
    assert.ok(infoCommand.options);
    assert.ok(infoCommand.options!.find((opt) => opt.name === 'detailed'));
  });

  test('create command should have all configuration options', () => {
    assert.strictEqual(createCommand.name, 'create');
    assert.ok(createCommand.options);

    const optionNames = createCommand.options!.map((opt) => opt.name);
    assert.ok(optionNames.includes('typescript'));
    assert.ok(optionNames.includes('testing'));
    assert.ok(optionNames.includes('port'));
    assert.ok(optionNames.includes('redis'));
    assert.ok(optionNames.includes('postgres'));
    assert.ok(optionNames.includes('websocket'));
    assert.ok(optionNames.includes('auth'));
  });
});

describe('CLI Parser', () => {
  test('should parse version flag', async () => {
    const mockOutput = new MockOutput();
    const config: CLIConfig = {
      name: 'cortex',
      version: '1.0.0',
      description: 'Test CLI',
      commands: [versionCommand],
      globalOptions: [
        {
          name: 'version',
          alias: 'v',
          description: 'Show version',
          type: 'boolean',
        },
      ],
    };

    const cli = new CLIParser(config, mockOutput);
    await cli.parse(['node', 'script', '--version']);

    assert.ok(mockOutput.messages.length > 0);
    assert.ok(mockOutput.messages.some((msg) => msg.includes('1.0.0')));
  });

  test('should show help when no arguments', async () => {
    const mockOutput = new MockOutput();
    const config: CLIConfig = {
      name: 'cortex',
      version: '1.0.0',
      description: 'Test CLI',
      commands: [versionCommand],
      globalOptions: [],
    };

    const cli = new CLIParser(config, mockOutput);
    await cli.parse(['node', 'script']);

    assert.ok(mockOutput.messages.length > 0);
    assert.ok(mockOutput.messages.some((msg) => msg.includes('cortex')));
  });

  test('should show help for --help flag', async () => {
    const mockOutput = new MockOutput();
    const config: CLIConfig = {
      name: 'cortex',
      version: '1.0.0',
      description: 'Test CLI',
      commands: [versionCommand],
      globalOptions: [
        {
          name: 'help',
          alias: 'h',
          description: 'Show help',
          type: 'boolean',
        },
      ],
    };

    const cli = new CLIParser(config, mockOutput);
    await cli.parse(['node', 'script', '--help']);

    assert.ok(mockOutput.messages.length > 0);
    assert.ok(mockOutput.messages.some((msg) => msg.includes('Commands')));
  });
});

describe('Command Validation', () => {
  test('all commands should have required fields', () => {
    const commands = [
      createCommand,
      serveCommand,
      buildCommand,
      testCommand,
      versionCommand,
      infoCommand,
      generateCommand,
    ];

    commands.forEach((cmd) => {
      assert.ok(cmd.name, `Command should have a name: ${JSON.stringify(cmd)}`);
      assert.ok(
        cmd.description,
        `Command ${cmd.name} should have a description`
      );
      assert.strictEqual(
        typeof cmd.action,
        'function',
        `Command ${cmd.name} should have an action function`
      );
      assert.ok(
        Array.isArray(cmd.options),
        `Command ${cmd.name} should have options array`
      );
    });
  });

  test('all command options should have required fields', () => {
    const commands = [
      createCommand,
      serveCommand,
      buildCommand,
      testCommand,
      infoCommand,
    ];

    commands.forEach((cmd) => {
      if (cmd.options && cmd.options.length > 0) {
        cmd.options.forEach((opt) => {
          assert.ok(opt.name, `Option in ${cmd.name} should have a name`);
          assert.ok(
            opt.description,
            `Option ${opt.name} in ${cmd.name} should have a description`
          );
          assert.ok(
            opt.type,
            `Option ${opt.name} in ${cmd.name} should have a type`
          );
          assert.ok(
            ['string', 'number', 'boolean'].includes(opt.type),
            `Option ${opt.name} in ${cmd.name} should have valid type`
          );
        });
      }
    });
  });
});
