/**
 * Strict TypeScript types and interfaces for ui-form-field component.
 */

/**
 * Public API interface for ui-form-field.
 */
export interface IFormFieldElement extends HTMLElement {
  /**
   * Get/set the error message displayed below the input.
   */
  error: string | null;

  /**
   * Get/set the hint text displayed below the input.
   */
  hint: string | null;

  /**
   * Get/set whether the field is required.
   */
  required: boolean;

  /**
   * Get/set whether the field is disabled.
   */
  disabled: boolean;
}

/**
 * Component state interface (internal use).
 */
export interface FormFieldState {
  error: string | null;
  hint: string | null;
  required: boolean;
  disabled: boolean;
}
