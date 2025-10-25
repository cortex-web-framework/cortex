import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ui-text-input')
export class UiTextInput extends LitElement {
  static styles = css`
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

  @property({ type: String })
  value: string = '';

  @property({ type: String })
  placeholder: string = '';

  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  @property({ type: Boolean, reflect: true })
  readonly: boolean = false;

  @property({ type: String, reflect: true })
  type: string = 'text';

  @property({ type: String, reflect: true })
  name: string = '';

  @property({ type: String })
  label: string = '';

  @property({ type: String, reflect: true })
  id: string = '';

  private _inputId: string = '';

  connectedCallback() {
    super.connectedCallback();
    if (!this.id) {
      this._inputId = `ui-text-input-${Math.random().toString(36).substr(2, 9)}`;
    } else {
      this._inputId = this.id;
    }
  }

  private _onInput(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
    this.dispatchEvent(new CustomEvent('input', { detail: this.value, bubbles: true, composed: true }));
  }

  private _onChange(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
    this.dispatchEvent(new CustomEvent('change', { detail: this.value, bubbles: true, composed: true }));
  }

  private _onFocus() {
    this.dispatchEvent(new CustomEvent('focus', { bubbles: true, composed: true }));
  }

  private _onBlur() {
    this.dispatchEvent(new CustomEvent('blur', { bubbles: true, composed: true }));
  }

  render() {
    return html`
      <div class="form-field">
        ${this.label && html`<label for="${this._inputId}">${this.label}</label>`}
        <input
          id="${this._inputId}"
          .value="${this.value}"
          placeholder="${this.placeholder}"
          ?disabled="${this.disabled}"
          ?readonly="${this.readonly}"
          type="${this.type}"
          name="${this.name}"
          @input="${this._onInput}"
          @change="${this._onChange}"
          @focus="${this._onFocus}"
          @blur="${this._onBlur}"
        />
      </div>
    `;
  }
}