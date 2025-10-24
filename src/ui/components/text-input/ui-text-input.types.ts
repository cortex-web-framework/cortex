/**
 * Strict TypeScript types and interfaces for ui-text-input component.
 */

/**
 * Valid input types for text input.
 */
export type TextInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'url'
  | 'tel'
  | 'date'
  | 'time'
  | 'search';

/**
 * Input event detail emitted by ui-text-input.
 */
export interface TextInputChangeEvent extends CustomEvent {
  type: 'input' | 'change';
  detail: {
    value: string;
    valid: boolean;
  };
}

/**
 * Validation error type.
 */
export type ValidationError =
  | 'required'
  | 'invalid-email'
  | 'invalid-pattern'
  | 'too-long'
  | 'invalid-type';

/**
 * Validation result interface.
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  message: string;
}

/**
 * Configuration interface for ui-text-input component.
 */
export interface TextInputConfig {
  /**
   * The current value of the input.
   */
  value: string;

  /**
   * Placeholder text displayed when input is empty.
   */
  placeholder?: string;

  /**
   * The type of input (text, email, password, etc).
   */
  type?: TextInputType;

  /**
   * Label text displayed above the input.
   */
  label?: string;

  /**
   * Whether the input is disabled.
   */
  disabled?: boolean;

  /**
   * Whether the input is read-only.
   */
  readonly?: boolean;

  /**
   * Whether the input is required.
   */
  required?: boolean;

  /**
   * Maximum length of input value.
   */
  maxLength?: number;

  /**
   * Validation pattern (regex).
   */
  pattern?: string;

  /**
   * Form field name for form submission.
   */
  name?: string;

  /**
   * Custom CSS class for styling.
   */
  class?: string;
}

/**
 * Public API interface for ui-text-input.
 */
export interface ITextInputElement extends HTMLElement {
  /**
   * Get/set the input value.
   */
  value: string;

  /**
   * Get/set the placeholder text.
   */
  placeholder: string;

  /**
   * Get/set the input type.
   */
  type: TextInputType;

  /**
   * Get/set the label text.
   */
  label?: string;

  /**
   * Get/set disabled state.
   */
  disabled: boolean;

  /**
   * Get/set read-only state.
   */
  readonly: boolean;

  /**
   * Get/set required state.
   */
  required: boolean;

  /**
   * Get/set maximum length.
   */
  maxLength: number;

  /**
   * Get/set validation pattern.
   */
  pattern: string;

  /**
   * Get/set form field name.
   */
  name: string;

  /**
   * Check if the input is valid.
   * @returns true if valid, false otherwise
   */
  checkValidity(): boolean;

  /**
   * Get validation error message.
   */
  readonly validationMessage: string;

  /**
   * Get detailed validation result.
   */
  getValidationResult(): ValidationResult;

  /**
   * Focus the input.
   */
  focus(): void;

  /**
   * Blur the input.
   */
  blur(): void;

  /**
   * Select all text in the input.
   */
  select(): void;

  /**
   * Set the selection range.
   * @param start Start position
   * @param end End position
   */
  setSelectionRange(start: number, end: number): void;

  /**
   * Reset the input to initial state.
   */
  reset(): void;

  /**
   * Get the internal input element (for testing).
   */
  getInputElement?(): HTMLInputElement | null;
}

/**
 * Component state interface (internal use).
 */
export interface TextInputState {
  value: string;
  placeholder: string;
  type: TextInputType;
  label?: string;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  maxLength: number;
  pattern: string;
  name: string;
  isDirty: boolean;
  isFocused: boolean;
  isValid: boolean;
  validationErrors: ValidationError[];
}
