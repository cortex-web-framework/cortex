/**
 * Strict TypeScript types and interfaces for ui-label component.
 */

/**
 * Public API interface for ui-label.
 */
export interface ILabelElement extends HTMLElement {
  /**
   * Get/set the ID of the associated form control.
   */
  for: string;

  /**
   * Get/set whether the label indicates a required field.
   */
  required: boolean;

  /**
   * Get/set whether the label is disabled.
   */
  disabled: boolean;

  /**
   * Focus the label (for accessibility).
   */
  focus(): void;

  /**
   * Blur the label (for accessibility).
   */
  blur(): void;
}

/**
 * Component state interface (internal use).
 */
export interface LabelState {
  for: string;
  required: boolean;
  disabled: boolean;
}
