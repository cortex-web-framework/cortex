/**
 * Defines semantic color variables for the UI component library.
 * These correspond to CSS custom properties defined in colors.css.
 */
export type UiColor =
  | '--ui-color-primary'
  | '--ui-color-secondary'
  | '--ui-color-success'
  | '--ui-color-danger'
  | '--ui-color-warning'
  | '--ui-color-info'
  | '--ui-color-background-default'
  | '--ui-color-text-default'
  | '--ui-color-text-light';

export const UI_COLORS: Record<string, UiColor> = {
  PRIMARY: '--ui-color-primary',
  SECONDARY: '--ui-color-secondary',
  SUCCESS: '--ui-color-success',
  DANGER: '--ui-color-danger',
  WARNING: '--ui-color-warning',
  INFO: '--ui-color-info',
  BACKGROUND_DEFAULT: '--ui-color-background-default',
  TEXT_DEFAULT: '--ui-color-text-default',
  TEXT_LIGHT: '--ui-color-text-light',
};