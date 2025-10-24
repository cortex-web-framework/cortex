export type LinkVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface LinkState {
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  disabled: boolean;
  variant: LinkVariant;
  underline: boolean;
}

export interface ILinkElement extends HTMLElement {
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  disabled: boolean;
  variant: LinkVariant;
  underline: boolean;
}
