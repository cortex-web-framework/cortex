/**
 * UiTextInput - Pure vanilla Web Component with zero external dependencies
 * Replaces Lit library with native Web Components API
 */
export class UiTextInput extends HTMLElement {
  private _inputId: string = '';
  private _shadowRoot: ShadowRoot;

  // Properties that should be reflected as attributes
  private _value: string = '';
  private _placeholder: string = '';
  private _disabled: boolean = false;
  private _readonly: boolean = false;
  private _type: string = 'text';
  private _name: string = '';
  private _label: string = '';

  constructor() {
    super();
    // Create shadow DOM for encapsulation
    this._shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.id) {
      this._inputId = `ui-text-input-${Math.random().toString(36).substr(2, 9)}`;
    } else {
      this._inputId = this.id;
    }
    this.render();
  }

  // Property getters and setters
  get value(): string {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
    this.setAttribute('value', val);
    const input = this._shadowRoot.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = val;
    }
  }

  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(val: string) {
    this._placeholder = val;
    this.setAttribute('placeholder', val);
    this.render();
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(val: boolean) {
    this._disabled = val;
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
    this.render();
  }

  get readonly(): boolean {
    return this._readonly;
  }

  set readonly(val: boolean) {
    this._readonly = val;
    if (val) {
      this.setAttribute('readonly', '');
    } else {
      this.removeAttribute('readonly');
    }
    this.render();
  }

  get type(): string {
    return this._type;
  }

  set type(val: string) {
    this._type = val;
    this.setAttribute('type', val);
    this.render();
  }

  get name(): string {
    return this._name;
  }

  set name(val: string) {
    this._name = val;
    this.setAttribute('name', val);
    this.render();
  }

  get label(): string {
    return this._label;
  }

  set label(val: string) {
    this._label = val;
    this.setAttribute('label', val);
    this.render();
  }

  // Observe attribute changes
  static get observedAttributes() {
    return ['value', 'placeholder', 'disabled', 'readonly', 'type', 'name', 'label'];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'value':
        this._value = newValue || '';
        break;
      case 'placeholder':
        this._placeholder = newValue || '';
        break;
      case 'disabled':
        this._disabled = newValue !== null;
        break;
      case 'readonly':
        this._readonly = newValue !== null;
        break;
      case 'type':
        this._type = newValue || 'text';
        break;
      case 'name':
        this._name = newValue || '';
        break;
      case 'label':
        this._label = newValue || '';
        break;
    }
    this.render();
  }

  private _onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this._value = input.value;
    this.dispatchEvent(
      new CustomEvent('input', {
        detail: this._value,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this._value = input.value;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: this._value,
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onFocus() {
    this.dispatchEvent(
      new CustomEvent('focus', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onBlur() {
    this.dispatchEvent(
      new CustomEvent('blur', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private render() {
    const styles = `
      :host {
        display: block;
        margin-bottom: 16px;
      }

      .form-field {
        display: flex;
        flex-direction: column;
      }

      label {
        font-size: 0.875em;
        color: var(--text-color-light, #333);
        margin-bottom: 4px;
      }

      input {
        padding: 8px 12px;
        border: 1px solid var(--border-color, #ccc);
        border-radius: 4px;
        font-size: 1em;
        line-height: 1.5;
        color: var(--text-color, #000);
        background-color: var(--background-color, #fff);
        transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      }

      input:focus {
        border-color: var(--focus-border-color, #007bff);
        box-shadow: 0 0 0 3px var(--focus-shadow-color, rgba(0, 123, 255, 0.25));
        outline: none;
      }

      input:disabled,
      input[readonly] {
        background-color: var(--disabled-background-color, #e9ecef);
        color: var(--disabled-text-color, #6c757d);
        cursor: not-allowed;
      }

      input::placeholder {
        color: var(--placeholder-color, #6c757d);
      }
    `;

    const labelHtml = this._label
      ? `<label for="${this._inputId}">${this._label}</label>`
      : '';

    const html = `
      <style>${styles}</style>
      <div class="form-field">
        ${labelHtml}
        <input
          id="${this._inputId}"
          type="${this._type}"
          name="${this._name}"
          placeholder="${this._placeholder}"
          ${this._disabled ? 'disabled' : ''}
          ${this._readonly ? 'readonly' : ''}
        />
      </div>
    `;

    this._shadowRoot.innerHTML = html;

    // Re-attach event listeners after render
    const input = this._shadowRoot.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = this._value;
      input.addEventListener('input', (e) => this._onInput(e));
      input.addEventListener('change', (e) => this._onChange(e));
      input.addEventListener('focus', () => this._onFocus());
      input.addEventListener('blur', () => this._onBlur());
    }
  }
}

// Register the custom element with zero external dependencies
customElements.define('ui-text-input', UiTextInput);