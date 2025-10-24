export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';

export interface CardState {
  cardTitle?: string;
  cardSubtitle?: string;
  variant: CardVariant;
  disabled: boolean;
  clickable: boolean;
  href?: string;
}

export interface ICardElement extends HTMLElement {
  cardTitle?: string;
  cardSubtitle?: string;
  variant: CardVariant;
  disabled: boolean;
  clickable: boolean;
  href?: string;
}
