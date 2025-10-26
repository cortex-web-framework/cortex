/**
 * Comprehensive test suite for error types and utilities
 * Tests all custom error classes, type guards, and error utility functions
 */

import test from 'node:test';
import assert from 'node:assert';

import {
  ActorNotFound,
  RouteNotFound,
  EventBusError,
  TimeoutError,
  ValidationError,
  ConfigurationError,
  MemoryError,
  NetworkError,
  isActorNotFound,
  isRouteNotFound,
  isEventBusError,
  isTimeoutError,
  isValidationError,
  isConfigurationError,
  isMemoryError,
  isNetworkError,
  isError,
  toError,
  getErrorMessage,
} from '../../src/core/errors.js';

// ============================================
// ERROR CLASS TESTS
// ============================================

test('ActorNotFound error', async (t) => {
  await t.test('should create with actor ID', () => {
    const error = new ActorNotFound('actor-123');
    assert.strictEqual(error.name, 'ActorNotFound');
    assert.match(error.message, /actor-123/);
    assert(error instanceof Error);
  });

  await t.test('should include actor ID in message', () => {
    const error = new ActorNotFound('myActor');
    assert.match(error.message, /myActor/);
  });

  await t.test('should have proper prototype chain', () => {
    const error = new ActorNotFound('test');
    assert(error instanceof ActorNotFound);
    assert(error instanceof Error);
  });
});

test('RouteNotFound error', async (t) => {
  await t.test('should create with method and path', () => {
    const error = new RouteNotFound('GET', '/api/users');
    assert.strictEqual(error.name, 'RouteNotFound');
    assert.match(error.message, /GET.*\/api\/users/);
  });

  await t.test('should include both method and path', () => {
    const error = new RouteNotFound('POST', '/data');
    assert.match(error.message, /POST/);
    assert.match(error.message, /\/data/);
  });

  await t.test('should preserve method case', () => {
    const error = new RouteNotFound('DELETE', '/resource');
    assert.match(error.message, /DELETE/);
  });
});

test('EventBusError error', async (t) => {
  await t.test('should create with message', () => {
    const error = new EventBusError('Event publishing failed');
    assert.strictEqual(error.name, 'EventBusError');
    assert.match(error.message, /Event publishing failed/);
  });

  await t.test('should preserve original error stack trace', () => {
    const originalError = new Error('Original stack trace');
    const error = new EventBusError('Wrapped error', originalError);
    assert.strictEqual(error.stack, originalError.stack);
  });

  await t.test('should work without original error', () => {
    const error = new EventBusError('Standalone error');
    assert.ok(error.stack);
    assert.match(error.stack, /EventBusError/);
  });

  await t.test('should handle null original error gracefully', () => {
    const error = new EventBusError('Message', undefined);
    assert.ok(error.message);
  });
});

test('TimeoutError error', async (t) => {
  await t.test('should create with message and timeout duration', () => {
    const error = new TimeoutError('Request timeout', 5000);
    assert.strictEqual(error.name, 'TimeoutError');
    assert.strictEqual(error.timeoutMs, 5000);
    assert.match(error.message, /timeout/i);
  });

  await t.test('should store timeout value correctly', () => {
    const error = new TimeoutError('Timed out', 30000);
    assert.strictEqual(error.timeoutMs, 30000);
  });

  await t.test('should handle various timeout values', () => {
    [100, 1000, 5000, 60000].forEach((ms) => {
      const error = new TimeoutError('msg', ms);
      assert.strictEqual(error.timeoutMs, ms);
    });
  });
});

test('ValidationError error', async (t) => {
  await t.test('should create with message only', () => {
    const error = new ValidationError('Invalid input');
    assert.strictEqual(error.name, 'ValidationError');
    assert.strictEqual(error.field, undefined);
    assert.strictEqual(error.value, undefined);
  });

  await t.test('should store field name when provided', () => {
    const error = new ValidationError('Invalid email', 'email');
    assert.strictEqual(error.field, 'email');
  });

  await t.test('should store field value when provided', () => {
    const error = new ValidationError('Invalid age', 'age', -5);
    assert.strictEqual(error.value, -5);
  });

  await t.test('should store complex values', () => {
    const value = { nested: { data: 123 } };
    const error = new ValidationError('Invalid object', 'config', value);
    assert.deepStrictEqual(error.value, value);
  });

  await t.test('should handle null and undefined values', () => {
    const error1 = new ValidationError('msg', 'field', null);
    const error2 = new ValidationError('msg', 'field', undefined);
    assert.strictEqual(error1.value, null);
    assert.strictEqual(error2.value, undefined);
  });
});

test('ConfigurationError error', async (t) => {
  await t.test('should create with message', () => {
    const error = new ConfigurationError('Missing config');
    assert.strictEqual(error.name, 'ConfigurationError');
    assert.strictEqual(error.configKey, undefined);
  });

  await t.test('should store config key when provided', () => {
    const error = new ConfigurationError('Invalid port value', 'app.port');
    assert.strictEqual(error.configKey, 'app.port');
  });

  await t.test('should preserve dot notation in keys', () => {
    const error = new ConfigurationError('msg', 'database.connection.timeout');
    assert.strictEqual(error.configKey, 'database.connection.timeout');
  });
});

test('MemoryError error', async (t) => {
  await t.test('should create with message only', () => {
    const error = new MemoryError('Out of memory');
    assert.strictEqual(error.name, 'MemoryError');
    assert.strictEqual(error.requiredBytes, undefined);
    assert.strictEqual(error.availableBytes, undefined);
  });

  await t.test('should store required bytes', () => {
    const error = new MemoryError('Insufficient memory', 1024000);
    assert.strictEqual(error.requiredBytes, 1024000);
  });

  await t.test('should store available bytes', () => {
    const error = new MemoryError('msg', 1000, 512);
    assert.strictEqual(error.availableBytes, 512);
  });

  await t.test('should store both memory values', () => {
    const error = new MemoryError('Not enough memory', 10000000, 5000000);
    assert.strictEqual(error.requiredBytes, 10000000);
    assert.strictEqual(error.availableBytes, 5000000);
  });
});

test('NetworkError error', async (t) => {
  await t.test('should create with message only', () => {
    const error = new NetworkError('Connection failed');
    assert.strictEqual(error.name, 'NetworkError');
    assert.strictEqual(error.statusCode, undefined);
    assert.strictEqual(error.originalError, undefined);
  });

  await t.test('should store HTTP status code', () => {
    const error = new NetworkError('Not found', 404);
    assert.strictEqual(error.statusCode, 404);
  });

  await t.test('should store original error', () => {
    const original = new Error('Socket timeout');
    const error = new NetworkError('msg', 500, original);
    assert.strictEqual(error.originalError, original);
  });

  await t.test('should store both status and original error', () => {
    const original = new Error('DNS resolution failed');
    const error = new NetworkError('Network unreachable', 503, original);
    assert.strictEqual(error.statusCode, 503);
    assert.strictEqual(error.originalError, original);
  });

  await t.test('should handle various HTTP status codes', () => {
    [400, 401, 403, 404, 500, 502, 503, 504].forEach((code) => {
      const error = new NetworkError('msg', code);
      assert.strictEqual(error.statusCode, code);
    });
  });
});

// ============================================
// TYPE GUARD TESTS
// ============================================

test('isActorNotFound type guard', async (t) => {
  await t.test('should identify ActorNotFound errors', () => {
    const error = new ActorNotFound('actor-1');
    assert(isActorNotFound(error));
  });

  await t.test('should reject other error types', () => {
    assert(!isActorNotFound(new RouteNotFound('GET', '/')));
    assert(!isActorNotFound(new Error('Generic error')));
    assert(!isActorNotFound('not an error'));
    assert(!isActorNotFound(null));
    assert(!isActorNotFound(undefined));
  });
});

test('isRouteNotFound type guard', async (t) => {
  await t.test('should identify RouteNotFound errors', () => {
    const error = new RouteNotFound('GET', '/api');
    assert(isRouteNotFound(error));
  });

  await t.test('should reject other error types', () => {
    assert(!isRouteNotFound(new ActorNotFound('actor')));
    assert(!isRouteNotFound(new Error('Other error')));
    assert(!isRouteNotFound({}));
  });
});

test('isEventBusError type guard', async (t) => {
  await t.test('should identify EventBusError', () => {
    const error = new EventBusError('Publish failed');
    assert(isEventBusError(error));
  });

  await t.test('should reject non-EventBusError types', () => {
    assert(!isEventBusError(new TimeoutError('msg', 1000)));
    assert(!isEventBusError(new Error('msg')));
  });
});

test('isTimeoutError type guard', async (t) => {
  await t.test('should identify TimeoutError', () => {
    const error = new TimeoutError('Timed out', 5000);
    assert(isTimeoutError(error));
  });

  await t.test('should reject other error types', () => {
    assert(!isTimeoutError(new ValidationError('msg')));
    assert(!isTimeoutError(new Error('msg')));
  });
});

test('isValidationError type guard', async (t) => {
  await t.test('should identify ValidationError', () => {
    const error = new ValidationError('Invalid');
    assert(isValidationError(error));
  });

  await t.test('should work with all ValidationError variants', () => {
    assert(isValidationError(new ValidationError('msg')));
    assert(isValidationError(new ValidationError('msg', 'field')));
    assert(isValidationError(new ValidationError('msg', 'field', {})));
  });

  await t.test('should reject non-ValidationError types', () => {
    assert(!isValidationError(new ConfigurationError('msg')));
    assert(!isValidationError(new Error('msg')));
  });
});

test('isConfigurationError type guard', async (t) => {
  await t.test('should identify ConfigurationError', () => {
    const error = new ConfigurationError('Missing config');
    assert(isConfigurationError(error));
  });

  await t.test('should reject other error types', () => {
    assert(!isConfigurationError(new MemoryError('msg')));
    assert(!isConfigurationError(new Error('msg')));
  });
});

test('isMemoryError type guard', async (t) => {
  await t.test('should identify MemoryError', () => {
    const error = new MemoryError('Out of memory');
    assert(isMemoryError(error));
  });

  await t.test('should work with all MemoryError variants', () => {
    assert(isMemoryError(new MemoryError('msg')));
    assert(isMemoryError(new MemoryError('msg', 1000)));
    assert(isMemoryError(new MemoryError('msg', 1000, 500)));
  });
});

test('isNetworkError type guard', async (t) => {
  await t.test('should identify NetworkError', () => {
    const error = new NetworkError('Connection failed', 500);
    assert(isNetworkError(error));
  });

  await t.test('should work with all NetworkError variants', () => {
    assert(isNetworkError(new NetworkError('msg')));
    assert(isNetworkError(new NetworkError('msg', 404)));
    assert(isNetworkError(new NetworkError('msg', 500, new Error('original'))));
  });
});

test('isError type guard', async (t) => {
  await t.test('should identify Error instances', () => {
    assert(isError(new Error('test')));
    assert(isError(new ActorNotFound('actor')));
    assert(isError(new TimeoutError('msg', 100)));
  });

  await t.test('should reject non-Error types', () => {
    assert(!isError('error string'));
    assert(!isError(123));
    assert(!isError({}));
    assert(!isError(null));
    assert(!isError(undefined));
  });
});

// ============================================
// UTILITY FUNCTION TESTS
// ============================================

test('toError function', async (t) => {
  await t.test('should return Error instances unchanged', () => {
    const original = new Error('original');
    const result = toError(original);
    assert.strictEqual(result, original);
  });

  await t.test('should convert string to Error', () => {
    const result = toError('error message');
    assert(result instanceof Error);
    assert.strictEqual(result.message, 'error message');
  });

  await t.test('should convert object with message property', () => {
    const result = toError({ message: 'object error' });
    assert(result instanceof Error);
    assert.strictEqual(result.message, 'object error');
  });

  await t.test('should convert number to Error', () => {
    const result = toError(42);
    assert(result instanceof Error);
    assert.match(result.message, /42/);
  });

  await t.test('should convert boolean to Error', () => {
    const result = toError(true);
    assert(result instanceof Error);
  });

  await t.test('should convert null to Error', () => {
    const result = toError(null);
    assert(result instanceof Error);
  });

  await t.test('should convert undefined to Error', () => {
    const result = toError(undefined);
    assert(result instanceof Error);
  });

  await t.test('should handle objects without message', () => {
    const result = toError({ code: 'ERR_CODE' });
    assert(result instanceof Error);
    assert.ok(result.message.length > 0);
  });
});

test('getErrorMessage function', async (t) => {
  await t.test('should extract message from Error instance', () => {
    const error = new Error('test message');
    assert.strictEqual(getErrorMessage(error), 'test message');
  });

  await t.test('should return string unchanged', () => {
    assert.strictEqual(getErrorMessage('string error'), 'string error');
  });

  await t.test('should extract message from object', () => {
    assert.strictEqual(
      getErrorMessage({ message: 'object message' }),
      'object message'
    );
  });

  await t.test('should convert non-string message to string', () => {
    const message = getErrorMessage({ message: 123 });
    assert.strictEqual(typeof message, 'string');
  });

  await t.test('should handle null message property', () => {
    const result = getErrorMessage({ message: null });
    assert.strictEqual(typeof result, 'string');
  });

  await t.test('should stringify non-object, non-string values', () => {
    assert.match(getErrorMessage(42), /42/);
    assert.match(getErrorMessage(true), /true/);
    assert.match(getErrorMessage([1, 2, 3]), /1,2,3/);
  });

  await t.test('should extract message from Error subclasses', () => {
    const error = new ActorNotFound('actor-123');
    const message = getErrorMessage(error);
    assert.match(message, /actor-123/);
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

test('Error type system integration', async (t) => {
  await t.test('should create error and identify it with type guard', () => {
    const error = new TimeoutError('Request timed out', 5000);
    assert(isTimeoutError(error));
    assert(isError(error));
  });

  await t.test('should convert error and extract message', () => {
    const original = new ValidationError('Field is required', 'email');
    const converted = toError(original);
    const message = getErrorMessage(converted);
    assert(isValidationError(converted));
    assert.match(message, /required/i);
  });

  await t.test('should handle error in catch block', () => {
    try {
      throw new NetworkError('Fetch failed', 500);
    } catch (e) {
      const error = toError(e);
      assert(isNetworkError(error));
      if (isNetworkError(error)) {
        assert.strictEqual(error.statusCode, 500);
      }
    }
  });

  await t.test('should use type guards for error-specific handling', () => {
    const errors = [
      new ActorNotFound('actor-1'),
      new TimeoutError('slow', 1000),
      new ValidationError('invalid', 'field'),
      new NetworkError('failed', 404),
    ];

    let actorErrors = 0;
    let timeoutErrors = 0;
    let validationErrors = 0;
    let networkErrors = 0;

    for (const e of errors) {
      if (isActorNotFound(e)) actorErrors++;
      else if (isTimeoutError(e)) timeoutErrors++;
      else if (isValidationError(e)) validationErrors++;
      else if (isNetworkError(e)) networkErrors++;
    }

    assert.strictEqual(actorErrors, 1);
    assert.strictEqual(timeoutErrors, 1);
    assert.strictEqual(validationErrors, 1);
    assert.strictEqual(networkErrors, 1);
  });
});
