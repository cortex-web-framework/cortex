export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'default' | 'dashed' | 'dotted';

export interface DividerState {
  orientation: DividerOrientation;
  variant: DividerVariant;
  text?: string;
}

export interface IDividerElement extends HTMLElement {
  orientation: DividerOrientation;
  variant: DividerVariant;
  text?: string;
}
