export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'click' | 'focus';

export interface TooltipState {
  content?: string;
  position: TooltipPosition;
  trigger: TooltipTrigger;
  visible: boolean;
  disabled: boolean;
}

export interface ITooltipElement extends HTMLElement {
  content?: string;
  position: TooltipPosition;
  trigger: TooltipTrigger;
  visible: boolean;
  disabled: boolean;
  show(): void;
  hide(): void;
  toggle(): void;
}
