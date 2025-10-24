/**
 * Strict TypeScript types and interfaces for ui-textarea component.
 */

/**
 * Validation result interface for textarea.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  message: string;
}

/**
 * Public API interface for ui-textarea.
 */
export interface ITextareaElement extends HTMLElement {
  /**
   * Get/set the textarea value.
   */
  value: string;

  /**
   * Get/set the placeholder text.
   */
  placeholder: string;

  /**
   * Get/set the label text.
   */
  label?: string;

  /**
   * Get/set the number of rows.
   */
  rows: number;

  /**
   * Get/set the number of columns.
   */
  cols: number;

  /**
   * Get/set the disabled state.
   */
  disabled: boolean;

  /**
   * Get/set the readonly state.
   */
  readonly: boolean;

  /**
   * Get/set whether the textarea is required.
   */
  required: boolean;

  /**
   * Get/set the maximum character length.
   */
  maxLength: number;

  /**
   * Get/set the minimum character length.
   */
  minLength: number;

  /**
   * Get/set the form field name.
   */
  name: string;

  /**
   * Get the validation message.
   */
  readonly validationMessage: string;

  /**
   * Focus the textarea.
   */
  focus(): void;

  /**
   * Blur the textarea.
   */
  blur(): void;

  /**
   * Select all text in the textarea.
   */
  select(): void;

  /**
   * Check if the textarea is valid.
   */
  checkValidity(): boolean;

  /**
   * Get validation result details.
   */
  getValidationResult(): ValidationResult;

  /**
   * Reset the textarea to empty value.
   */
  reset(): void;
}

/**
 * Component state interface (internal use).
 */
export interface TextareaState {
  value: string;
  placeholder: string;
  label?: string;
  rows: number;
  cols: number;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  maxLength: number;
  minLength: number;
  name: string;
  isValid: boolean;
}
