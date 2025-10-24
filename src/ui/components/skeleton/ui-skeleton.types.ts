export type SkeletonVariant = 'text' | 'circle' | 'rectangle';

export interface SkeletonState {
  variant: SkeletonVariant;
  width?: string;
  height?: string;
  animating: boolean;
}

export interface ISkeletonElement extends HTMLElement {
  variant: SkeletonVariant;
  width?: string;
  height?: string;
  animating: boolean;
}
