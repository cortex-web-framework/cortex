/**
 * Defines spacing tokens for the UI component library.
 * These correspond to CSS custom properties defined in spacing.css.
 */
export type UiSpacing =
  | '--ui-spacing-xxs'
  | '--ui-spacing-xs'
  | '--ui-spacing-sm'
  | '--ui-spacing-md'
  | '--ui-spacing-lg'
  | '--ui-spacing-xl'
  | '--ui-spacing-xxl';

export const UI_SPACING: Record<string, UiSpacing> = {
  XXS: '--ui-spacing-xxs', // 4px
  XS: '--ui-spacing-xs',   // 8px
  SM: '--ui-spacing-sm',   // 12px
  MD: '--ui-spacing-md',   // 16px
  LG: '--ui-spacing-lg',   // 24px
  XL: '--ui-spacing-xl',   // 32px
  XXL: '--ui-spacing-xxl', // 48px
};