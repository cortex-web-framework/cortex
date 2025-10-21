/**
 * Generate a random trace ID (32 hex characters, 128 bits)
 */
export function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a random span ID (16 hex characters, 64 bits)
 */
export function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a random trace flags (8 bits)
 */
export function generateTraceFlags(): number {
  return Math.floor(Math.random() * 256);
}
