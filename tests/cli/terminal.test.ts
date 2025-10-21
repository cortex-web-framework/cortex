import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TerminalUI, TerminalConfig } from '../../src/cli/wizard/terminal';

describe('TerminalUI', () => {
  describe('constructor', () => {
    it('should create terminal with config', () => {
      const config: TerminalConfig = {
        width: 80,
        height: 24,
        colors: true,
        animations: true,
      };
      
      const terminal = new TerminalUI(config);
      assert.strictEqual(terminal.width, 80);
      assert.strictEqual(terminal.height, 24);
      assert.strictEqual(terminal.colors, true);
      assert.strictEqual(terminal.animations, true);
    });
  });

  describe('clear', () => {
    it('should clear screen', () => {
      const terminal = new TerminalUI({ width: 80, height: 24 });
      const result = terminal.clear();
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('\x1b[2J')); // Clear screen ANSI code
    });
  });

  describe('moveCursor', () => {
    it('should move cursor to position', () => {
      const terminal = new TerminalUI({ width: 80, height: 24 });
      const result = terminal.moveCursor(10, 5);
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('\x1b[6;11H')); // Move to row 6, col 11
    });
  });

  describe('hideCursor', () => {
    it('should hide cursor', () => {
      const terminal = new TerminalUI({ width: 80, height: 24 });
      const result = terminal.hideCursor();
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('\x1b[?25l')); // Hide cursor ANSI code
    });
  });

  describe('showCursor', () => {
    it('should show cursor', () => {
      const terminal = new TerminalUI({ width: 80, height: 24 });
      const result = terminal.showCursor();
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('\x1b[?25h')); // Show cursor ANSI code
    });
  });

  describe('drawBox', () => {
    it('should draw box with title', () => {
      const terminal = new TerminalUI({ width: 80, height: 24 });
      const result = terminal.drawBox(10, 5, 20, 10, 'Test Title');
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('Test Title'));
      assert.ok(result.includes('┌')); // Top-left corner
      assert.ok(result.includes('┐')); // Top-right corner
      assert.ok(result.includes('└')); // Bottom-left corner
      assert.ok(result.includes('┘')); // Bottom-right corner
    });
  });

  describe('drawProgressBar', () => {
    it('should draw progress bar', () => {
      const terminal = new TerminalUI({ width: 80, height: 24 });
      const result = terminal.drawProgressBar(10, 5, 20, 0.5, 'Loading...');
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('Loading...'));
      assert.ok(result.includes('█')); // Progress bar character
    });
  });

  describe('animateText', () => {
    it('should animate text', async () => {
      const terminal = new TerminalUI({ width: 80, height: 24 });
      const result = await terminal.animateText('Hello World', 100);
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('Hello World'));
    });
  });

  describe('drawSpinner', () => {
    it('should draw spinner', () => {
      const terminal = new TerminalUI({ width: 80, height: 24 });
      const result = terminal.drawSpinner(10, 5, 0);
      assert.strictEqual(typeof result, 'string');
      assert.ok(['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'].includes(result.trim()));
    });
  });

  describe('drawBanner', () => {
    it('should draw banner', () => {
      const terminal = new TerminalUI({ width: 80, height: 24 });
      const result = terminal.drawBanner('CORTEX');
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('CORTEX'));
    });
  });

  describe('drawMenu', () => {
    it('should draw menu with options', () => {
      const terminal = new TerminalUI({ width: 80, height: 24 });
      const options = ['Option 1', 'Option 2', 'Option 3'];
      const result = terminal.drawMenu(10, 5, options, 1);
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('Option 1'));
      assert.ok(result.includes('Option 2'));
      assert.ok(result.includes('Option 3'));
    });
  });

  describe('drawTable', () => {
    it('should draw table with data', () => {
      const terminal = new TerminalUI({ width: 80, height: 24 });
      const data = [
        ['Name', 'Age', 'City'],
        ['John', '25', 'New York'],
        ['Jane', '30', 'London'],
      ];
      const result = terminal.drawTable(10, 5, data);
      assert.strictEqual(typeof result, 'string');
      assert.ok(result.includes('Name'));
      assert.ok(result.includes('John'));
      assert.ok(result.includes('Jane'));
    });
  });
});