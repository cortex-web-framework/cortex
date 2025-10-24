import { UI_COLORS } from './colors';
import { UI_FONT_SIZES, UI_FONT_WEIGHTS, UI_LINE_HEIGHTS } from './typography';
import { UI_SPACING } from './spacing';
import { UI_BORDER_RADIUS } from './borders';
import { UI_Z_INDEX, UI_SHADOWS, UI_TRANSITIONS } from './effects';
import { lightTheme } from './light-theme'; // Import light theme
import { darkTheme } from './dark-theme';   // Import dark theme

/**
 * Type for a theme object, mapping CSS custom property names to their values.
 */
export type Theme = {
  [key: string]: string;
};

/**
 * Manages applying and switching themes (sets of CSS custom properties)
 * to the document's root element.
 */
export class ThemeManager {
  private currentTheme: Theme | null = null;

  /**
   * Applies a given theme to the document's root element by setting CSS custom properties.
   * @param theme The theme object containing CSS custom property names and their values.
   */
  public applyTheme(theme: Theme): void {
    this.currentTheme = theme;
    for (const [prop, value] of Object.entries(theme)) {
      document.documentElement.style.setProperty(prop, value);
    }
  }

  /**
   * Switches the current theme between 'light' and 'dark'.
   * @param themeName The name of the theme to apply ('light' or 'dark').
   */
  public switchTheme(themeName: 'light' | 'dark'): void {
    if (themeName === 'light') {
      this.applyTheme(lightTheme);
    }
    else if (themeName === 'dark') {
      this.applyTheme(darkTheme);
    }
    else {
      console.warn(`Unknown theme name: ${themeName}. Applying default light theme.`);
      this.applyTheme(lightTheme);
    }
  }

  /**
   * Retrieves the current value of a CSS custom property from the applied theme.
   * @param propName The name of the CSS custom property (e.g., '--ui-color-primary').
   * @returns The value of the custom property, or an empty string if not found.
   */
  public getThemeToken(propName: string): string {
    if (this.currentTheme && this.currentTheme[propName]) {
      return this.currentTheme[propName];
    }
    // Fallback to computed style if not explicitly in currentTheme (e.g., inherited values)
    return getComputedStyle(document.documentElement).getPropertyValue(propName).trim();
  }

  /**
   * Helper to get a color token.
   */
  public getColor(colorName: keyof typeof UI_COLORS): string {
    return this.getThemeToken(UI_COLORS[colorName]);
  }

  /**
   * Helper to get a font size token.
   */
  public getFontSize(sizeName: keyof typeof UI_FONT_SIZES): string {
    return this.getThemeToken(UI_FONT_SIZES[sizeName]);
  }

  /**
   * Helper to get a font weight token.
   */
  public getFontWeight(weightName: keyof typeof UI_FONT_WEIGHTS): string {
    return this.getThemeToken(UI_FONT_WEIGHTS[weightName]);
  }

  /**
   * Helper to get a line height token.
   */
  public getLineHeight(heightName: keyof typeof UI_LINE_HEIGHTS): string {
    return this.getThemeToken(UI_LINE_HEIGHTS[heightName]);
  }

  /**
   * Helper to get a spacing token.
   */
  public getSpacing(spacingName: keyof typeof UI_SPACING): string {
    return this.getThemeToken(UI_SPACING[spacingName]);
  }

  /**
   * Helper to get a border radius token.
   */
  public getBorderRadius(radiusName: keyof typeof UI_BORDER_RADIUS): string {
    return this.getThemeToken(UI_BORDER_RADIUS[radiusName]);
  }

  /**
   * Helper to get a z-index token.
   */
  public getZIndex(zIndexName: keyof typeof UI_Z_INDEX): string {
    return this.getThemeToken(UI_Z_INDEX[zIndexName]);
  }

  /**
   * Helper to get a shadow token.
   */
  public getShadow(shadowName: keyof typeof UI_SHADOWS): string {
    return this.getThemeToken(UI_SHADOWS[shadowName]);
  }

  /**
   * Helper to get a transition token.
   */
  public getTransition(transitionName: keyof typeof UI_TRANSITIONS): string {
    return this.getThemeToken(UI_TRANSITIONS[transitionName]);
  }
}

export const themeManager = new ThemeManager();