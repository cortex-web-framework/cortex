/**
 * Strict TypeScript types and interfaces for ui-select component.
 */

/**
 * Option definition for select dropdown.
 */
export interface SelectOption {
  /**
   * Display label shown to user.
   */
  label: string;

  /**
   * Value returned when option is selected.
   */
  value: string;

  /**
   * Optional description for the option.
   */
  description?: string;

  /**
   * Whether this option is disabled.
   */
  disabled?: boolean;

  /**
   * Optional group name for grouping options.
   */
  group?: string;
}

/**
 * Change event detail for select.
 */
export interface SelectChangeDetail {
  value: string | string[] | null;
  label?: string | string[];
  previousValue?: string | string[] | null;
}

/**
 * Configuration interface for ui-select component.
 */
export interface SelectConfig {
  /**
   * Array of available options.
   */
  options?: SelectOption[];

  /**
   * Current selected value(s).
   */
  value?: string | string[] | null;

  /**
   * Placeholder text when no selection.
   */
  placeholder?: string;

  /**
   * Label displayed above select.
   */
  label?: string;

  /**
   * Whether multiple selections are allowed.
   */
  multiple?: boolean;

  /**
   * Whether the select is disabled.
   */
  disabled?: boolean;

  /**
   * Whether the select is required.
   */
  required?: boolean;

  /**
   * Whether search/filter is enabled.
   */
  searchable?: boolean;

  /**
   * Form field name.
   */
  name?: string;

  /**
   * Clear button visible when multiple.
   */
  clearable?: boolean;
}

/**
 * Public API interface for ui-select.
 */
export interface ISelectElement extends HTMLElement {
  /**
   * Get/set the available options.
   */
  options: SelectOption[];

  /**
   * Get/set the selected value(s).
   */
  value: string | string[] | null;

  /**
   * Get/set the placeholder text.
   */
  placeholder: string;

  /**
   * Get/set the label text.
   */
  label?: string;

  /**
   * Get/set whether multiple selections allowed.
   */
  multiple: boolean;

  /**
   * Get/set the disabled state.
   */
  disabled: boolean;

  /**
   * Get/set the required state.
   */
  required: boolean;

  /**
   * Get/set whether search is enabled.
   */
  searchable: boolean;

  /**
   * Get/set the form field name.
   */
  name: string;

  /**
   * Get whether the select is currently open.
   */
  readonly isOpen: boolean;

  /**
   * Get the currently highlighted option index.
   */
  readonly highlightedIndex: number;

  /**
   * Open the dropdown.
   */
  open(): void;

  /**
   * Close the dropdown.
   */
  close(): void;

  /**
   * Toggle the dropdown open/closed.
   */
  toggle(): void;

  /**
   * Focus the select.
   */
  focus(): void;

  /**
   * Blur the select.
   */
  blur(): void;

  /**
   * Clear the current selection.
   */
  clearSelection(): void;

  /**
   * Toggle an option in multiple mode.
   * @param value Option value to toggle
   */
  toggleOption(value: string): void;

  /**
   * Search/filter options by text.
   * @param query Search query
   */
  search(query: string): void;

  /**
   * Check if the select is valid.
   * @returns true if valid, false otherwise
   */
  checkValidity(): boolean;

  /**
   * Get validation error message.
   */
  readonly validationMessage: string;

  /**
   * Get the internal button element (for testing).
   */
  getButtonElement?(): HTMLButtonElement | null;

  /**
   * Get the internal listbox element (for testing).
   */
  getListboxElement?(): HTMLElement | null;
}

/**
 * Component state interface (internal use).
 */
export interface SelectState {
  options: SelectOption[];
  value: string | string[] | null;
  placeholder: string;
  label?: string;
  multiple: boolean;
  disabled: boolean;
  required: boolean;
  searchable: boolean;
  name: string;
  isOpen: boolean;
  isFocused: boolean;
  highlightedIndex: number;
  searchQuery: string;
  isValid: boolean;
}
