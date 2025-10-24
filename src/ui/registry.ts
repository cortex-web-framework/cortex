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
import { uiRadioMetadata } from './components/radio/ui-radio.metadata.js';
import { uiToggleMetadata } from './components/toggle/ui-toggle.metadata.js';
import { uiNumberInputMetadata } from './components/number-input/ui-number-input.metadata.js';
import { uiDatePickerMetadata } from './components/date-picker/ui-date-picker.metadata.js';
import { uiAutocompleteMetadata } from './components/autocomplete/ui-autocomplete.metadata.js';
import { uiColorPickerMetadata } from './components/color-picker/ui-color-picker.metadata.js';
import { uiFileUploadMetadata } from './components/file-upload/ui-file-upload.metadata.js';
import { uiModalMetadata } from './components/modal/ui-modal.metadata.js';
import { uiAlertMetadata } from './components/alert/ui-alert.metadata.js';
import { uiTabsMetadata } from './components/tabs/ui-tabs.metadata.js';
import { uiSpinnerMetadata } from './components/spinner/ui-spinner.metadata.js';
import { uiPaginationMetadata } from './components/pagination/ui-pagination.metadata.js';

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
  globalRegistry.register(uiRadioMetadata);
  globalRegistry.register(uiToggleMetadata);
  globalRegistry.register(uiNumberInputMetadata);
  globalRegistry.register(uiDatePickerMetadata);
  globalRegistry.register(uiAutocompleteMetadata);
  globalRegistry.register(uiColorPickerMetadata);
  globalRegistry.register(uiFileUploadMetadata);
  globalRegistry.register(uiModalMetadata);
  globalRegistry.register(uiAlertMetadata);
  globalRegistry.register(uiTabsMetadata);
  globalRegistry.register(uiSpinnerMetadata);
  globalRegistry.register(uiPaginationMetadata);
}

/**
 * Get the global component registry.
 * Make sure to call registerAllComponents() before using this.
 */
export { globalRegistry };
