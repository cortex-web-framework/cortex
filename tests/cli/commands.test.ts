/**
 * CLI Commands Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { versionCommand } from '../../src/cli/commands/version.js';
import { generateCommand } from '../../src/cli/commands/generate.js';

describe('CLI Commands', () => {
  describe('versionCommand', () => {
    it('should have correct structure', () => {
      assert.strictEqual(versionCommand.name, 'version');
      assert.strictEqual(versionCommand.description, 'Show version information');
      assert.ok(Array.isArray(versionCommand.options));
      assert.strictEqual(typeof versionCommand.action, 'function');
    });

    it('should execute without errors', async () => {
      // Capture console output
      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (msg: string) => logs.push(msg);

      try {
        await versionCommand.action([], {});
        assert.ok(logs.length > 0, 'Should output version information');
      } finally {
        console.log = originalLog;
      }
    });
  });

  describe('generateCommand', () => {
    it('should have correct structure', () => {
      assert.strictEqual(generateCommand.name, 'generate');
      assert.strictEqual(generateCommand.description, 'Generate code from templates');
      assert.ok(Array.isArray(generateCommand.options));
      assert.strictEqual(typeof generateCommand.action, 'function');
    });

    it('should validate required arguments', async () => {
      try {
        await generateCommand.action([], {});
        assert.fail('Should throw error for missing arguments');
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes('Usage:'));
      }
    });

    it('should validate name format', async () => {
      try {
        await generateCommand.action(['actor', '123invalid'], {});
        assert.fail('Should throw error for invalid name');
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes('must start with a letter'));
      }
    });

    it('should reject unknown type', async () => {
      try {
        await generateCommand.action(['unknown', 'Test'], {});
        assert.fail('Should throw error for unknown type');
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes('Unknown type'));
      }
    });
  });
});
