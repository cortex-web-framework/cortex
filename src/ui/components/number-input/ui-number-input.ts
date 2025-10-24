/**
 * ui-number-input: A numeric input component with validation.
 */

import { NumberInputState, INumberInputElement } from './ui-number-input.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiNumberInput extends HTMLElement implements INumberInputElement {
  private shadowRootInternal: ShadowRoot;
  private inputElement: HTMLInputElement | null = null;

  private state: NumberInputState = {
    value: null,
    placeholder: '',
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    step: 1,
    disabled: false,
    required: false,
    name: '',
    isValid: true,
  };

  static get observedAttributes(): string[] {
    return ['value', 'placeholder', 'label', 'min', 'max', 'step', 'disabled', 'required', 'name'];
  }

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'value':
        this.state.value = newValue ? parseFloat(newValue) : null;
        break;
      case 'placeholder':
        this.state.placeholder = newValue ?? '';
        break;
      case 'label':
        this.state.label = newValue ?? undefined;
        break;
      case 'min':
        this.state.min = newValue ? parseFloat(newValue) : Number.MIN_SAFE_INTEGER;
        break;
      case 'max':
        this.state.max = newValue ? parseFloat(newValue) : Number.MAX_SAFE_INTEGER;
        break;
      case 'step':
        this.state.step = newValue ? parseFloat(newValue) : 1;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'required':
        this.state.required = newValue !== null;
        break;
      case 'name':
        this.state.name = newValue ?? '';
        break;
    }

    this.render();
  }

  get value(): number | null {
    return this.state.value;
  }

  set value(val: number | null) {
    this.state.value = val;
    if (val !== null) {
      this.setAttribute('value', String(val));
    } else {
      this.removeAttribute('value');
    }
    this.render();
  }

  get placeholder(): string {
    return this.state.placeholder;
  }

  set placeholder(val: string) {
    this.state.placeholder = val;
    this.setAttribute('placeholder', val);
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

  get min(): number {
    return this.state.min;
  }

  set min(val: number) {
    this.state.min = val;
    this.setAttribute('min', String(val));
    this.render();
  }

  get max(): number {
    return this.state.max;
  }

  set max(val: number) {
    this.state.max = val;
    this.setAttribute('max', String(val));
    this.render();
  }

  get step(): number {
    return this.state.step;
  }

  set step(val: number) {
    this.state.step = val;
    this.setAttribute('step', String(val));
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

  get name(): string {
    return this.state.name;
  }

  set name(val: string) {
    this.state.name = val;
    this.setAttribute('name', val);
  }

  get validationMessage(): string {
    if (this.state.isValid) return '';
    if (this.state.required && this.state.value === null) {
      return 'This field is required.';
    }
    if (this.state.value !== null && this.state.value < this.state.min) {
      return `Value must be at least ${this.state.min}.`;
    }
    if (this.state.value !== null && this.state.value > this.state.max) {
      return `Value must be no more than ${this.state.max}.`;
    }
    return 'Invalid number.';
  }

  focus(): void {
    this.inputElement?.focus();
  }

  blur(): void {
    this.inputElement?.blur();
  }

  checkValidity(): boolean {
    this.validate();
    return this.state.isValid;
  }

  reset(): void {
    this.value = null;
  }

  private validate(): void {
    if (this.state.required && this.state.value === null) {
      this.state.isValid = false;
      return;
    }

    if (this.state.value !== null) {
      if (this.state.value < this.state.min || this.state.value > this.state.max) {
        this.state.isValid = false;
        return;
      }
    }

    this.state.isValid = true;
  }

  private setupEventListeners(): void {
    if (!this.inputElement) return;

    this.inputElement.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.state.value = target.value ? parseFloat(target.value) : null;
      this.validate();

      this.dispatchEvent(
        new CustomEvent('input', {
          detail: { value: this.state.value },
          bubbles: true,
          composed: true,
        })
      );
    });

    this.inputElement.addEventListener('change', () => {
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: this.state.value },
          bubbles: true,
          composed: true,
        })
      );
    });
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
      }

      .input-wrapper {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('SM')};
      }

      label {
        font-weight: 600;
        font-size: ${themeManager.getFontSize('SM')};
        color: ${themeManager.getColor('TEXT') || '#333'};
      }

      input {
        padding: ${themeManager.getSpacing('MD')} ${themeManager.getSpacing('LG')};
        border: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        font-size: ${themeManager.getFontSize('MD')};
        font-family: inherit;
        transition: border-color 0.2s;
      }

      input:focus {
        outline: none;
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
      }

      input:disabled {
        background-color: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f5f5f5'};
        opacity: 0.6;
        cursor: not-allowed;
      }

      .error-message {
        display: ${this.state.isValid ? 'none' : 'block'};
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
        font-size: ${themeManager.getFontSize('SM')};
        margin-top: ${themeManager.getSpacing('XS')};
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const labelId = `label-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="input-wrapper">
        ${this.state.label ? `<label id="${labelId}">${this.state.label}${this.state.required ? '<span style="color: red;">*</span>' : ''}</label>` : ''}
        <input
          type="number"
          ${this.state.min !== Number.MIN_SAFE_INTEGER ? `min="${this.state.min}"` : ''}
          ${this.state.max !== Number.MAX_SAFE_INTEGER ? `max="${this.state.max}"` : ''}
          step="${this.state.step}"
          ${this.state.value !== null ? `value="${this.state.value}"` : ''}
          placeholder="${this.state.placeholder}"
          ${this.state.disabled ? 'disabled' : ''}
          ${this.state.required ? 'required' : ''}
          aria-labelledby="${this.state.label ? labelId : ''}"
          aria-required="${this.state.required}"
        >
        ${!this.state.isValid ? `<div class="error-message" id="${errorId}" role="alert">${this.validationMessage}</div>` : ''}
      </div>
    `;

    this.inputElement = this.shadowRootInternal.querySelector('input');
    this.setupEventListeners();

    if (this.state.isValid) {
      this.classList.remove('error');
    } else {
      this.classList.add('error');
    }
  }
}

customElements.define('ui-number-input', UiNumberInput);

declare global {
  interface HTMLElementTagNameMap {
    'ui-number-input': UiNumberInput;
  }
}

export { UiNumberInput };
