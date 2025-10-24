/**
 * ui-spinner: A loading spinner component with multiple animation variants.
 */

import { ISpinnerElement, SpinnerState, SpinnerSize, SpinnerVariant } from './ui-spinner.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiSpinner extends HTMLElement implements ISpinnerElement {
  private shadowRootInternal: ShadowRoot;

  private state: SpinnerState = {
    size: 'medium',
    variant: 'ring',
    message: undefined,
  };

  static get observedAttributes(): string[] {
    return ['size', 'variant', 'message'];
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
      case 'size':
        if (['small', 'medium', 'large'].includes(newValue || '')) {
          this.state.size = newValue as SpinnerSize;
        }
        break;
      case 'variant':
        if (['ring', 'dots', 'wave'].includes(newValue || '')) {
          this.state.variant = newValue as SpinnerVariant;
        }
        break;
      case 'message':
        this.state.message = newValue ?? undefined;
        break;
    }

    this.render();
  }

  get size(): SpinnerSize {
    return this.state.size;
  }

  set size(val: SpinnerSize) {
    this.state.size = val;
    this.setAttribute('size', val);
    this.render();
  }

  get variant(): SpinnerVariant {
    return this.state.variant;
  }

  set variant(val: SpinnerVariant) {
    this.state.variant = val;
    this.setAttribute('variant', val);
    this.render();
  }

  get message(): string | undefined {
    return this.state.message;
  }

  set message(val: string | undefined) {
    this.state.message = val;
    if (val) {
      this.setAttribute('message', val);
    } else {
      this.removeAttribute('message');
    }
    this.render();
  }

  private getSizeValue(): string {
    switch (this.state.size) {
      case 'small':
        return '24px';
      case 'large':
        return '64px';
      case 'medium':
      default:
        return '40px';
    }
  }

  private getStyles(): string {
    const size = this.getSizeValue();

    return `
      :host {
        display: inline-flex;
      }

      .spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${themeManager.getSpacing('MD')};
      }

      .spinner {
        width: ${size};
        height: ${size};
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Ring Spinner */
      .spinner-ring::after {
        content: '';
        width: 100%;
        height: 100%;
        border: 3px solid ${themeManager.getColor('BORDER') || '#ddd'};
        border-top: 3px solid ${themeManager.getColor('PRIMARY') || '#007bff'};
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      /* Dots Spinner */
      .spinner-dots {
        display: flex;
        gap: 4px;
      }

      .spinner-dots::before,
      .spinner-dots::after,
      .spinner-dots > * {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${themeManager.getColor('PRIMARY') || '#007bff'};
        animation: bounce 1.4s infinite ease-in-out both;
      }

      .spinner-dots::before {
        animation-delay: -0.32s;
      }

      .spinner-dots > * {
        animation-delay: 0s;
      }

      .spinner-dots::after {
        animation-delay: 0.32s;
      }

      /* Wave Spinner */
      .spinner-wave {
        display: flex;
        gap: 2px;
        justify-content: center;
      }

      .spinner-wave > * {
        width: 4px;
        background: ${themeManager.getColor('PRIMARY') || '#007bff'};
        animation: wave 1.2s infinite ease-in-out;
      }

      .spinner-wave > :nth-child(1) { animation-delay: -0.24s; }
      .spinner-wave > :nth-child(2) { animation-delay: -0.12s; }
      .spinner-wave > :nth-child(3) { animation-delay: 0s; }
      .spinner-wave > :nth-child(4) { animation-delay: 0.12s; }
      .spinner-wave > :nth-child(5) { animation-delay: 0.24s; }

      .spinner-message {
        font-size: ${themeManager.getFontSize('SM')};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
        text-align: center;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes bounce {
        0%, 80%, 100% {
          opacity: 0.5;
          transform: scale(0.8);
        }
        40% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes wave {
        0%, 100% {
          height: 8px;
          transform: translateY(0);
        }
        50% {
          height: 16px;
          transform: translateY(-8px);
        }
      }

      /* Size Classes */
      .spinner-small {
        width: 24px;
        height: 24px;
        font-size: 12px;
      }

      .spinner-medium {
        width: 40px;
        height: 40px;
        font-size: 14px;
      }

      .spinner-large {
        width: 64px;
        height: 64px;
        font-size: 16px;
      }

      .spinner-small::after {
        border-width: 2px;
      }

      .spinner-large::after {
        border-width: 4px;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    let spinnerHtml = '';

    switch (this.state.variant) {
      case 'ring':
        spinnerHtml = `<div class="spinner spinner-ring spinner-${this.state.size}" role="status" aria-busy="true"></div>`;
        break;
      case 'dots':
        spinnerHtml = `<div class="spinner spinner-dots spinner-${this.state.size}" role="status" aria-busy="true"><span></span></div>`;
        break;
      case 'wave':
        spinnerHtml = `<div class="spinner spinner-wave spinner-${this.state.size}" role="status" aria-busy="true"><span></span><span></span><span></span><span></span><span></span></div>`;
        break;
    }

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>

      <div class="spinner-container">
        ${spinnerHtml}
        ${this.state.message ? `<div class="spinner-message">${this.state.message}</div>` : ''}
      </div>
    `;
  }
}

customElements.define('ui-spinner', UiSpinner);

declare global {
  interface HTMLElementTagNameMap {
    'ui-spinner': UiSpinner;
  }
}

export { UiSpinner };
