import { test } from 'node:test';
import assert from 'node:assert';
import { Logger } from '../../src/core/logger.js';

test.beforeEach(() => {
  // Clear any existing Logger instance for test isolation
  (Logger as any).instance = undefined;
});

test('Logger should be a singleton', () => {
  const logger1 = Logger.getInstance();
  const logger2 = Logger.getInstance();
  assert.strictEqual(logger1, logger2, 'Logger instances should be the same');
});

test('Logger should log info messages in structured format', () => {
  const logger = Logger.getInstance();
  const originalLog = console.log;
  let loggedMessage: string = '';

  console.log = (message: string) => { loggedMessage = message; };

  logger.info('Test info message', { key: 'value' });

  console.log = originalLog; // Restore original console.log

  const parsedMessage = JSON.parse(loggedMessage);
  assert.strictEqual(parsedMessage.level, 'info', 'Log level should be info');
  assert.strictEqual(parsedMessage.message, 'Test info message', 'Log message should match');
  assert.strictEqual(parsedMessage.key, 'value', 'Context should be included');
  assert.ok(parsedMessage.timestamp, 'Timestamp should be present');
});

test('Logger should log error messages in structured format', () => {
  const logger = Logger.getInstance();
  const originalError = console.error;
  let loggedMessage: string = '';

  console.error = (message: string) => { loggedMessage = message; };

  logger.error('Test error message', new Error('Something went wrong'));

  console.error = originalError; // Restore original console.error

  const parsedMessage = JSON.parse(loggedMessage);
  assert.strictEqual(parsedMessage.level, 'error', 'Log level should be error');
  assert.strictEqual(parsedMessage.message, 'Test error message', 'Log message should match');
  assert.ok(parsedMessage.error, 'Error object should be included');
  assert.strictEqual(parsedMessage.error.message, 'Something went wrong', 'Error message should match');
  assert.ok(parsedMessage.timestamp, 'Timestamp should be present');
});

test('Logger should log warn messages in structured format', () => {
  const logger = Logger.getInstance();
  const originalWarn = console.warn;
  let loggedMessage: string = '';

  console.warn = (message: string) => { loggedMessage = message; };

  logger.warn('Test warn message', { code: 100 });

  console.warn = originalWarn; // Restore original console.warn

  const parsedMessage = JSON.parse(loggedMessage);
  assert.strictEqual(parsedMessage.level, 'warn', 'Log level should be warn');
  assert.strictEqual(parsedMessage.message, 'Test warn message', 'Log message should match');
  assert.strictEqual(parsedMessage.code, 100, 'Context should be included');
  assert.ok(parsedMessage.timestamp, 'Timestamp should be present');
});

test('Logger should log debug messages in structured format', () => {
  const logger = Logger.getInstance();
  const originalDebug = console.debug;
  let loggedMessage: string = '';

  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';

  console.debug = (message: string) => { loggedMessage = message; };

  logger.debug('Test debug message', { data: 'payload' });

  console.debug = originalDebug; // Restore original console.debug
  process.env.NODE_ENV = originalNodeEnv; // Restore original NODE_ENV

  const parsedMessage = JSON.parse(loggedMessage);
  assert.strictEqual(parsedMessage.level, 'debug', 'Log level should be debug');
  assert.strictEqual(parsedMessage.message, 'Test debug message', 'Log message should match');
  assert.strictEqual(parsedMessage.data, 'payload', 'Context should be included');
  assert.ok(parsedMessage.timestamp, 'Timestamp should be present');
});
