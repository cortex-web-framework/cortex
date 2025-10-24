import { Theme } from './theme-manager';

export const darkTheme: Theme = {
  // Colors (Dark Mode adjustments)
  '--ui-color-primary': '#66b3ff', // Lighter blue for dark mode
  '--ui-color-primary-hover': '#4d94db',
  '--ui-color-primary-active': '#337ab7',

  '--ui-color-secondary': '#99a3ac', // Lighter grey for dark mode
  '--ui-color-secondary-hover': '#7f8c9a',
  '--ui-color-secondary-active': '#667380',

  '--ui-color-success': '#5cb85c', // Adjusted green
  '--ui-color-success-hover': '#449d44',
  '--ui-color-danger': '#d9534f', // Adjusted red
  '--ui-color-danger-hover': '#c9302c',
  '--ui-color-warning': '#f0ad4e', // Adjusted yellow
  '--ui-color-warning-hover': '#ec971f',
  '--ui-color-info': '#5bc0de', // Adjusted cyan
  '--ui-color-info-hover': '#31b0d5',

  '--ui-color-background-default': '#212529', // Dark background
  '--ui-color-background-light': '#343a40',
  '--ui-color-text-default': '#f8f9fa', // Light text
  '--ui-color-text-light': '#ced4da',
  '--ui-color-border-default': '#495057',

  // Typography (can remain mostly the same, or adjust for contrast)
  '--ui-font-family-sans': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  '--ui-font-family-serif': 'Georgia, Cambria, "Times New Roman", Times, serif',
  '--ui-font-family-mono': 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  '--ui-font-size-xs': '0.75rem',
  '--ui-font-size-sm': '0.875rem',
  '--ui-font-size-md': '1rem',
  '--ui-font-size-lg': '1.125rem',
  '--ui-font-size-xl': '1.25rem',
  '--ui-font-size-h1': '2.5rem',
  '--ui-font-size-h2': '2rem',
  '--ui-font-size-h3': '1.75rem',
  '--ui-font-size-h4': '1.5rem',
  '--ui-font-size-h5': '1.25rem',
  '--ui-font-size-h6': '1rem',
  '--ui-font-weight-light': '300',
  '--ui-font-weight-normal': '400',
  '--ui-font-weight-medium': '500',
  '--ui-font-weight-semibold': '600',
  '--ui-font-weight-bold': '700',
  '--ui-line-height-dense': '1.25',
  '--ui-line-height-normal': '1.5',
  '--ui-line-height-relaxed': '1.75',

  // Spacing (usually remains the same)
  '--ui-spacing-xxs': '4px',
  '--ui-spacing-xs': '8px',
  '--ui-spacing-sm': '12px',
  '--ui-spacing-md': '16px',
  '--ui-spacing-lg': '24px',
  '--ui-spacing-xl': '32px',
  '--ui-spacing-xxl': '48px',

  // Borders (usually remains the same)
  '--ui-border-radius-none': '0px',
  '--ui-border-radius-sm': '2px',
  '--ui-border-radius-md': '4px',
  '--ui-border-radius-lg': '8px',
  '--ui-border-radius-full': '9999px',

  // Effects (shadows might need adjustment for dark mode visibility)
  '--ui-z-index-dropdown': '1000',
  '--ui-z-index-sticky': '1020',
  '--ui-z-index-fixed': '1030',
  '--ui-z-index-modal': '1040',
  '--ui-z-index-tooltip': '1050',
  '--ui-shadow-sm': '0 1px 2px 0 rgba(255, 255, 255, 0.05)', // Lighter shadows
  '--ui-shadow-md': '0 4px 6px -1px rgba(255, 255, 255, 0.1), 0 2px 4px -1px rgba(255, 255, 255, 0.06)',
  '--ui-shadow-lg': '0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05)',
  '--ui-transition-fast': 'all 0.15s ease-out',
  '--ui-transition-normal': 'all 0.3s ease-in-out',
  '--ui-transition-slow': 'all 0.5s ease-in-out',
};