/**
 * ui-textarea: A multi-line text input component with validation support.
 * Supports required validation, character limits, and form integration.
 */

import { TextareaState, ITextareaElement, ValidationResult } from './ui-textarea.types.js';
import { themeManager } from '../../theme/theme-manager.js';

/**
 * Textarea Web Component
 *
 * @element ui-textarea
 * @fires input - Emitted when value changes
 * @fires change - Emitted when value changes and textarea loses focus
 * @fires focus - Emitted when textarea gains focus
 * @fires blur - Emitted when textarea loses focus
 *
 * @attr value - Current textarea value
 * @attr placeholder - Placeholder text
 * @attr label - Label text
 * @attr rows - Number of rows
 * @attr cols - Number of columns
 * @attr disabled - Disabled state
 * @attr readonly - Read-only state
 * @attr required - Required validation
 * @attr maxLength - Maximum character length
 * @attr minLength - Minimum character length
 * @attr name - Form field name
 */
class UiTextarea extends HTMLElement implements ITextareaElement {
  private shadowRootInternal: ShadowRoot;
  private textareaElement: HTMLTextAreaElement | null = null;

  private state: TextareaState = {
    value: '',
    placeholder: '',
    rows: 4,
    cols: 40,
    disabled: false,
    readonly: false,
    required: false,
    maxLength: -1,
    minLength: 0,
    name: '',
    isValid: true,
  };

  static get observedAttributes(): string[] {
    return ['value', 'placeholder', 'label', 'rows', 'cols', 'disabled', 'readonly', 'required', 'maxLength', 'minLength', 'name'];
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
      case 'label':
        this.state.label = newValue ?? undefined;
        break;
      case 'rows':
        this.state.rows = newValue ? parseInt(newValue, 10) : 4;
        break;
      case 'cols':
        this.state.cols = newValue ? parseInt(newValue, 10) : 40;
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
      case 'maxLength':
        this.state.maxLength = newValue ? parseInt(newValue, 10) : -1;
        break;
      case 'minLength':
        this.state.minLength = newValue ? parseInt(newValue, 10) : 0;
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
    this.render();
  }

  /** Property: placeholder */
  get placeholder(): string {
    return this.state.placeholder;
  }

  set placeholder(val: string) {
    this.state.placeholder = val;
    this.setAttribute('placeholder', val);
    this.render();
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

  /** Property: rows */
  get rows(): number {
    return this.state.rows;
  }

  set rows(val: number) {
    this.state.rows = val;
    this.setAttribute('rows', String(val));
    this.render();
  }

  /** Property: cols */
  get cols(): number {
    return this.state.cols;
  }

  set cols(val: number) {
    this.state.cols = val;
    this.setAttribute('cols', String(val));
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

  /** Property: maxLength */
  get maxLength(): number {
    return this.state.maxLength;
  }

  set maxLength(val: number) {
    this.state.maxLength = val;
    this.setAttribute('maxLength', String(val));
    this.render();
  }

  /** Property: minLength */
  get minLength(): number {
    return this.state.minLength;
  }

  set minLength(val: number) {
    this.state.minLength = val;
    this.setAttribute('minLength', String(val));
    this.render();
  }

  /** Property: name */
  get name(): string {
    return this.state.name;
  }

  set name(val: string) {
    this.state.name = val;
    this.setAttribute('name', val);
  }

  /** Property: validationMessage */
  get validationMessage(): string {
    if (this.state.isValid) return '';
    if (this.state.required && !this.state.value) {
      return 'This field is required.';
    }
    if (this.state.minLength > 0 && this.state.value.length < this.state.minLength) {
      return `Please enter at least ${this.state.minLength} characters.`;
    }
    if (this.state.maxLength > 0 && this.state.value.length > this.state.maxLength) {
      return `Please enter no more than ${this.state.maxLength} characters.`;
    }
    return 'Invalid input.';
  }

  /** Method: focus */
  focus(): void {
    this.textareaElement?.focus();
  }

  /** Method: blur */
  blur(): void {
    this.textareaElement?.blur();
  }

  /** Method: select */
  select(): void {
    this.textareaElement?.select();
  }

  /** Method: checkValidity */
  checkValidity(): boolean {
    this.validate();
    return this.state.isValid;
  }

  /** Method: getValidationResult */
  getValidationResult(): ValidationResult {
    this.validate();
    const errors: string[] = [];

    if (this.state.required && !this.state.value) {
      errors.push('This field is required.');
    }
    if (this.state.minLength > 0 && this.state.value.length < this.state.minLength) {
      errors.push(`Please enter at least ${this.state.minLength} characters.`);
    }
    if (this.state.maxLength > 0 && this.state.value.length > this.state.maxLength) {
      errors.push(`Please enter no more than ${this.state.maxLength} characters.`);
    }

    return {
      valid: this.state.isValid,
      errors,
      message: this.validationMessage,
    };
  }

  /** Method: reset */
  reset(): void {
    this.value = '';
  }

  private validate(): void {
    if (this.state.required && !this.state.value) {
      this.state.isValid = false;
      return;
    }

    if (this.state.minLength > 0 && this.state.value.length < this.state.minLength) {
      this.state.isValid = false;
      return;
    }

    if (this.state.maxLength > 0 && this.state.value.length > this.state.maxLength) {
      this.state.isValid = false;
      return;
    }

    this.state.isValid = true;
  }

  private setupEventListeners(): void {
    if (!this.textareaElement) return;

    this.textareaElement.addEventListener('input', this.handleInput.bind(this));
    this.textareaElement.addEventListener('change', this.handleChange.bind(this));
    this.textareaElement.addEventListener('focus', this.handleFocus.bind(this));
    this.textareaElement.addEventListener('blur', this.handleBlur.bind(this));
  }

  private removeEventListeners(): void {
    if (!this.textareaElement) return;

    this.textareaElement.removeEventListener('input', this.handleInput.bind(this));
    this.textareaElement.removeEventListener('change', this.handleChange.bind(this));
    this.textareaElement.removeEventListener('focus', this.handleFocus.bind(this));
    this.textareaElement.removeEventListener('blur', this.handleBlur.bind(this));
  }

  private handleInput(): void {
    if (!this.textareaElement) return;
    this.state.value = this.textareaElement.value;
    this.validate();
    this.render();

    this.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: this.state.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleChange(): void {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.state.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleFocus(): void {
    this.dispatchEvent(
      new CustomEvent('focus', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleBlur(): void {
    this.dispatchEvent(
      new CustomEvent('blur', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private getTextareaStyles(): string {
    return `
      :host {
        display: block;
        font-family: inherit;
      }

      .textarea-wrapper {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('SM')};
      }

      label {
        font-weight: 600;
        font-size: ${themeManager.getFontSize('SM')};
        color: ${themeManager.getColor('TEXT') || '#333'};
      }

      .textarea-container {
        position: relative;
        display: flex;
        flex-direction: column;
      }

      textarea {
        padding: ${themeManager.getSpacing('MD')} ${themeManager.getSpacing('LG')};
        border: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        font-family: inherit;
        font-size: ${themeManager.getFontSize('MD')};
        color: ${themeManager.getColor('TEXT') || '#333'};
        resize: vertical;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      textarea:focus {
        outline: none;
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
      }

      textarea:disabled {
        background-color: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f5f5f5'};
        opacity: 0.6;
        cursor: not-allowed;
      }

      textarea:read-only {
        background-color: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f5f5f5'};
        border-color: ${themeManager.getColor('BORDER') || '#ddd'};
      }

      .char-count {
        display: flex;
        justify-content: flex-end;
        font-size: ${themeManager.getFontSize('XS')};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
        margin-top: ${themeManager.getSpacing('XS')};
      }

      .char-count.warning {
        color: ${themeManager.getColor('WARNING') || '#ffc107'};
      }

      .char-count.danger {
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
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

    const charCountPercent = this.state.maxLength > 0 ? (this.state.value.length / this.state.maxLength) * 100 : 0;
    const charCountClass =
      charCountPercent > 90 ? 'danger' : charCountPercent > 70 ? 'warning' : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getTextareaStyles()}</style>
      <div class="textarea-wrapper">
        ${this.state.label ? `<label id="${labelId}">${this.state.label}${this.state.required ? '<span style="color: red;">*</span>' : ''}</label>` : ''}
        <div class="textarea-container">
          <textarea
            rows="${this.state.rows}"
            cols="${this.state.cols}"
            ${this.state.disabled ? 'disabled' : ''}
            ${this.state.readonly ? 'readonly' : ''}
            ${this.state.required ? 'required' : ''}
            ${this.state.maxLength > 0 ? `maxlength="${this.state.maxLength}"` : ''}
            ${this.state.minLength > 0 ? `minlength="${this.state.minLength}"` : ''}
            placeholder="${this.state.placeholder}"
            aria-labelledby="${this.state.label ? labelId : ''}"
            aria-required="${this.state.required}"
          >${this.state.value}</textarea>
          ${
            this.state.maxLength > 0
              ? `<div class="char-count ${charCountClass}">${this.state.value.length} / ${this.state.maxLength}</div>`
              : ''
          }
        </div>
        ${!this.state.isValid ? `<div class="error-message" id="${errorId}" role="alert">${this.validationMessage}</div>` : ''}
      </div>
    `;

    // Cache reference
    this.textareaElement = this.shadowRootInternal.querySelector('textarea');
    this.setupEventListeners();

    // Update class
    if (this.state.isValid) {
      this.classList.remove('error');
    } else {
      this.classList.add('error');
    }
  }
}

// Register the custom element
customElements.define('ui-textarea', UiTextarea);

// Export for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'ui-textarea': UiTextarea;
  }
}

export { UiTextarea };
