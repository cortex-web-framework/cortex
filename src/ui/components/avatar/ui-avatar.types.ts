export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
export type AvatarShape = 'circle' | 'square' | 'rounded';

export interface AvatarState {
  src?: string;
  alt?: string;
  initials?: string;
  size: AvatarSize;
  shape: AvatarShape;
  disabled: boolean;
}

export interface IAvatarElement extends HTMLElement {
  src?: string;
  alt?: string;
  initials?: string;
  size: AvatarSize;
  shape: AvatarShape;
  disabled: boolean;
}
