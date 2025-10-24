/**
 * ui-text-input: A customizable text input component built with Web Components.
 * No external dependencies - pure Lit + TypeScript.
 * Supports validation, accessibility, form integration, and theming.
 */

import {
  TextInputType,
  ValidationResult,
  ValidationError,
  ITextInputElement,
  TextInputState,
} from './ui-text-input.types.js';
import { themeManager } from '../../theme/theme-manager.js';

/**
 * Text Input Web Component
 *
 * @element ui-text-input
 * @fires input - Emitted when the input value changes
 * @fires change - Emitted when the input loses focus
 * @fires focus - Emitted when the input gains focus
 * @fires blur - Emitted when the input loses focus
 *
 * @attr value - The current input value
 * @attr placeholder - Placeholder text
 * @attr type - Input type (text, email, password, etc.)
 * @attr label - Label text
 * @attr disabled - Disabled state
 * @attr readonly - Read-only state
 * @attr required - Required validation
 * @attr maxlength - Maximum input length
 * @attr pattern - Validation regex pattern
 * @attr name - Form field name
 *
 * @cssprop [--ui-text-input-background=white] - Background color
 * @cssprop [--ui-text-input-border-color=var(--ui-color-border, #ddd)] - Border color
 * @cssprop [--ui-text-input-border-color-focus=var(--ui-color-primary, #007bff)] - Focus border color
 * @cssprop [--ui-text-input-color=var(--ui-color-text, #333)] - Text color
 * @cssprop [--ui-text-input-padding=var(--ui-spacing-md) var(--ui-spacing-lg)] - Input padding
 * @cssprop [--ui-text-input-font-size=var(--ui-font-size-md)] - Font size
 * @cssprop [--ui-text-input-border-radius=var(--ui-border-radius-md, 4px)] - Border radius
 */
class UiTextInput extends HTMLElement implements ITextInputElement {
  private shadowRootInternal: ShadowRoot;
  private inputElement: HTMLInputElement | null = null;

  private state: TextInputState = {
    value: '',
    placeholder: '',
    type: 'text',
    disabled: false,
    readonly: false,
    required: false,
    maxLength: 524288, // browser default
    pattern: '',
    name: '',
    isDirty: false,
    isFocused: false,
    isValid: true,
    validationErrors: [],
  };

  static get observedAttributes(): string[] {
    return ['value', 'placeholder', 'type', 'label', 'disabled', 'readonly', 'required', 'maxlength', 'pattern', 'name'];
  }

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback(): void {
    this.removeEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'value':
        this.state.value = newValue ?? '';
        break;
      case 'placeholder':
        this.state.placeholder = newValue ?? '';
        break;
      case 'type':
        this.state.type = (newValue ?? 'text') as TextInputType;
        break;
      case 'label':
        this.state.label = newValue ?? undefined;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'readonly':
        this.state.readonly = newValue !== null;
        break;
      case 'required':
        this.state.required = newValue !== null;
        break;
      case 'maxlength':
        this.state.maxLength = newValue ? parseInt(newValue, 10) : 524288;
        break;
      case 'pattern':
        this.state.pattern = newValue ?? '';
        break;
      case 'name':
        this.state.name = newValue ?? '';
        break;
    }

    this.render();
  }

  /** Property: value */
  get value(): string {
    return this.state.value;
  }

  set value(val: string) {
    this.state.value = val;
    this.setAttribute('value', val);
    this.updateInputValue();
  }

  /** Property: placeholder */
  get placeholder(): string {
    return this.state.placeholder;
  }

  set placeholder(val: string) {
    this.state.placeholder = val;
    this.setAttribute('placeholder', val);
    this.updateInputPlaceholder();
  }

  /** Property: type */
  get type(): TextInputType {
    return this.state.type;
  }

  set type(val: TextInputType) {
    this.state.type = val;
    this.setAttribute('type', val);
    if (this.inputElement) {
      this.inputElement.type = val;
    }
  }

  /** Property: label */
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
    this.updateInputDisabled();
  }

  /** Property: readonly */
  get readonly(): boolean {
    return this.state.readonly;
  }

  set readonly(val: boolean) {
    this.state.readonly = val;
    if (val) {
      this.setAttribute('readonly', '');
    } else {
      this.removeAttribute('readonly');
    }
    if (this.inputElement) {
      this.inputElement.readOnly = val;
    }
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
    this.updateInputRequired();
  }

  /** Property: maxLength */
  get maxLength(): number {
    return this.state.maxLength;
  }

  set maxLength(val: number) {
    this.state.maxLength = val;
    this.setAttribute('maxlength', String(val));
    if (this.inputElement) {
      this.inputElement.maxLength = val;
    }
  }

  /** Property: pattern */
  get pattern(): string {
    return this.state.pattern;
  }

  set pattern(val: string) {
    this.state.pattern = val;
    this.setAttribute('pattern', val);
    if (this.inputElement) {
      this.inputElement.pattern = val;
    }
  }

  /** Property: name */
  get name(): string {
    return this.state.name;
  }

  set name(val: string) {
    this.state.name = val;
    this.setAttribute('name', val);
    if (this.inputElement) {
      this.inputElement.name = val;
    }
  }

  /** Property: validationMessage */
  get validationMessage(): string {
    if (this.state.isValid) return '';

    if (this.state.validationErrors.includes('required')) {
      return 'This field is required.';
    }
    if (this.state.validationErrors.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (this.state.validationErrors.includes('invalid-pattern')) {
      return 'Please enter a value that matches the expected format.';
    }
    if (this.state.validationErrors.includes('too-long')) {
      return `Maximum ${this.state.maxLength} characters allowed.`;
    }
    if (this.state.validationErrors.includes('invalid-type')) {
      return `Please enter a valid ${this.state.type}.`;
    }

    return 'Invalid input.';
  }

  /** Method: checkValidity */
  checkValidity(): boolean {
    this.validate();
    return this.state.isValid;
  }

  /** Method: getValidationResult */
  getValidationResult(): ValidationResult {
    this.validate();
    return {
      valid: this.state.isValid,
      errors: this.state.validationErrors,
      message: this.validationMessage,
    };
  }

  /** Method: focus */
  focus(): void {
    this.inputElement?.focus();
  }

  /** Method: blur */
  blur(): void {
    this.inputElement?.blur();
  }

  /** Method: select */
  select(): void {
    this.inputElement?.select();
  }

  /** Method: setSelectionRange */
  setSelectionRange(start: number, end: number): void {
    this.inputElement?.setSelectionRange(start, end);
  }

  /** Method: reset */
  reset(): void {
    this.state.value = '';
    this.state.isDirty = false;
    this.state.isValid = true;
    this.state.validationErrors = [];
    this.setAttribute('value', '');
    this.updateInputValue();
    this.render();
  }

  /** Method: getInputElement (for testing) */
  getInputElement(): HTMLInputElement | null {
    return this.inputElement;
  }

  private setupEventListeners(): void {
    if (!this.inputElement) return;

    this.inputElement.addEventListener('input', this.handleInput.bind(this));
    this.inputElement.addEventListener('change', this.handleChange.bind(this));
    this.inputElement.addEventListener('focus', this.handleFocus.bind(this));
    this.inputElement.addEventListener('blur', this.handleBlur.bind(this));
  }

  private removeEventListeners(): void {
    if (!this.inputElement) return;

    this.inputElement.removeEventListener('input', this.handleInput.bind(this));
    this.inputElement.removeEventListener('change', this.handleChange.bind(this));
    this.inputElement.removeEventListener('focus', this.handleFocus.bind(this));
    this.inputElement.removeEventListener('blur', this.handleBlur.bind(this));
  }

  private handleInput(event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;
    this.state.value = target.value;
    this.state.isDirty = true;

    // Dispatch custom input event
    this.dispatchEvent(
      new CustomEvent('input', {
        detail: {
          value: this.state.value,
          valid: this.checkValidity(),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleChange(event: Event): void {
    event.stopPropagation();
    this.validate();

    // Dispatch custom change event
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: this.state.value,
          valid: this.state.isValid,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleFocus(event: Event): void {
    event.stopPropagation();
    this.state.isFocused = true;
    this.render();

    this.dispatchEvent(
      new FocusEvent('focus', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleBlur(event: Event): void {
    event.stopPropagation();
    this.state.isFocused = false;
    this.validate();
    this.render();

    this.dispatchEvent(
      new FocusEvent('blur', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private validate(): void {
    const errors: ValidationError[] = [];

    // Required validation
    if (this.state.required && !this.state.value.trim()) {
      errors.push('required');
    }

    // Type-specific validation
    if (this.state.value && this.state.type === 'email') {
      if (!this.isValidEmail(this.state.value)) {
        errors.push('invalid-email');
      }
    }

    // Pattern validation
    if (this.state.value && this.state.pattern) {
      try {
        const regex = new RegExp(this.state.pattern);
        if (!regex.test(this.state.value)) {
          errors.push('invalid-pattern');
        }
      } catch (e) {
        // Invalid regex pattern
      }
    }

    // Max length validation
    if (this.state.value.length > this.state.maxLength) {
      errors.push('too-long');
    }

    this.state.validationErrors = errors;
    this.state.isValid = errors.length === 0;

    this.render();
  }

  private isValidEmail(email: string): boolean {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private updateInputValue(): void {
    if (this.inputElement) {
      this.inputElement.value = this.state.value;
    }
  }

  private updateInputPlaceholder(): void {
    if (this.inputElement) {
      this.inputElement.placeholder = this.state.placeholder;
    }
  }

  private updateInputDisabled(): void {
    if (this.inputElement) {
      this.inputElement.disabled = this.state.disabled;
    }
  }

  private updateInputRequired(): void {
    if (this.inputElement) {
      this.inputElement.required = this.state.required;
    }
  }

  private getInputStyles(): string {
    const borderColor = this.state.isFocused
      ? themeManager.getColor('PRIMARY')
      : themeManager.getColor('BORDER') || '#ddd';
    const backgroundColor = this.state.disabled ? 'transparent' : 'white';
    const opacity = this.state.disabled ? '0.6' : '1';

    return `
      :host {
        display: block;
        font-family: inherit;
      }

      .input-wrapper {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('SM')};
      }

      label {
        display: flex;
        align-items: center;
        font-weight: 600;
        color: ${themeManager.getColor('TEXT') || '#333'};
        font-size: ${themeManager.getFontSize('SM')};
      }

      .label-content {
        display: flex;
        gap: ${themeManager.getSpacing('XXS')};
        align-items: baseline;
      }

      .required-indicator {
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
        font-weight: bold;
      }

      input {
        padding: ${themeManager.getSpacing('MD')} ${themeManager.getSpacing('LG')};
        border: 1px solid ${borderColor};
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        font-size: ${themeManager.getFontSize('MD')};
        color: ${themeManager.getColor('TEXT') || '#333'};
        background-color: ${backgroundColor};
        font-family: inherit;
        transition: border-color 0.2s, box-shadow 0.2s;
        opacity: ${opacity};
        cursor: ${this.state.disabled ? 'not-allowed' : 'text'};
      }

      input:focus {
        outline: none;
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
      }

      input:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
      }

      input[readonly] {
        background-color: #f9f9f9;
        cursor: default;
      }

      .error-message {
        display: ${this.state.isValid ? 'none' : 'block'};
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
        font-size: ${themeManager.getFontSize('SM')};
        margin-top: ${themeManager.getSpacing('XS')};
      }

      :host(.error) input {
        border-color: ${themeManager.getColor('DANGER') || '#dc3545'};
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const labelId = `label-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;

    this.shadowRootInternal.innerHTML = `
      <style>${this.getInputStyles()}</style>
      <div class="input-wrapper">
        ${
          this.state.label
            ? `
          <label id="${labelId}">
            <div class="label-content">
              <span>${this.state.label}</span>
              ${this.state.required ? '<span class="required-indicator">*</span>' : ''}
            </div>
          </label>
        `
            : ''
        }
        <input
          type="${this.state.type}"
          value="${this.state.value}"
          placeholder="${this.state.placeholder}"
          ${this.state.disabled ? 'disabled' : ''}
          ${this.state.readonly ? 'readonly' : ''}
          ${this.state.required ? 'required' : ''}
          ${this.state.maxLength < 524288 ? `maxlength="${this.state.maxLength}"` : ''}
          ${this.state.pattern ? `pattern="${this.state.pattern}"` : ''}
          ${this.state.name ? `name="${this.state.name}"` : ''}
          aria-labelledby="${this.state.label ? labelId : ''}"
          aria-required="${this.state.required}"
          aria-invalid="${!this.state.isValid}"
          aria-describedby="${!this.state.isValid ? errorId : ''}"
        />
        ${
          !this.state.isValid
            ? `<div class="error-message" id="${errorId}" role="alert">${this.validationMessage}</div>`
            : ''
        }
      </div>
    `;

    // Cache references
    this.inputElement = this.shadowRootInternal.querySelector('input');

    // Update class
    if (this.state.isValid) {
      this.classList.remove('error');
    } else {
      this.classList.add('error');
    }

    // Re-attach event listeners after re-render
    if (this.inputElement) {
      this.setupEventListeners();
    }
  }
}

// Register the custom element
customElements.define('ui-text-input', UiTextInput);

// Export for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'ui-text-input': UiTextInput;
  }
}

export { UiTextInput };
