/**
 * Central registry for all Cortex UI components.
 * This module imports and registers metadata for all components.
 * Zero external dependencies - pure TypeScript.
 */

import { globalRegistry } from './metadata.js';
import { uiButtonMetadata } from './components/button/ui-button.metadata.js';
import { uiTextInputMetadata } from './components/text-input/ui-text-input.metadata.js';

/**
 * Register all component metadata.
 * Call this function once during application initialization.
 */
export function registerAllComponents(): void {
  globalRegistry.register(uiButtonMetadata);
  globalRegistry.register(uiTextInputMetadata);
}

/**
 * Get the global component registry.
 * Make sure to call registerAllComponents() before using this.
 */
export { globalRegistry };
