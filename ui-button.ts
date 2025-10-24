/**
 * ui-button Component Implementation
 * Zero Dependencies - Super Clean Code - Strict TypeScript
 */

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';

interface ButtonState {
  readonly variant: ButtonVariant;
  readonly size: ButtonSize;
  readonly disabled: boolean;
  readonly loading: boolean;
  readonly type: ButtonType;
  readonly text: string;
}

export class UiButton extends HTMLElement {
  private static readonly observedAttributes: readonly string[] = [
    'variant', 'size', 'disabled', 'loading', 'type'
  ] as const;

  private state: ButtonState = {
    variant: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
    type: 'button',
    text: ''
  };

  private shadowRootInternal: ShadowRoot | null = null;

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes(): readonly string[] {
    return UiButton.observedAttributes;
  }

  connectedCallback(): void {
    this.render();
    this.attachEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'variant':
        if (this.isValidVariant(newValue)) {
          this.state = { ...this.state, variant: newValue as ButtonVariant };
        }
        break;
      case 'size':
        if (this.isValidSize(newValue)) {
          this.state = { ...this.state, size: newValue as ButtonSize };
        }
        break;
      case 'disabled':
        this.state = { ...this.state, disabled: newValue !== null };
        break;
      case 'loading':
        this.state = { ...this.state, loading: newValue !== null };
        break;
      case 'type':
        if (this.isValidType(newValue)) {
          this.state = { ...this.state, type: newValue as ButtonType };
        }
        break;
    }
    this.render();
  }

  get variant(): ButtonVariant {
    return this.state.variant;
  }

  set variant(val: ButtonVariant) {
    this.state = { ...this.state, variant: val };
    this.setAttribute('variant', val);
    this.render();
  }

  get size(): ButtonSize {
    return this.state.size;
  }

  set size(val: ButtonSize) {
    this.state = { ...this.state, size: val };
    this.setAttribute('size', val);
    this.render();
  }

  get disabled(): boolean {
    return this.state.disabled;
  }

  set disabled(val: boolean) {
    this.state = { ...this.state, disabled: val };
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
    this.render();
  }

  get loading(): boolean {
    return this.state.loading;
  }

  set loading(val: boolean) {
    this.state = { ...this.state, loading: val };
    if (val) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
    this.render();
  }

  get type(): ButtonType {
    return this.state.type;
  }

  set type(val: ButtonType) {
    this.state = { ...this.state, type: val };
    this.setAttribute('type', val);
    this.render();
  }

  click(): void {
    if (!this.state.disabled && !this.state.loading) {
      this.dispatchEvent(new CustomEvent('click', {
        bubbles: true,
        composed: true
      }));
    }
  }

  focus(): void {
    this.dispatchEvent(new CustomEvent('focus', {
      bubbles: true,
      composed: true
    }));
  }

  blur(): void {
    this.dispatchEvent(new CustomEvent('blur', {
      bubbles: true,
      composed: true
    }));
  }

  private isValidVariant(value: string | null): boolean {
    const validVariants: ButtonVariant[] = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost'];
    return value !== null && validVariants.includes(value as ButtonVariant);
  }

  private isValidSize(value: string | null): boolean {
    const validSizes: ButtonSize[] = ['small', 'medium', 'large'];
    return value !== null && validSizes.includes(value as ButtonSize);
  }

  private isValidType(value: string | null): boolean {
    const validTypes: ButtonType[] = ['button', 'submit', 'reset'];
    return value !== null && validTypes.includes(value as ButtonType);
  }

  private getStyles(): string {
    return `
      :host {
        display: inline-block;
      }
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        border-radius: 4px;
        font-family: inherit;
        font-weight: 500;
        text-align: center;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
        outline: none;
        position: relative;
        overflow: hidden;
      }
      .button:focus {
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }
      .button:disabled,
      .button.loading {
        cursor: not-allowed;
        opacity: 0.6;
      }
      .button.loading {
        pointer-events: none;
      }
      .button-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .button-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      /* Variants */
      .button--primary {
        background-color: #007bff;
        border-color: #007bff;
        color: white;
      }
      .button--primary:hover:not(:disabled):not(.loading) {
        background-color: #0056b3;
        border-color: #0056b3;
      }
      .button--secondary {
        background-color: #6c757d;
        border-color: #6c757d;
        color: white;
      }
      .button--secondary:hover:not(:disabled):not(.loading) {
        background-color: #545b62;
        border-color: #545b62;
      }
      .button--success {
        background-color: #28a745;
        border-color: #28a745;
        color: white;
      }
      .button--success:hover:not(:disabled):not(.loading) {
        background-color: #1e7e34;
        border-color: #1e7e34;
      }
      .button--danger {
        background-color: #dc3545;
        border-color: #dc3545;
        color: white;
      }
      .button--danger:hover:not(:disabled):not(.loading) {
        background-color: #bd2130;
        border-color: #bd2130;
      }
      .button--warning {
        background-color: #ffc107;
        border-color: #ffc107;
        color: #212529;
      }
      .button--warning:hover:not(:disabled):not(.loading) {
        background-color: #e0a800;
        border-color: #e0a800;
      }
      .button--info {
        background-color: #17a2b8;
        border-color: #17a2b8;
        color: white;
      }
      .button--info:hover:not(:disabled):not(.loading) {
        background-color: #117a8b;
        border-color: #117a8b;
      }
      .button--ghost {
        background-color: transparent;
        border-color: #007bff;
        color: #007bff;
      }
      .button--ghost:hover:not(:disabled):not(.loading) {
        background-color: #007bff;
        color: white;
      }
      /* Sizes */
      .button--small {
        padding: 6px 12px;
        font-size: 0.875rem;
        line-height: 1.5;
      }
      .button--medium {
        padding: 8px 16px;
        font-size: 1rem;
        line-height: 1.5;
      }
      .button--large {
        padding: 12px 24px;
        font-size: 1.125rem;
        line-height: 1.5;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const buttonText = this.textContent || '';
    const isDisabled = this.state.disabled || this.state.loading;
    const buttonClass = `button button--${this.state.variant} button--${this.state.size}${this.state.loading ? ' loading' : ''}`;

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <button 
        class="${buttonClass}"
        type="${this.state.type}"
        ${isDisabled ? 'disabled' : ''}
        role="button"
        tabindex="${isDisabled ? '-1' : '0'}"
        aria-disabled="${isDisabled}"
        aria-busy="${this.state.loading}"
      >
        <div class="button-content">
          ${this.state.loading ? '<div class="button-spinner"></div>' : ''}
          <span>${this.escapeHtml(buttonText)}</span>
        </div>
      </button>
    `;
  }

  private attachEventListeners(): void {
    const button = this.shadowRootInternal?.querySelector('.button') as HTMLButtonElement;
    if (!button) return;

    button.addEventListener('click', (event) => {
      if (!this.state.disabled && !this.state.loading) {
        this.dispatchEvent(new CustomEvent('click', {
          detail: { originalEvent: event },
          bubbles: true,
          composed: true
        }));
      }
    });

    button.addEventListener('focus', () => {
      this.dispatchEvent(new CustomEvent('focus', {
        bubbles: true,
        composed: true
      }));
    });

    button.addEventListener('blur', () => {
      this.dispatchEvent(new CustomEvent('blur', {
        bubbles: true,
        composed: true
      }));
    });

    button.addEventListener('keydown', (event) => {
      if (this.state.disabled || this.state.loading) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.click();
      }
    });

    button.addEventListener('submit', (event) => {
      if (this.state.type === 'submit') {
        this.dispatchEvent(new CustomEvent('submit', {
          detail: { originalEvent: event },
          bubbles: true,
          composed: true
        }));
      }
    });

    button.addEventListener('reset', (event) => {
      if (this.state.type === 'reset') {
        this.dispatchEvent(new CustomEvent('reset', {
          detail: { originalEvent: event },
          bubbles: true,
          composed: true
        }));
      }
    });
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// Register the component
if (typeof customElements !== 'undefined') {
  customElements.define('ui-button', UiButton);
}