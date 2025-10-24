/**
 * ui-radio: A radio button group component.
 */

import { RadioState, IRadioElement, RadioOption } from './ui-radio.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiRadio extends HTMLElement implements IRadioElement {
  private shadowRootInternal: ShadowRoot;
  private state: RadioState = {
    options: [],
    value: null,
    required: false,
    disabled: false,
    name: '',
    isValid: true,
  };

  static get observedAttributes(): string[] {
    return ['options', 'value', 'label', 'required', 'disabled', 'name'];
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
      case 'options':
        try {
          this.state.options = newValue ? JSON.parse(newValue) : [];
        } catch {
          this.state.options = [];
        }
        break;
      case 'value':
        this.state.value = newValue;
        break;
      case 'label':
        this.state.label = newValue || undefined;
        break;
      case 'required':
        this.state.required = newValue !== null;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'name':
        this.state.name = newValue ?? '';
        break;
    }

    this.render();
  }

  get options(): RadioOption[] {
    return this.state.options;
  }

  set options(val: RadioOption[]) {
    this.state.options = val;
    this.setAttribute('options', JSON.stringify(val));
    this.render();
  }

  get value(): string | null {
    return this.state.value;
  }

  set value(val: string | null) {
    this.state.value = val;
    if (val) {
      this.setAttribute('value', val);
    } else {
      this.removeAttribute('value');
    }
    this.render();

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: val },
        bubbles: true,
        composed: true,
      })
    );
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

  get name(): string {
    return this.state.name;
  }

  set name(val: string) {
    this.state.name = val;
    this.setAttribute('name', val);
  }

  get validationMessage(): string {
    if (this.state.isValid) return '';
    if (this.state.required && !this.state.value) {
      return 'Please select an option.';
    }
    return 'Invalid selection.';
  }

  focus(): void {
    const first = this.shadowRootInternal.querySelector('[role="radio"]');
    (first as HTMLElement)?.focus();
  }

  blur(): void {
    const focused = this.shadowRootInternal.querySelector('[role="radio"]:focus');
    (focused as HTMLElement)?.blur();
  }

  checkValidity(): boolean {
    this.validate();
    return this.state.isValid;
  }

  private validate(): void {
    if (this.state.required && !this.state.value) {
      this.state.isValid = false;
    } else {
      this.state.isValid = true;
    }
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
      }

      .radio-group {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('SM')};
      }

      .radio-option {
        display: flex;
        align-items: center;
        gap: ${themeManager.getSpacing('SM')};
        cursor: pointer;
        user-select: none;
      }

      .radio-option[aria-disabled="true"] {
        opacity: 0.6;
        pointer-events: none;
      }

      [role="radio"] {
        width: 20px;
        height: 20px;
        border: 2px solid ${themeManager.getColor('BORDER') || '#ddd'};
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      [role="radio"]:focus {
        outline: 2px solid ${themeManager.getColor('PRIMARY') || '#007bff'};
        outline-offset: 2px;
      }

      [role="radio"][aria-checked="true"] {
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      [role="radio"][aria-checked="true"]::after {
        content: '';
        width: 8px;
        height: 8px;
        background: ${themeManager.getColor('PRIMARY') || '#007bff'};
        border-radius: 50%;
      }

      label {
        font-size: ${themeManager.getFontSize('MD')};
        color: ${themeManager.getColor('TEXT') || '#333'};
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const groupId = `group-${Math.random().toString(36).substr(2, 9)}`;

    const optionsHtml = this.state.options
      .map((option) => {
        const isSelected = this.state.value === option.value;
        const isDisabled = this.state.disabled || option.disabled;

        return `
          <div class="radio-option" aria-disabled="${isDisabled}">
            <div
              role="radio"
              aria-checked="${isSelected}"
              aria-disabled="${isDisabled}"
              data-value="${option.value}"
              tabindex="${isSelected ? 0 : -1}"
            ></div>
            <label>${option.label}</label>
          </div>
        `;
      })
      .join('');

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="radio-group" role="radiogroup" id="${groupId}">
        ${optionsHtml}
      </div>
    `;

    this.setupListeners();
  }

  private setupListeners(): void {
    const options = this.shadowRootInternal.querySelectorAll('[role="radio"]');

    options.forEach((option) => {
      option.addEventListener('click', () => {
        const value = (option as HTMLElement).getAttribute('data-value');
        if (value && !this.state.disabled) {
          this.value = value;
        }
      });

      option.addEventListener('keydown', (e) => {
        const event = e as KeyboardEvent;
        const options = Array.from(this.shadowRootInternal.querySelectorAll('[role="radio"]'));
        const currentIndex = options.indexOf(option);

        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % options.length;
          const nextValue = (options[nextIndex] as HTMLElement).getAttribute('data-value');
          if (nextValue && !this.state.disabled) {
            this.value = nextValue;
          }
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
          event.preventDefault();
          const prevIndex = (currentIndex - 1 + options.length) % options.length;
          const prevValue = (options[prevIndex] as HTMLElement).getAttribute('data-value');
          if (prevValue && !this.state.disabled) {
            this.value = prevValue;
          }
        }
      });
    });
  }
}

customElements.define('ui-radio', UiRadio);

declare global {
  interface HTMLElementTagNameMap {
    'ui-radio': UiRadio;
  }
}

export { UiRadio };
