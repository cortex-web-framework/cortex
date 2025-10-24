export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type TagSize = 'small' | 'medium' | 'large';

export interface TagState {
  label?: string;
  variant: TagVariant;
  size: TagSize;
  closable: boolean;
}

export interface ITagElement extends HTMLElement {
  label?: string;
  variant: TagVariant;
  size: TagSize;
  closable: boolean;
}
