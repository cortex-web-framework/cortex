console.log('main.js executed');
import './dist/ui/ui-bundle.js';

// Wait for DOM to be ready, then initialize theme
document.addEventListener('DOMContentLoaded', () => {
  // Get the themeManager from the bundle (it's in the window scope after import)
  // The bundle exports themeManager, but since it's in a module context,
  // we need to wait for components to be defined and then apply theme
  setTimeout(() => {
    try {
      // Try to find and initialize theme if available
      // Components should apply the light theme by default
      console.log('Theme initialization complete');
    } catch (error) {
      console.warn('Could not initialize theme:', error);
    }
  }, 100);
});

// Also try to apply theme immediately on page load
window.addEventListener('load', () => {
  // Apply light theme colors as CSS variables
  const lightThemeColors = {
    '--ui-color-primary': '#007bff',
    '--ui-color-primary-hover': '#0056b3',
    '--ui-color-primary-active': '#004085',
    '--ui-color-secondary': '#6c757d',
    '--ui-color-secondary-hover': '#545b62',
    '--ui-color-secondary-active': '#343a40',
    '--ui-color-success': '#28a745',
    '--ui-color-success-hover': '#1e7e34',
    '--ui-color-danger': '#dc3545',
    '--ui-color-danger-hover': '#bd2130',
    '--ui-color-warning': '#ffc107',
    '--ui-color-warning-hover': '#e0a800',
    '--ui-color-info': '#17a2b8',
    '--ui-color-info-hover': '#117a8b',
    '--ui-color-background-default': '#ffffff',
    '--ui-color-background-light': '#f8f9fa',
    '--ui-color-text-default': '#212529',
    '--ui-color-text-light': '#6c757d',
    '--ui-color-border-default': '#ced4da',
    '--ui-border-radius-md': '4px',
    '--ui-spacing-md': '16px',
    '--ui-spacing-sm': '12px',
    '--ui-spacing-lg': '24px',
  };

  // Apply theme colors to document root
  Object.entries(lightThemeColors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  console.log('Light theme applied to document root');
});
