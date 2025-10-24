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
import { uiAccordionMetadata } from './components/accordion/ui-accordion.metadata.js';
import { uiProgressBarMetadata } from './components/progress-bar/ui-progress-bar.metadata.js';
import { uiBreadcrumbMetadata } from './components/breadcrumb/ui-breadcrumb.metadata.js';
import { uiStepperMetadata } from './components/stepper/ui-stepper.metadata.js';
import { uiBadgeMetadata } from './components/badge/ui-badge.metadata.js';
import { uiCardMetadata } from './components/card/ui-card.metadata.js';
import { uiDividerMetadata } from './components/divider/ui-divider.metadata.js';
import { uiAvatarMetadata } from './components/avatar/ui-avatar.metadata.js';
import { uiChipMetadata } from './components/chip/ui-chip.metadata.js';
import { uiSkeletonMetadata } from './components/skeleton/ui-skeleton.metadata.js';
import { uiLinkMetadata } from './components/link/ui-link.metadata.js';
import { uiTooltipMetadata } from './components/tooltip/ui-tooltip.metadata.js';
import { uiPopoverMetadata } from './components/popover/ui-popover.metadata.js';
import { uiToastMetadata } from './components/toast/ui-toast.metadata.js';
import { uiCodeMetadata } from './components/code/ui-code.metadata.js';
import { uiTagMetadata } from './components/tag/ui-tag.metadata.js';
import { uiEmptyStateMetadata } from './components/empty-state/ui-empty-state.metadata.js';
import { uiRatingMetadata } from './components/rating/ui-rating.metadata.js';
import { uiStatMetadata } from './components/stat/ui-stat.metadata.js';
import { uiProgressCircleMetadata } from './components/progress-circle/ui-progress-circle.metadata.js';

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
  globalRegistry.register(uiAccordionMetadata);
  globalRegistry.register(uiProgressBarMetadata);
  globalRegistry.register(uiBreadcrumbMetadata);
  globalRegistry.register(uiStepperMetadata);
  globalRegistry.register(uiBadgeMetadata);
  globalRegistry.register(uiCardMetadata);
  globalRegistry.register(uiDividerMetadata);
  globalRegistry.register(uiAvatarMetadata);
  globalRegistry.register(uiChipMetadata);
  globalRegistry.register(uiSkeletonMetadata);
  globalRegistry.register(uiLinkMetadata);
  globalRegistry.register(uiTooltipMetadata);
  globalRegistry.register(uiPopoverMetadata);
  globalRegistry.register(uiToastMetadata);
  globalRegistry.register(uiCodeMetadata);
  globalRegistry.register(uiTagMetadata);
  globalRegistry.register(uiEmptyStateMetadata);
  globalRegistry.register(uiRatingMetadata);
  globalRegistry.register(uiStatMetadata);
  globalRegistry.register(uiProgressCircleMetadata);
}

/**
 * Get the global component registry.
 * Make sure to call registerAllComponents() before using this.
 */
export { globalRegistry };
