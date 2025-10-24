/**
 * Defines effect tokens (z-index, shadows, transitions) for the UI component library.
 * These correspond to CSS custom properties defined in effects.css.
 */
export type UiZIndex =
  | '--ui-z-index-dropdown'
  | '--ui-z-index-sticky'
  | '--ui-z-index-fixed'
  | '--ui-z-index-modal'
  | '--ui-z-index-tooltip';

export type UiShadow =
  | '--ui-shadow-sm'
  | '--ui-shadow-md'
  | '--ui-shadow-lg';

export type UiTransition =
  | '--ui-transition-fast'
  | '--ui-transition-normal'
  | '--ui-transition-slow';

export const UI_Z_INDEX: Record<string, UiZIndex> = {
  DROPDOWN: '--ui-z-index-dropdown',
  STICKY: '--ui-z-index-sticky',
  FIXED: '--ui-z-index-fixed',
  MODAL: '--ui-z-index-modal',
  TOOLTIP: '--ui-z-index-tooltip',
};

export const UI_SHADOWS: Record<string, UiShadow> = {
  SM: '--ui-shadow-sm',
  MD: '--ui-shadow-md',
  LG: '--ui-shadow-lg',
};

export const UI_TRANSITIONS: Record<string, UiTransition> = {
  FAST: '--ui-transition-fast',
  NORMAL: '--ui-transition-normal',
  SLOW: '--ui-transition-slow',
};