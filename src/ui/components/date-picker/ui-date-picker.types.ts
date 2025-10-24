/**
 * Strict TypeScript types for ui-date-picker component.
 */

export interface DateRange {
  start: Date;
  end: Date;
}

export interface IDatePickerElement extends HTMLElement {
  value: Date | DateRange | null;
  min: Date | null;
  max: Date | null;
  disabledDates: Date[];
  label?: string;
  name: string;
  required: boolean;
  disabled: boolean;
  range: boolean;
  readonly isOpen: boolean;
  readonly validationMessage: string;
  open(): void;
  close(): void;
  toggle(): void;
  focus(): void;
  blur(): void;
  checkValidity(): boolean;
  reset(): void;
}

export interface DatePickerState {
  value: Date | DateRange | null;
  min: Date | null;
  max: Date | null;
  disabledDates: Date[];
  label?: string;
  name: string;
  required: boolean;
  disabled: boolean;
  range: boolean;
  isOpen: boolean;
  currentMonth: Date;
  isValid: boolean;
}
