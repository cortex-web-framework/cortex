export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type PopoverTrigger = 'hover' | 'click' | 'focus';

export interface PopoverState {
  headerText?: string;
  position: PopoverPosition;
  trigger: PopoverTrigger;
  visible: boolean;
  disabled: boolean;
  width?: string;
}

export interface IPopoverElement extends HTMLElement {
  headerText?: string;
  position: PopoverPosition;
  trigger: PopoverTrigger;
  visible: boolean;
  disabled: boolean;
  width?: string;
  show(): void;
  hide(): void;
  toggle(): void;
}
