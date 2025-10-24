/**
 * Strict TypeScript types and interfaces for ui-checkbox component.
 */

/**
 * Change event detail for checkbox.
 */
export interface CheckboxChangeDetail {
  checked: boolean;
  value: string;
  name: string;
}

/**
 * Configuration interface for ui-checkbox component.
 */
export interface CheckboxConfig {
  /**
   * Whether the checkbox is checked.
   */
  checked?: boolean;

  /**
   * Whether the checkbox is disabled.
   */
  disabled?: boolean;

  /**
   * Label text displayed next to the checkbox.
   */
  label?: string;

  /**
   * Value of the checkbox for form submission.
   */
  value?: string;

  /**
   * Whether the checkbox is required.
   */
  required?: boolean;

  /**
   * Indeterminate state (tri-state checkbox).
   */
  indeterminate?: boolean;

  /**
   * Form field name.
   */
  name?: string;
}

/**
 * Public API interface for ui-checkbox.
 */
export interface ICheckboxElement extends HTMLElement {
  /**
   * Get/set the checked state.
   */
  checked: boolean;

  /**
   * Get/set the disabled state.
   */
  disabled: boolean;

  /**
   * Get/set the label text.
   */
  label?: string;

  /**
   * Get/set the value.
   */
  value: string;

  /**
   * Get/set the required state.
   */
  required: boolean;

  /**
   * Get/set the indeterminate state (tri-state).
   */
  indeterminate: boolean;

  /**
   * Get/set the form field name.
   */
  name: string;

  /**
   * Focus the checkbox.
   */
  focus(): void;

  /**
   * Blur the checkbox.
   */
  blur(): void;

  /**
   * Toggle the checked state.
   */
  toggle(): void;

  /**
   * Check if the checkbox is valid (required validation).
   * @returns true if valid, false otherwise
   */
  checkValidity(): boolean;

  /**
   * Get validation error message.
   */
  readonly validationMessage: string;

  /**
   * Get the internal checkbox input element (for testing).
   */
  getInputElement?(): HTMLInputElement | null;
}

/**
 * Component state interface (internal use).
 */
export interface CheckboxState {
  checked: boolean;
  disabled: boolean;
  label?: string;
  value: string;
  required: boolean;
  indeterminate: boolean;
  name: string;
  isFocused: boolean;
  isValid: boolean;
}
