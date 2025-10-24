export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeState {
  content: string;
  variant: BadgeVariant;
  size: BadgeSize;
  disabled: boolean;
  pill: boolean;
  dot: boolean;
}

export interface IBadgeElement extends HTMLElement {
  content: string;
  variant: BadgeVariant;
  size: BadgeSize;
  disabled: boolean;
  pill: boolean;
  dot: boolean;
}
