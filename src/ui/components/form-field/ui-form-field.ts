/**
 * ui-form-field: A wrapper component for form field layouts.
 * Combines label, input, error, and hint messages in a single component.
 */

import { FormFieldState, IFormFieldElement } from './ui-form-field.types.js';
import { themeManager } from '../../theme/theme-manager.js';

/**
 * Form Field Web Component
 *
 * @element ui-form-field
 *
 * @attr error - Error message text
 * @attr hint - Hint/helper text
 * @attr required - Required field indicator
 * @attr disabled - Disabled state
 *
 * @slot label - Label content (typically a ui-label)
 * @slot input - Input content (typically a form control)
 * @slot error - Error message content
 * @slot hint - Hint/helper text content
 */
class UiFormField extends HTMLElement implements IFormFieldElement {
  private shadowRootInternal: ShadowRoot;

  private state: FormFieldState = {
    error: null,
    hint: null,
    required: false,
    disabled: false,
  };

  static get observedAttributes(): string[] {
    return ['error', 'hint', 'required', 'disabled'];
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
      case 'error':
        this.state.error = newValue;
        break;
      case 'hint':
        this.state.hint = newValue;
        break;
      case 'required':
        this.state.required = newValue !== null;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
    }

    this.render();
  }

  /** Property: error */
  get error(): string | null {
    return this.state.error;
  }

  set error(val: string | null) {
    this.state.error = val;
    if (val) {
      this.setAttribute('error', val);
    } else {
      this.removeAttribute('error');
    }
    this.render();
  }

  /** Property: hint */
  get hint(): string | null {
    return this.state.hint;
  }

  set hint(val: string | null) {
    this.state.hint = val;
    if (val) {
      this.setAttribute('hint', val);
    } else {
      this.removeAttribute('hint');
    }
    this.render();
  }

  /** Property: required */
  get required(): boolean {
    return this.state.required;
  }

  set required(val: boolean) {
    this.state.required = val;
    if (val) {
      this.setAttribute('required', '');
    } else {
      this.removeAttribute('required');
    }
    this.render();
  }

  /** Property: disabled */
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

  private getFormFieldStyles(): string {
    return `
      :host {
        display: block;
        font-family: inherit;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('SM')};
      }

      .form-field.required::after {
        content: '';
      }

      .form-field.disabled {
        opacity: 0.6;
        pointer-events: none;
      }

      .form-field.error {
        --input-border-color: ${themeManager.getColor('DANGER') || '#dc3545'};
      }

      .label-slot {
        display: flex;
        align-items: center;
        gap: ${themeManager.getSpacing('XS')};
      }

      .input-slot {
        display: flex;
        flex-direction: column;
      }

      .error-message {
        display: ${this.state.error ? 'block' : 'none'};
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
        font-size: ${themeManager.getFontSize('SM')};
        margin-top: ${themeManager.getSpacing('XS')};
        line-height: 1.4;
      }

      .error-message::before {
        content: '⚠ ';
        margin-right: 4px;
      }

      .hint-message {
        display: ${this.state.hint ? 'block' : 'none'};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
        font-size: ${themeManager.getFontSize('SM')};
        margin-top: ${themeManager.getSpacing('XS')};
        line-height: 1.4;
      }

      .hint-message::before {
        content: 'ℹ ';
        margin-right: 4px;
      }

      slot[name="label"] {
        display: block;
      }

      slot[name="input"] {
        display: block;
      }

      slot[name="error"] {
        display: ${this.state.error ? 'block' : 'none'};
      }

      slot[name="hint"] {
        display: ${this.state.hint ? 'block' : 'none'};
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;
    const hintId = `hint-${Math.random().toString(36).substr(2, 9)}`;

    this.shadowRootInternal.innerHTML = `
      <style>${this.getFormFieldStyles()}</style>
      <div class="form-field ${this.state.required ? 'required' : ''} ${this.state.disabled ? 'disabled' : ''} ${this.state.error ? 'error' : ''}">
        <div class="label-slot">
          <slot name="label"></slot>
        </div>
        <div class="input-slot">
          <slot name="input"></slot>
          ${this.state.error ? `<div class="error-message" id="${errorId}" role="alert">${this.state.error}</div>` : ''}
          ${this.state.hint ? `<div class="hint-message" id="${hintId}">${this.state.hint}</div>` : ''}
        </div>
        <slot name="error"></slot>
        <slot name="hint"></slot>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('ui-form-field', UiFormField);

// Export for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'ui-form-field': UiFormField;
  }
}

export { UiFormField };
