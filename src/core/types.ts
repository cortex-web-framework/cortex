/**
 * Core Type Aliases and Definitions
 * Central location for all fundamental type definitions used across the framework
 * Provides type safety and consistency across modules
 */

/**
 * Unique identifier for an Actor instance
 */
export type ActorId = string & { readonly __brand: 'ActorId' };

/**
 * Topic identifier for EventBus subscriptions
 */
export type EventTopic = string & { readonly __brand: 'EventTopic' };

/**
 * Generic event message that can be published on EventBus
 */
export interface EventMessage {
  readonly type: string;
  readonly topic: EventTopic;
  readonly timestamp: number;
  readonly data: unknown;
}

/**
 * Generic request-response message for Actor communication
 */
export interface ActorMessage {
  readonly id: string;
  readonly from: ActorId;
  readonly to: ActorId;
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: number;
}

/**
 * Response to an ActorMessage
 */
export interface ActorResponse {
  readonly messageId: string;
  readonly from: ActorId;
  readonly to: ActorId;
  readonly status: 'success' | 'error';
  readonly result?: unknown;
  readonly error?: string;
}

/**
 * Handler function type for EventBus subscriptions
 */
export type EventHandler = (event: EventMessage) => void | Promise<void>;

/**
 * Handler function type for Actor message handlers
 */
export type ActorMessageHandler = (message: ActorMessage) => ActorResponse | Promise<ActorResponse>;

/**
 * Configuration options for Actor initialization
 */
export interface ActorConfig {
  readonly id?: ActorId;
  readonly autoRestart?: boolean;
  readonly restartDelay?: number;
  readonly maxRestarts?: number;
}

/**
 * Type guard for ActorId
 */
export function createActorId(id: string): ActorId {
  return id as ActorId;
}

/**
 * Type guard for EventTopic
 */
export function createEventTopic(topic: string): EventTopic {
  return topic as EventTopic;
}

/**
 * Check if a value is a valid EventMessage
 */
export function isEventMessage(value: unknown): value is EventMessage {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.type === 'string' &&
    typeof obj.topic === 'string' &&
    typeof obj.timestamp === 'number' &&
    obj.data !== undefined
  );
}

/**
 * Check if a value is a valid ActorMessage
 */
export function isActorMessage(value: unknown): value is ActorMessage {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.from === 'string' &&
    typeof obj.to === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.timestamp === 'number' &&
    obj.payload !== undefined
  );
}
