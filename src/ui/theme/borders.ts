/**
 * Defines border-radius tokens for the UI component library.
 * These correspond to CSS custom properties defined in borders.css.
 */
export type UiBorderRadius =
  | '--ui-border-radius-none'
  | '--ui-border-radius-sm'
  | '--ui-border-radius-md'
  | '--ui-border-radius-lg'
  | '--ui-border-radius-full';

export const UI_BORDER_RADIUS: Record<string, UiBorderRadius> = {
  NONE: '--ui-border-radius-none', // 0px - for structured, serious elements
  SM: '--ui-border-radius-sm',   // 2px - subtle rounding
  MD: '--ui-border-radius-md',   // 4px - balanced rounding
  LG: '--ui-border-radius-lg',   // 8px - more friendly rounding
  FULL: '--ui-border-radius-full', // 9999px - for circular elements
};