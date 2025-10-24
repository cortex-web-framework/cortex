/**
 * Central registry for all Cortex UI components.
 * This module imports and registers metadata for all components.
 * Zero external dependencies - pure TypeScript.
 */

import { globalRegistry } from './metadata.js';
import { uiButtonMetadata } from './components/button/ui-button.metadata.js';
import { uiTextInputMetadata } from './components/text-input/ui-text-input.metadata.js';
import { uiCheckboxMetadata } from './components/checkbox/ui-checkbox.metadata.js';
import { uiSelectMetadata } from './components/select/ui-select.metadata.js';
import { uiLabelMetadata } from './components/label/ui-label.metadata.js';
import { uiFormFieldMetadata } from './components/form-field/ui-form-field.metadata.js';
import { uiTextareaMetadata } from './components/textarea/ui-textarea.metadata.js';

/**
 * Register all component metadata.
 * Call this function once during application initialization.
 */
export function registerAllComponents(): void {
  globalRegistry.register(uiButtonMetadata);
  globalRegistry.register(uiTextInputMetadata);
  globalRegistry.register(uiCheckboxMetadata);
  globalRegistry.register(uiSelectMetadata);
  globalRegistry.register(uiLabelMetadata);
  globalRegistry.register(uiFormFieldMetadata);
  globalRegistry.register(uiTextareaMetadata);
}

/**
 * Get the global component registry.
 * Make sure to call registerAllComponents() before using this.
 */
export { globalRegistry };
