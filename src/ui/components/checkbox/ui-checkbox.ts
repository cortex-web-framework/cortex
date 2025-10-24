/**
 * ui-checkbox: A customizable checkbox component built with Web Components.
 * Supports tri-state (indeterminate), accessibility, form integration, and theming.
 */

import {
  CheckboxChangeDetail,
  CheckboxState,
  ICheckboxElement,
} from './ui-checkbox.types.js';
import { themeManager } from '../../theme/theme-manager.js';

/**
 * Checkbox Web Component
 *
 * @element ui-checkbox
 * @fires change - Emitted when the checkbox state changes
 * @fires focus - Emitted when the checkbox gains focus
 * @fires blur - Emitted when the checkbox loses focus
 *
 * @attr checked - Checked state
 * @attr disabled - Disabled state
 * @attr label - Label text
 * @attr value - Checkbox value
 * @attr required - Required validation
 * @attr indeterminate - Indeterminate (tri-state) mode
 * @attr name - Form field name
 *
 * @cssprop [--ui-checkbox-border-color=var(--ui-color-border, #ddd)] - Border color
 * @cssprop [--ui-checkbox-checked-color=var(--ui-color-primary, #007bff)] - Checked color
 * @cssprop [--ui-checkbox-size=20px] - Checkbox size
 */
class UiCheckbox extends HTMLElement implements ICheckboxElement {
  private shadowRootInternal: ShadowRoot;
  private inputElement: HTMLInputElement | null = null;

  private state: CheckboxState = {
    checked: false,
    disabled: false,
    value: 'on',
    required: false,
    indeterminate: false,
    name: '',
    isFocused: false,
    isValid: true,
  };

  static get observedAttributes(): string[] {
    return ['checked', 'disabled', 'label', 'value', 'required', 'indeterminate', 'name'];
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
      case 'checked':
        this.state.checked = newValue !== null;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'label':
        this.state.label = newValue ?? undefined;
        break;
      case 'value':
        this.state.value = newValue ?? 'on';
        break;
      case 'required':
        this.state.required = newValue !== null;
        break;
      case 'indeterminate':
        this.state.indeterminate = newValue !== null;
        break;
      case 'name':
        this.state.name = newValue ?? '';
        break;
    }

    this.render();
  }

  /** Property: checked */
  get checked(): boolean {
    return this.state.checked;
  }

  set checked(val: boolean) {
    this.state.checked = val;
    this.state.indeterminate = false; // Clear indeterminate when setting checked
    if (val) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
    this.updateInputChecked();
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

  /** Property: value */
  get value(): string {
    return this.state.value;
  }

  set value(val: string) {
    this.state.value = val;
    this.setAttribute('value', val);
    if (this.inputElement) {
      this.inputElement.value = val;
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

  /** Property: indeterminate */
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
    if (this.inputElement) {
      this.inputElement.indeterminate = val;
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
    if (this.state.required && !this.state.checked) {
      return 'Please check this box if you want to proceed.';
    }
    return 'Invalid.';
  }

  /** Method: focus */
  focus(): void {
    this.inputElement?.focus();
  }

  /** Method: blur */
  blur(): void {
    this.inputElement?.blur();
  }

  /** Method: toggle */
  toggle(): void {
    this.checked = !this.checked;
  }

  /** Method: checkValidity */
  checkValidity(): boolean {
    this.validate();
    return this.state.isValid;
  }

  /** Method: getInputElement (for testing) */
  getInputElement(): HTMLInputElement | null {
    return this.inputElement;
  }

  private setupEventListeners(): void {
    if (!this.inputElement) return;

    this.inputElement.addEventListener('change', this.handleChange.bind(this));
    this.inputElement.addEventListener('focus', this.handleFocus.bind(this));
    this.inputElement.addEventListener('blur', this.handleBlur.bind(this));
  }

  private removeEventListeners(): void {
    if (!this.inputElement) return;

    this.inputElement.removeEventListener('change', this.handleChange.bind(this));
    this.inputElement.removeEventListener('focus', this.handleFocus.bind(this));
    this.inputElement.removeEventListener('blur', this.handleBlur.bind(this));
  }

  private handleChange(event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLInputElement;

    this.state.checked = target.checked;
    this.state.indeterminate = target.indeterminate;

    // Dispatch custom change event
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          checked: this.state.checked,
          value: this.state.value,
          name: this.state.name,
        } as CheckboxChangeDetail,
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
    if (this.state.required && !this.state.checked) {
      this.state.isValid = false;
    } else {
      this.state.isValid = true;
    }

    this.render();
  }

  private updateInputChecked(): void {
    if (this.inputElement) {
      this.inputElement.checked = this.state.checked;
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

  private getCheckboxStyles(): string {
    const opacity = this.state.disabled ? '0.6' : '1';
    const cursor = this.state.disabled ? 'not-allowed' : 'pointer';

    return `
      :host {
        display: inline-block;
        font-family: inherit;
      }

      .checkbox-wrapper {
        display: flex;
        align-items: center;
        gap: ${themeManager.getSpacing('SM')};
        opacity: ${opacity};
        cursor: ${cursor};
      }

      .checkbox-wrapper.disabled {
        cursor: not-allowed;
      }

      input[type="checkbox"] {
        width: var(--ui-checkbox-size, 20px);
        height: var(--ui-checkbox-size, 20px);
        cursor: ${cursor};
        accent-color: var(--ui-checkbox-checked-color, var(--ui-color-primary, #007bff));
        border: 1px solid var(--ui-checkbox-border-color, var(--ui-color-border, #ddd));
        border-radius: 4px;
        margin: 0;
      }

      input[type="checkbox"]:focus {
        outline: 2px solid var(--ui-checkbox-checked-color, var(--ui-color-primary, #007bff));
        outline-offset: 2px;
      }

      input[type="checkbox"]:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      label {
        display: flex;
        align-items: center;
        gap: ${themeManager.getSpacing('XS')};
        cursor: ${cursor};
        user-select: none;
        color: ${themeManager.getColor('TEXT') || '#333'};
        font-size: ${themeManager.getFontSize('MD')};
      }

      .required-indicator {
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
        font-weight: bold;
      }

      .error-message {
        display: ${this.state.isValid ? 'none' : 'block'};
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
        font-size: ${themeManager.getFontSize('SM')};
        margin-top: ${themeManager.getSpacing('XS')};
      }

      :host(.error) .checkbox-wrapper {
        border-color: ${themeManager.getColor('DANGER') || '#dc3545'};
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const labelId = `label-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;

    this.shadowRootInternal.innerHTML = `
      <style>${this.getCheckboxStyles()}</style>
      <div class="checkbox-wrapper ${this.state.disabled ? 'disabled' : ''} ${this.state.isFocused ? 'focused' : ''}">
        <input
          type="checkbox"
          ${this.state.checked ? 'checked' : ''}
          ${this.state.disabled ? 'disabled' : ''}
          ${this.state.required ? 'required' : ''}
          ${this.state.indeterminate ? 'aria-checked="mixed"' : ''}
          ${this.state.name ? `name="${this.state.name}"` : ''}
          value="${this.state.value}"
          aria-labelledby="${this.state.label ? labelId : ''}"
          aria-required="${this.state.required}"
          aria-invalid="${!this.state.isValid}"
          aria-describedby="${!this.state.isValid ? errorId : ''}"
        />
        ${
          this.state.label
            ? `
          <label id="${labelId}">
            <span>${this.state.label}</span>
            ${this.state.required ? '<span class="required-indicator">*</span>' : ''}
          </label>
        `
            : ''
        }
      </div>
      ${
        !this.state.isValid
          ? `<div class="error-message" id="${errorId}" role="alert">${this.validationMessage}</div>`
          : ''
      }
    `;

    // Cache reference
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
customElements.define('ui-checkbox', UiCheckbox);

// Export for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'ui-checkbox': UiCheckbox;
  }
}

export { UiCheckbox };
