/**
 * ui-progress-bar: A progress bar component for displaying task completion.
 */

import {
  IProgressBarElement,
  ProgressBarState,
  ProgressBarVariant,
  ProgressBarSize,
  ProgressBarColor,
} from './ui-progress-bar.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiProgressBar extends HTMLElement implements IProgressBarElement {
  private shadowRootInternal: ShadowRoot;

  private state: ProgressBarState = {
    value: 0,
    max: 100,
    label: undefined,
    showLabel: false,
    showPercentage: false,
    variant: 'default',
    size: 'medium',
    color: 'primary',
    disabled: false,
    indeterminate: false,
  };

  static get observedAttributes(): string[] {
    return ['value', 'max', 'label', 'showLabel', 'showPercentage', 'variant', 'size', 'color', 'disabled', 'indeterminate'];
  }

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'value':
        this.state.value = Math.max(0, Math.min(parseInt(newValue || '0', 10), this.state.max));
        break;
      case 'max':
        this.state.max = Math.max(1, parseInt(newValue || '100', 10));
        if (this.state.value > this.state.max) {
          this.state.value = this.state.max;
        }
        break;
      case 'label':
        this.state.label = newValue ?? undefined;
        break;
      case 'showLabel':
        this.state.showLabel = newValue !== null;
        break;
      case 'showPercentage':
        this.state.showPercentage = newValue !== null;
        break;
      case 'variant':
        if (['default', 'striped', 'animated'].includes(newValue || '')) {
          this.state.variant = newValue as ProgressBarVariant;
        }
        break;
      case 'size':
        if (['small', 'medium', 'large'].includes(newValue || '')) {
          this.state.size = newValue as ProgressBarSize;
        }
        break;
      case 'color':
        if (['primary', 'success', 'warning', 'error', 'info'].includes(newValue || '')) {
          this.state.color = newValue as ProgressBarColor;
        }
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'indeterminate':
        this.state.indeterminate = newValue !== null;
        break;
    }

    this.render();
  }

  get value(): number {
    return this.state.value;
  }

  set value(val: number) {
    this.state.value = Math.max(0, Math.min(val, this.state.max));
    this.setAttribute('value', String(this.state.value));
    this.render();
  }

  get max(): number {
    return this.state.max;
  }

  set max(val: number) {
    this.state.max = Math.max(1, val);
    if (this.state.value > this.state.max) {
      this.state.value = this.state.max;
    }
    this.setAttribute('max', String(this.state.max));
    this.render();
  }

  get label(): string | undefined {
    return this.state.label;
  }

  set label(val: string | undefined) {
    this.state.label = val;
    if (val) {
      this.setAttribute('label', val);
    } else {
      this.removeAttribute('label');
    }
    this.render();
  }

  get showLabel(): boolean {
    return this.state.showLabel;
  }

  set showLabel(val: boolean) {
    this.state.showLabel = val;
    if (val) {
      this.setAttribute('showLabel', '');
    } else {
      this.removeAttribute('showLabel');
    }
    this.render();
  }

  get showPercentage(): boolean {
    return this.state.showPercentage;
  }

  set showPercentage(val: boolean) {
    this.state.showPercentage = val;
    if (val) {
      this.setAttribute('showPercentage', '');
    } else {
      this.removeAttribute('showPercentage');
    }
    this.render();
  }

  get variant(): ProgressBarVariant {
    return this.state.variant;
  }

  set variant(val: ProgressBarVariant) {
    this.state.variant = val;
    this.setAttribute('variant', val);
    this.render();
  }

  get size(): ProgressBarSize {
    return this.state.size;
  }

  set size(val: ProgressBarSize) {
    this.state.size = val;
    this.setAttribute('size', val);
    this.render();
  }

  get color(): ProgressBarColor {
    return this.state.color;
  }

  set color(val: ProgressBarColor) {
    this.state.color = val;
    this.setAttribute('color', val);
    this.render();
  }

  get disabled(): boolean {
    return this.state.disabled;
  }

  set disabled(val: boolean) {
    this.state.disabled = val;
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
    this.render();
  }

  get indeterminate(): boolean {
    return this.state.indeterminate;
  }

  set indeterminate(val: boolean) {
    this.state.indeterminate = val;
    if (val) {
      this.setAttribute('indeterminate', '');
    } else {
      this.removeAttribute('indeterminate');
    }
    this.render();
  }

  private getColorValue(): string {
    switch (this.state.color) {
      case 'success':
        return '#28a745';
      case 'warning':
        return '#ffc107';
      case 'error':
        return '#dc3545';
      case 'info':
        return '#17a2b8';
      case 'primary':
      default:
        return themeManager.getColor('PRIMARY') || '#007bff';
    }
  }

  private getSizeValue(): { height: string; fontSize: string } {
    switch (this.state.size) {
      case 'small':
        return { height: '6px', fontSize: '10px' };
      case 'large':
        return { height: '24px', fontSize: '16px' };
      case 'medium':
      default:
        return { height: '12px', fontSize: '12px' };
    }
  }

  private getPercentage(): number {
    if (this.state.indeterminate || this.state.max === 0) return 0;
    return Math.round((this.state.value / this.state.max) * 100);
  }

  private getStyles(): string {
    const { height, fontSize } = this.getSizeValue();
    const color = this.getColorValue();
    const percentage = this.getPercentage();

    return `
      :host {
        display: block;
      }

      .progress-container {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('SM')};
      }

      .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: ${themeManager.getSpacing('SM')};
      }

      .progress-label {
        font-size: ${fontSize};
        font-weight: 500;
        color: ${themeManager.getColor('TEXT') || '#000'};
      }

      .progress-percentage {
        font-size: ${fontSize};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
      }

      .progress-track {
        width: 100%;
        height: ${height};
        background: ${themeManager.getColor('BORDER') || '#ddd'};
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      }

      .progress-bar {
        height: 100%;
        background: ${color};
        border-radius: 4px;
        transition: width 0.3s ease;
        width: ${percentage}%;
        position: relative;
      }

      /* Striped variant */
      .progress-bar.striped {
        background-image: linear-gradient(
          45deg,
          ${color},
          ${color} 10px,
          rgba(255, 255, 255, 0.15) 10px,
          rgba(255, 255, 255, 0.15) 20px
        );
        background-size: 20px 20px;
      }

      /* Animated variant */
      .progress-bar.animated {
        animation: progress-animation 1s linear infinite;
      }

      @keyframes progress-animation {
        0% {
          background-position: 0 0;
        }
        100% {
          background-position: 40px 0;
        }
      }

      /* Indeterminate animation */
      .progress-bar.indeterminate {
        width: 30%;
        animation: indeterminate 1.5s ease-in-out infinite;
      }

      @keyframes indeterminate {
        0% {
          left: -30%;
        }
        50% {
          left: 100%;
        }
        100% {
          left: 100%;
        }
      }

      /* Disabled state */
      :host([disabled]) .progress-bar {
        opacity: 0.5;
      }

      :host([disabled]) .progress-label,
      :host([disabled]) .progress-percentage {
        opacity: 0.5;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const percentage = this.getPercentage();
    const barClass = this.state.indeterminate
      ? 'progress-bar indeterminate'
      : `progress-bar ${this.state.variant === 'striped' ? 'striped' : ''} ${this.state.variant === 'animated' ? 'animated' : ''}`;

    let headerHtml = '';
    if (this.state.showLabel || this.state.showPercentage) {
      headerHtml = `
        <div class="progress-header">
          ${
            this.state.showLabel && this.state.label
              ? `<span class="progress-label">${this.escapeHtml(this.state.label)}</span>`
              : ''
          }
          ${this.state.showPercentage ? `<span class="progress-percentage">${percentage}%</span>` : ''}
        </div>
      `;
    }

    const barStyle = !this.state.indeterminate ? `width: ${percentage}%;` : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>

      <div class="progress-container">
        ${headerHtml}
        <div
          class="progress-track"
          role="progressbar"
          aria-valuenow="${this.state.value}"
          aria-valuemin="0"
          aria-valuemax="${this.state.max}"
          aria-disabled="${this.state.disabled}"
          ${this.state.label ? `aria-label="${this.escapeHtml(this.state.label)}"` : ''}
        >
          <div class="${barClass}" style="${barStyle}"></div>
        </div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('ui-progress-bar', UiProgressBar);

declare global {
  interface HTMLElementTagNameMap {
    'ui-progress-bar': UiProgressBar;
  }
}

export { UiProgressBar };
