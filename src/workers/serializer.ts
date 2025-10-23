/**
 * Structured Cloning with Type Preservation
 * Handles serialization and deserialization of complex types
 * for worker message communication
 */

import {
  DataTypeHint,
  TypeInformation,
  detectDataType,
  isSerializable,
  ErrorCode
} from "./messageProtocol.js";

/**
 * Type serialization handler
 */
interface TypeHandler {
  canHandle: (value: unknown) => boolean;
  serialize: (value: unknown) => unknown;
  deserialize: (value: unknown, typeInfo?: TypeInformation) => unknown;
}

/**
 * Serialized value wrapper
 */
interface SerializedValue {
  value: unknown;
  typeInfo?: TypeInformation;
}

/**
 * Serialization options
 */
export interface SerializationOptions {
  preserveTypes: boolean;
  includeTypeInfo: boolean;
  maxDepth: number;
  circularRefStrategy: "error" | "ignore" | "replace";
  customHandlers?: Map<string, TypeHandler>;
}

/**
 * Default serialization options
 */
export const DEFAULT_SERIALIZATION_OPTIONS: SerializationOptions = {
  preserveTypes: false,
  includeTypeInfo: false,
  maxDepth: 100,
  circularRefStrategy: "error"
};

/**
 * Built-in type handlers for common types
 */
const BUILT_IN_HANDLERS: Record<string, TypeHandler> = {
  Date: {
    canHandle: (value: unknown): value is Date => value instanceof Date,
    serialize: (value: unknown): string => {
      const date = value as Date;
      return date.toISOString();
    },
    deserialize: (value: unknown): Date => {
      return new Date(value as string);
    }
  },

  Map: {
    canHandle: (value: unknown): value is Map<any, any> => value instanceof Map,
    serialize: (value: unknown): any => {
      const map = value as Map<any, any>;
      const entries: [unknown, unknown][] = [];
      for (const [key, val] of map) {
        entries.push([key, val]);
      }
      return { entries, size: map.size };
    },
    deserialize: (value: unknown): Map<any, any> => {
      const obj = value as any;
      const map = new Map();
      if (Array.isArray(obj.entries)) {
        for (const [key, val] of obj.entries) {
          map.set(key, val);
        }
      }
      return map;
    }
  },

  Set: {
    canHandle: (value: unknown): value is Set<any> => value instanceof Set,
    serialize: (value: unknown): any => {
      const set = value as Set<any>;
      const values = Array.from(set);
      return { values, size: set.size };
    },
    deserialize: (value: unknown): Set<any> => {
      const obj = value as any;
      const set = new Set();
      if (Array.isArray(obj.values)) {
        for (const val of obj.values) {
          set.add(val);
        }
      }
      return set;
    }
  },

  RegExp: {
    canHandle: (value: unknown): value is RegExp => value instanceof RegExp,
    serialize: (value: unknown): any => {
      const regex = value as RegExp;
      return {
        source: regex.source,
        flags: regex.flags,
        lastIndex: regex.lastIndex
      };
    },
    deserialize: (value: unknown): RegExp => {
      const obj = value as any;
      return new RegExp(obj.source, obj.flags);
    }
  },

  Error: {
    canHandle: (value: unknown): value is Error => value instanceof Error,
    serialize: (value: unknown): any => {
      const error = value as Error;
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: (error as any).cause
      };
    },
    deserialize: (value: unknown): Error => {
      const obj = value as any;
      const error = new Error(obj.message);
      error.name = obj.name || "Error";
      if (obj.stack) {
        Object.defineProperty(error, "stack", {
          value: obj.stack,
          writable: true,
          configurable: true
        });
      }
      if (obj.cause) {
        (error as any).cause = obj.cause;
      }
      return error;
    }
  }
};

/**
 * Serializer for worker messages with type preservation
 */
export class MessageSerializer {
  private readonly options: SerializationOptions;
  private readonly handlers: Map<string, TypeHandler>;
  private visited: WeakMap<object, unknown> = new WeakMap();

  constructor(options: Partial<SerializationOptions> = {}) {
    this.options = { ...DEFAULT_SERIALIZATION_OPTIONS, ...options };
    this.handlers = new Map(Object.entries(BUILT_IN_HANDLERS));

    // Add custom handlers
    if (options.customHandlers) {
      for (const [key, handler] of options.customHandlers) {
        this.handlers.set(key, handler);
      }
    }
  }

  /**
   * Serialize a value with optional type preservation
   */
  serialize(value: unknown, depth: number = 0): SerializedValue {
    // Check max depth
    if (depth > this.options.maxDepth) {
      throw new Error(
        `Serialization max depth exceeded (${depth} > ${this.options.maxDepth})`
      );
    }

    // Check for circular references
    if (typeof value === "object" && value !== null) {
      if (this.visited.has(value)) {
        switch (this.options.circularRefStrategy) {
          case "error":
            throw new Error("Circular reference detected during serialization");
          case "ignore":
            return { value: undefined };
          case "replace":
            return { value: "[Circular Reference]" };
        }
      }

      // Mark as visited
      if (typeof value === "object" && value !== null) {
        this.visited.set(value, value);
      }
    }

    // Get type hint
    const typeHint = detectDataType(value);

    // Try built-in handlers first
    for (const handler of this.handlers.values()) {
      if (handler.canHandle(value)) {
        const serialized = handler.serialize(value);
        const typeInfo = this.options.includeTypeInfo
          ? this.getTypeInfo(value)
          : undefined;

        return {
          value: serialized,
          typeInfo
        };
      }
    }

    // Default serialization based on type
    return this.serializeByType(value, typeHint, depth);
  }

  /**
   * Serialize based on detected type
   */
  private serializeByType(
    value: unknown,
    typeHint: DataTypeHint,
    depth: number
  ): SerializedValue {
    const typeInfo = this.options.includeTypeInfo
      ? this.getTypeInfo(value)
      : undefined;

    switch (typeHint) {
      case DataTypeHint.Primitive:
        return { value, typeInfo };

      case DataTypeHint.Array: {
        const arr = value as unknown[];
        const serialized = arr.map((item) => this.serialize(item, depth + 1).value);
        return { value: serialized, typeInfo };
      }

      case DataTypeHint.PlainObject: {
        const obj = value as Record<string, unknown>;
        const serialized: Record<string, unknown> = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const itemValue = obj[key];
            if (typeof itemValue === "function") {
              // Skip functions
              continue;
            }
            serialized[key] = this.serialize(itemValue, depth + 1).value;
          }
        }
        return { value: serialized, typeInfo };
      }

      case DataTypeHint.Date:
      case DataTypeHint.Map:
      case DataTypeHint.Set:
      case DataTypeHint.Regex:
        // Already handled by handlers above
        return { value, typeInfo };

      case DataTypeHint.ArrayBuffer: {
        const buffer = value as ArrayBuffer;
        return { value: buffer, typeInfo };
      }

      case DataTypeHint.TypedArray: {
        const typed = value as any;
        return { value: typed, typeInfo };
      }

      default:
        return { value, typeInfo };
    }
  }

  /**
   * Deserialize a value with optional type restoration
   */
  deserialize(serialized: unknown, typeInfo?: TypeInformation): unknown {
    if (!this.options.preserveTypes || !typeInfo) {
      return serialized;
    }

    // Try to reconstruct using handler
    const handler = this.handlers.get(typeInfo.constructorName);
    if (handler) {
      return handler.deserialize(serialized, typeInfo);
    }

    // Default deserialization
    return serialized;
  }

  /**
   * Get type information for a value
   */
  private getTypeInfo(value: unknown): TypeInformation {
    if (value === null) {
      return { constructorName: "Null", version: 1 };
    }

    if (value === undefined) {
      return { constructorName: "Undefined", version: 1 };
    }

    const type = typeof value;

    if (type === "object") {
      const constructor = Object.getPrototypeOf(value).constructor;
      const constructorName = constructor?.name || "Object";

      return {
        constructorName,
        version: 1,
        schema: this.getSchema(value as object)
      };
    }

    return {
      constructorName: type.charAt(0).toUpperCase() + type.slice(1),
      version: 1
    };
  }

  /**
   * Get schema information for validation
   */
  private getSchema(obj: object): Record<string, unknown> | undefined {
    if (Array.isArray(obj)) {
      return {
        type: "array",
        length: obj.length
      };
    }

    if (obj instanceof Map) {
      return {
        type: "map",
        size: obj.size
      };
    }

    if (obj instanceof Set) {
      return {
        type: "set",
        size: obj.size
      };
    }

    if (obj instanceof Date) {
      return {
        type: "date",
        time: obj.getTime()
      };
    }

    if (obj instanceof RegExp) {
      return {
        type: "regexp",
        source: obj.source,
        flags: obj.flags
      };
    }

    // For plain objects, include property names
    if (Object.getPrototypeOf(obj) === Object.prototype) {
      const properties: Record<string, string> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          properties[key] = typeof (obj as any)[key];
        }
      }
      return {
        type: "object",
        properties
      };
    }

    return undefined;
  }

  /**
   * Reset visited map for new serialization cycle
   */
  reset(): void {
    this.visited = new WeakMap();
  }
}

/**
 * Error serializer for safe error transmission
 */
export class ErrorSerializer {
  /**
   * Serialize an error to a transmittable format
   */
  static serialize(error: unknown): Record<string, unknown> {
    let message = "Unknown error";
    let code = ErrorCode.UnknownError;
    let name = "Error";
    let stack: string | undefined;
    let cause: unknown;
    let retryable = false;

    if (error instanceof Error) {
      message = error.message;
      name = error.name;
      stack = error.stack;
      cause = (error as any).cause;

      // Determine code from error type
      switch (name) {
        case "TypeError":
          code = ErrorCode.ValidationError;
          break;
        case "RangeError":
          code = ErrorCode.ValidationError;
          break;
        case "SyntaxError":
          code = ErrorCode.DeserializationError;
          break;
        case "TimeoutError":
          code = ErrorCode.TimeoutError;
          retryable = true;
          break;
        default:
          code = ErrorCode.TaskExecutionError;
      }
    } else if (typeof error === "string") {
      message = error;
    } else if (typeof error === "object" && error !== null) {
      const obj = error as any;
      message = obj.message || String(error);
      name = obj.name || "Error";
      code = obj.code || ErrorCode.UnknownError;
    }

    // Truncate stack to prevent huge messages
    if (stack) {
      const lines = stack.split("\n");
      if (lines.length > 50) {
        stack = lines.slice(0, 50).join("\n") + "\n... (truncated)";
      }
    }

    return {
      message,
      code,
      errorType: name,
      stack,
      cause,
      retryable
    };
  }

  /**
   * Deserialize an error from transmitted format
   */
  static deserialize(data: Record<string, unknown>): Error {
    const message = (data.message as string) || "Unknown error";
    const error = new Error(message);

    if (data.errorType) {
      error.name = data.errorType as string;
    }

    if (data.stack) {
      Object.defineProperty(error, "stack", {
        value: data.stack,
        writable: true,
        configurable: true
      });
    }

    if (data.cause) {
      (error as any).cause = data.cause;
    }

    return error;
  }
}

/**
 * Validation helper for message payloads
 */
export class MessageValidator {
  /**
   * Validate that a value is serializable
   */
  static validateSerializable(value: unknown): boolean {
    return isSerializable(value);
  }

  /**
   * Validate message structure against schema
   */
  static validateAgainstSchema(
    payload: unknown,
    schema: Record<string, unknown>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof payload !== "object" || payload === null) {
      errors.push(`Expected object, got ${typeof payload}`);
      return { valid: false, errors };
    }

    // This is a simplified schema validator
    // In production, use JSON Schema validation library
    const obj = payload as Record<string, unknown>;

    if ((schema as any).required) {
      for (const field of (schema as any).required) {
        if (!(field in obj)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
