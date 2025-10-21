import { describe, it } from 'node:test';
import assert from 'node:assert';
import { colors, supportsColors } from '../../src/cli/utils/colors';

describe('Colors', () => {
  describe('supportsColors', () => {
    it('should return boolean', () => {
      const result = supportsColors();
      assert.strictEqual(typeof result, 'boolean');
    });
  });

  describe('color functions', () => {
    it('should return string for all color functions', () => {
      const testText = 'test';
      
      assert.strictEqual(typeof colors.reset(testText), 'string');
      assert.strictEqual(typeof colors.bold(testText), 'string');
      assert.strictEqual(typeof colors.dim(testText), 'string');
      assert.strictEqual(typeof colors.italic(testText), 'string');
      assert.strictEqual(typeof colors.underline(testText), 'string');
      assert.strictEqual(typeof colors.strikethrough(testText), 'string');
      assert.strictEqual(typeof colors.black(testText), 'string');
      assert.strictEqual(typeof colors.red(testText), 'string');
      assert.strictEqual(typeof colors.green(testText), 'string');
      assert.strictEqual(typeof colors.yellow(testText), 'string');
      assert.strictEqual(typeof colors.blue(testText), 'string');
      assert.strictEqual(typeof colors.magenta(testText), 'string');
      assert.strictEqual(typeof colors.cyan(testText), 'string');
      assert.strictEqual(typeof colors.white(testText), 'string');
      assert.strictEqual(typeof colors.gray(testText), 'string');
      assert.strictEqual(typeof colors.brightRed(testText), 'string');
      assert.strictEqual(typeof colors.brightGreen(testText), 'string');
      assert.strictEqual(typeof colors.brightYellow(testText), 'string');
      assert.strictEqual(typeof colors.brightBlue(testText), 'string');
      assert.strictEqual(typeof colors.brightMagenta(testText), 'string');
      assert.strictEqual(typeof colors.brightCyan(testText), 'string');
      assert.strictEqual(typeof colors.brightWhite(testText), 'string');
    });

    it('should return original text when colors disabled', () => {
      const originalEnv = process.env.NO_COLOR;
      process.env.NO_COLOR = '1';
      
      const testText = 'test';
      assert.strictEqual(colors.red(testText), testText);
      assert.strictEqual(colors.green(testText), testText);
      assert.strictEqual(colors.bold(testText), testText);
      
      // Restore environment
      if (originalEnv === undefined) {
        delete process.env.NO_COLOR;
      } else {
        process.env.NO_COLOR = originalEnv;
      }
    });

    it('should combine multiple styles', () => {
      const testText = 'test';
      const result = colors.combine(testText, colors.bold, colors.red);
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes(testText));
    });

    it('should handle empty string', () => {
      const result = colors.red('');
      assert.strictEqual(result, '');
    });

    it('should handle special characters', () => {
      const specialText = 'test\n\t\r';
      const result = colors.red(specialText);
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes(specialText));
    });
  });

  describe('utility functions', () => {
    it('should provide success styling', () => {
      const result = colors.success('Success message');
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('Success message'));
    });

    it('should provide error styling', () => {
      const result = colors.error('Error message');
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('Error message'));
    });

    it('should provide warning styling', () => {
      const result = colors.warning('Warning message');
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('Warning message'));
    });

    it('should provide info styling', () => {
      const result = colors.info('Info message');
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('Info message'));
    });

    it('should provide highlight styling', () => {
      const result = colors.highlight('Highlighted text');
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('Highlighted text'));
    });

    it('should provide muted styling', () => {
      const result = colors.muted('Muted text');
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('Muted text'));
    });
  });
});