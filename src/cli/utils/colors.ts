/**
 * Zero-dependency color utilities
 * Strictest TypeScript configuration
 */

/**
 * ANSI color codes
 */
const ANSI_CODES = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  strikethrough: '\x1b[9m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Bright foreground colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
} as const;

/**
 * Color names type
 */
type ColorName = keyof typeof ANSI_CODES;

/**
 * Check if colors should be enabled
 */
function shouldUseColors(): boolean {
  // Check NO_COLOR environment variable
  if (process.env["NO_COLOR"] !== undefined) {
    return false;
  }
  
  // Check if output is a TTY
  if (process.stdout.isTTY === false) {
    return false;
  }
  
  // Check TERM environment variable
  const term = process.env["TERM"];
  if (term === 'dumb') {
    return false;
  }
  
  return true;
}

/**
 * Colorize text with ANSI codes
 */
function colorize(text: string, ...colors: readonly ColorName[]): string {
  if (text.length === 0) {
    return '';
  }
  if (!shouldUseColors()) {
    return text;
  }
  
  const colorCodes = colors.map(color => ANSI_CODES[color]).join('');
  return `${colorCodes}${text}${ANSI_CODES.reset}`;
}

/**
 * Color utilities
 */
export const colors = {
  /**
   * Reset all formatting
   */
  reset: (text: string): string => colorize(text, 'reset'),
  
  /**
   * Bold text
   */
  bold: (text: string): string => colorize(text, 'bold'),
  
  /**
   * Dim text
   */
  dim: (text: string): string => colorize(text, 'dim'),
  
  /**
   * Italic text
   */
  italic: (text: string): string => colorize(text, 'italic'),
  
  /**
   * Underlined text
   */
  underline: (text: string): string => colorize(text, 'underline'),
  
  /**
   * Strikethrough text
   */
  strikethrough: (text: string): string => colorize(text, 'strikethrough'),
  
  /**
   * Black text
   */
  black: (text: string): string => colorize(text, 'black'),
  
  /**
   * Red text
   */
  red: (text: string): string => colorize(text, 'red'),
  
  /**
   * Green text
   */
  green: (text: string): string => colorize(text, 'green'),
  
  /**
   * Yellow text
   */
  yellow: (text: string): string => colorize(text, 'yellow'),
  
  /**
   * Blue text
   */
  blue: (text: string): string => colorize(text, 'blue'),
  
  /**
   * Magenta text
   */
  magenta: (text: string): string => colorize(text, 'magenta'),
  
  /**
   * Cyan text
   */
  cyan: (text: string): string => colorize(text, 'cyan'),
  
  /**
   * White text
   */
  white: (text: string): string => colorize(text, 'white'),
  
  /**
   * Gray text
   */
  gray: (text: string): string => colorize(text, 'gray'),
  
  /**
   * Bright red text
   */
  brightRed: (text: string): string => colorize(text, 'brightRed'),
  
  /**
   * Bright green text
   */
  brightGreen: (text: string): string => colorize(text, 'brightGreen'),
  
  /**
   * Bright yellow text
   */
  brightYellow: (text: string): string => colorize(text, 'brightYellow'),
  
  /**
   * Bright blue text
   */
  brightBlue: (text: string): string => colorize(text, 'brightBlue'),
  
  /**
   * Bright magenta text
   */
  brightMagenta: (text: string): string => colorize(text, 'brightMagenta'),
  
  /**
   * Bright cyan text
   */
  brightCyan: (text: string): string => colorize(text, 'brightCyan'),
  
  /**
   * Bright white text
   */
  brightWhite: (text: string): string => colorize(text, 'brightWhite'),
  
  /**
   * Success message (green)
   */
  success: (text: string): string => colorize(text, 'green', 'bold'),
  
  /**
   * Error message (red)
   */
  error: (text: string): string => colorize(text, 'red', 'bold'),
  
  /**
   * Warning message (yellow)
   */
  warning: (text: string): string => colorize(text, 'yellow', 'bold'),
  
  /**
   * Info message (blue)
   */
  info: (text: string): string => colorize(text, 'blue', 'bold'),
  
  /**
   * Highlight text (cyan)
   */
  highlight: (text: string): string => colorize(text, 'cyan', 'bold'),
  
  /**
   * Muted text (gray)
   */
  muted: (text: string): string => colorize(text, 'gray'),
  
  /**
   * Combine multiple styles
   */
  combine: (text: string, ...styles: readonly ((text: string) => string)[]): string => {
    return styles.reduce((acc, style) => style(acc), text);
  },
} as const;

/**
 * Check if colors are supported
 */
export function supportsColors(): boolean {
  return shouldUseColors();
}