/**
 * ui-toggle: A toggle switch component.
 */

import { ToggleState, IToggleElement } from './ui-toggle.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiToggle extends HTMLElement implements IToggleElement {
  private shadowRootInternal: ShadowRoot;
  private switchElement: HTMLDivElement | null = null;

  private state: ToggleState = {
    checked: false,
    disabled: false,
    required: false,
    name: '',
    isValid: true,
  };

  static get observedAttributes(): string[] {
    return ['checked', 'disabled', 'required', 'label', 'name'];
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
      case 'checked':
        this.state.checked = newValue !== null;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'required':
        this.state.required = newValue !== null;
        break;
      case 'label':
        this.state.label = newValue || undefined;
        break;
      case 'name':
        this.state.name = newValue ?? '';
        break;
    }

    this.render();
  }

  get checked(): boolean {
    return this.state.checked;
  }

  set checked(val: boolean) {
    this.state.checked = val;
    if (val) {
      this.setAttribute('checked', '');
    } else {
      this.removeAttribute('checked');
    }
    this.render();

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { checked: val },
        bubbles: true,
        composed: true,
      })
    );
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

  get name(): string {
    return this.state.name;
  }

  set name(val: string) {
    this.state.name = val;
    this.setAttribute('name', val);
  }

  get validationMessage(): string {
    if (this.state.isValid) return '';
    if (this.state.required && !this.state.checked) {
      return 'This field is required.';
    }
    return 'Invalid.';
  }

  focus(): void {
    this.switchElement?.focus();
  }

  blur(): void {
    this.switchElement?.blur();
  }

  toggle(): void {
    this.checked = !this.state.checked;
  }

  checkValidity(): boolean {
    this.validate();
    return this.state.isValid;
  }

  private validate(): void {
    if (this.state.required && !this.state.checked) {
      this.state.isValid = false;
    } else {
      this.state.isValid = true;
    }
  }

  private getStyles(): string {
    return `
      :host {
        display: inline-block;
      }

      .toggle-wrapper {
        display: flex;
        align-items: center;
        gap: ${themeManager.getSpacing('SM')};
      }

      [role="switch"] {
        width: 48px;
        height: 28px;
        background: ${this.state.checked ? themeManager.getColor('SUCCESS') || '#28a745' : themeManager.getColor('BORDER') || '#ddd'};
        border: none;
        border-radius: 14px;
        cursor: ${this.state.disabled ? 'not-allowed' : 'pointer'};
        position: relative;
        transition: background 0.3s;
        opacity: ${this.state.disabled ? 0.6 : 1};
      }

      [role="switch"]::after {
        content: '';
        position: absolute;
        width: 24px;
        height: 24px;
        background: white;
        border-radius: 50%;
        top: 2px;
        left: ${this.state.checked ? '22px' : '2px'};
        transition: left 0.3s;
      }

      [role="switch"]:focus {
        outline: 2px solid ${themeManager.getColor('PRIMARY') || '#007bff'};
        outline-offset: 2px;
      }

      label {
        font-size: ${themeManager.getFontSize('MD')};
        color: ${themeManager.getColor('TEXT') || '#333'};
        cursor: ${this.state.disabled ? 'not-allowed' : 'pointer'};
        user-select: none;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="toggle-wrapper">
        <div
          role="switch"
          aria-checked="${this.state.checked}"
          aria-disabled="${this.state.disabled}"
          tabindex="0"
        ></div>
        ${this.state.label ? `<label>${this.state.label}</label>` : ''}
      </div>
    `;

    this.switchElement = this.shadowRootInternal.querySelector('[role="switch"]');

    if (this.switchElement && !this.state.disabled) {
      this.switchElement.addEventListener('click', () => this.toggle());
      this.switchElement.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === ' ' || (e as KeyboardEvent).key === 'Enter') {
          e.preventDefault();
          this.toggle();
        }
      });
    }
  }
}

customElements.define('ui-toggle', UiToggle);

declare global {
  interface HTMLElementTagNameMap {
    'ui-toggle': UiToggle;
  }
}

export { UiToggle };
