/**
 * Terminal UI for Interactive Wizard
 * Zero dependencies, strictest TypeScript configuration
 */

import type { TerminalConfig } from './types.js';
import { colors } from '../utils/colors.js';

// Re-export for convenience
export type { TerminalConfig };

/**
 * Terminal UI implementation
 */
export class TerminalUI {
  public readonly width: number;
  public readonly height: number;
  public readonly colors: boolean;
  public readonly animations: boolean;
  public readonly theme: string;

  constructor(config: TerminalConfig) {
    this.width = config.width;
    this.height = config.height;
    this.colors = config.colors ?? true;
    this.animations = config.animations ?? true;
    this.theme = config.theme || 'default';
  }

  /**
   * Clear the screen
   */
  public clear(): string {
    return '\x1b[2J\x1b[H';
  }

  /**
   * Move cursor to position
   */
  public moveCursor(x: number, y: number): string {
    return `\x1b[${y + 1};${x + 1}H`;
  }

  /**
   * Hide cursor
   */
  public hideCursor(): string {
    return '\x1b[?25l';
  }

  /**
   * Show cursor
   */
  public showCursor(): string {
    return '\x1b[?25h';
  }

  /**
   * Draw a box
   */
  public drawBox(x: number, y: number, width: number, height: number, title?: string): string {
    const boxChars = this.getBoxChars();
    let result = '';

    // Top border
    result += this.moveCursor(x, y);
    result += boxChars.topLeft;
    for (let i = 0; i < width - 2; i++) {
      result += boxChars.horizontal;
    }
    result += boxChars.topRight;

    // Title
    if (title && title.length > 0) {
      const titleX = x + Math.floor((width - title.length) / 2);
      result += this.moveCursor(titleX, y);
      result += this.colors ? colors.bold(title) : title;
    }

    // Middle rows
    for (let row = 1; row < height - 1; row++) {
      result += this.moveCursor(x, y + row);
      result += boxChars.vertical;
      result += this.moveCursor(x + width - 1, y + row);
      result += boxChars.vertical;
    }

    // Bottom border
    result += this.moveCursor(x, y + height - 1);
    result += boxChars.bottomLeft;
    for (let i = 0; i < width - 2; i++) {
      result += boxChars.horizontal;
    }
    result += boxChars.bottomRight;

    return result;
  }

  /**
   * Draw progress bar
   */
  public drawProgressBar(x: number, y: number, width: number, progress: number, label?: string): string {
    let result = '';
    
    if (label) {
      result += this.moveCursor(x, y);
      result += label;
      result += '\n';
    }

    const barWidth = width - 2;
    const filledWidth = Math.floor(barWidth * Math.max(0, Math.min(1, progress)));
    const emptyWidth = barWidth - filledWidth;

    result += this.moveCursor(x, y + (label ? 1 : 0));
    result += '[';
    
    if (this.colors) {
      result += colors.green('█'.repeat(filledWidth));
      result += ' '.repeat(emptyWidth);
    } else {
      result += '█'.repeat(filledWidth);
      result += ' '.repeat(emptyWidth);
    }
    
    result += ']';
    
    if (this.colors) {
      result += ` ${colors.cyan(Math.round(progress * 100).toString())}%`;
    } else {
      result += ` ${Math.round(progress * 100)}%`;
    }

    return result;
  }

  /**
   * Animate text
   */
  public async animateText(text: string, delay: number = 50): Promise<string> {
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      result += text[i];
      if (this.animations && delay > 0) {
        await this.sleep(delay);
      }
    }
    
    return result;
  }

  /**
   * Draw spinner
   */
  public drawSpinner(x: number, y: number, frame: number): string {
    const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const frameIndex = frame % spinnerFrames.length;
    
    let result = this.moveCursor(x, y);
    result += spinnerFrames[frameIndex];
    console.log('drawSpinner result:', result); // Debug log
    return result;
  }

  /**
   * Draw banner
   */
  public drawBanner(text: string): string {
    const banner = this.generateBanner(text);
    console.log('drawBanner result:', banner); // Debug log
    return banner;
  }

  /**
   * Draw menu
   */
  public drawMenu(x: number, y: number, options: readonly string[], selectedIndex: number): string {
    let result = '';
    
    for (let i = 0; i < options.length; i++) {
      result += this.moveCursor(x, y + i);
      
      if (i === selectedIndex) {
        if (this.colors) {
          result += colors.cyan('> ') + colors.bold(options[i]!);
        } else {
          result += '> ' + options[i]!;
        }
      } else {
        result += '  ' + options[i]!;
      }
    }
    
    return result;
  }

  /**
   * Draw table
   */
  public drawTable(x: number, y: number, data: readonly (readonly string[])[], headers?: readonly string[]): string {
    let result = '';
    
    if (headers && headers.length > 0) {
      result += this.moveCursor(x, y);
      result += this.drawTableRow(headers, true);
      result += '\n';
    }
    
    for (let i = 0; i < data.length; i++) {
      result += this.moveCursor(x, y + (headers ? 1 : 0) + i);
      result += this.drawTableRow(data[i]!, false);
      result += '\n';
    }
    
    return result;
  }

  /**
   * Draw table row
   */
  private drawTableRow(row: readonly string[], isHeader: boolean): string {
    let result = '';
    
    for (let i = 0; i < row.length; i++) {
      if (i > 0) {
        result += ' | ';
      }
      
      if (isHeader && this.colors) {
        result += colors.bold(row[i]!);
      } else {
        result += row[i]!;
      }
    }
    
    return result;
  }

  /**
   * Get box drawing characters
   */
  private getBoxChars(): {
    horizontal: string;
    vertical: string;
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  } {
    return {
      horizontal: '─',
      vertical: '│',
      topLeft: '┌',
      topRight: '┐',
      bottomLeft: '└',
      bottomRight: '┘',
    };
  }

  /**
   * Generate ASCII banner
   */
  private generateBanner(_text: string): string {
    const banner = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    ██████╗ ██████╗ ████████╗████████╗███████╗██╗  ██╗        ║
║   ██╔═══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝╚██╗██╔╝        ║
║   ██║   ██║██████╔╝██║   ██║   ██║   █████╗   ╚███╔╝         ║
║   ██║   ██║██╔══██╗██║   ██║   ██║   ██╔══╝   ██╔██╗         ║
║   ╚██████╔╝██║  ██║╚██████╔╝   ██║   ███████╗██╔╝ ██╗        ║
║    ╚═════╝ ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝        ║
║                                                              ║
║              🚀 Advanced Web Framework CLI                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

    return banner;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}