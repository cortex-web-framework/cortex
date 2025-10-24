/**
 * Defines typography tokens for the UI component library.
 * These correspond to CSS custom properties defined in typography.css.
 */
export type UiFontSize =
  | '--ui-font-size-xs'
  | '--ui-font-size-sm'
  | '--ui-font-size-md'
  | '--ui-font-size-lg'
  | '--ui-font-size-xl'
  | '--ui-font-size-h1'
  | '--ui-font-size-h2'
  | '--ui-font-size-h3';

export type UiFontWeight =
  | '--ui-font-weight-light'
  | '--ui-font-weight-normal'
  | '--ui-font-weight-medium'
  | '--ui-font-weight-semibold'
  | '--ui-font-weight-bold';

export type UiLineHeight =
  | '--ui-line-height-dense'
  | '--ui-line-height-normal'
  | '--ui-line-height-relaxed';

export const UI_FONT_SIZES: Record<string, UiFontSize> = {
  XS: '--ui-font-size-xs',
  SM: '--ui-font-size-sm',
  MD: '--ui-font-size-md',
  LG: '--ui-font-size-lg',
  XL: '--ui-font-size-xl',
  H1: '--ui-font-size-h1',
  H2: '--ui-font-size-h2',
  H3: '--ui-font-size-h3',
};

export const UI_FONT_WEIGHTS: Record<string, UiFontWeight> = {
  LIGHT: '--ui-font-weight-light',
  NORMAL: '--ui-font-weight-normal',
  MEDIUM: '--ui-font-weight-medium',
  SEMIBOLD: '--ui-font-weight-semibold',
  BOLD: '--ui-font-weight-bold',
};

export const UI_LINE_HEIGHTS: Record<string, UiLineHeight> = {
  DENSE: '--ui-line-height-dense',
  NORMAL: '--ui-line-height-normal',
  RELAXED: '--ui-line-height-relaxed',
};