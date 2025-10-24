/**
 * ui-checkbox Component Implementation
 * Zero Dependencies - Super Clean Code - Strict TypeScript
 */

interface CheckboxState {
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly indeterminate: boolean;
  readonly label: string;
  readonly value: string;
  readonly name: string;
}

export class UiCheckbox extends HTMLElement {
  private static readonly observedAttributes: readonly string[] = [
    'checked', 'disabled', 'indeterminate', 'label', 'value', 'name'
  ] as const;

  private state: CheckboxState = {
    checked: false,
    disabled: false,
    indeterminate: false,
    label: '',
    value: '',
    name: ''
  };

  private shadowRootInternal: ShadowRoot | null = null;

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes(): readonly string[] {
    return UiCheckbox.observedAttributes;
  }

  connectedCallback(): void {
    this.render();
    this.attachEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'checked':
        this.state = { ...this.state, checked: newValue !== null && newValue !== 'false' };
        break;
      case 'disabled':
        this.state = { ...this.state, disabled: newValue !== null && newValue !== 'false' };
        break;
      case 'indeterminate':
        this.state = { ...this.state, indeterminate: newValue !== null && newValue !== 'false' };
        break;
      case 'label':
        this.state = { ...this.state, label: newValue || '' };
        break;
      case 'value':
        this.state = { ...this.state, value: newValue || '' };
        break;
      case 'name':
        this.state = { ...this.state, name: newValue || '' };
        break;
    }
    this.render();
  }

  get checked(): boolean {
    return this.state.checked;
  }

  set checked(val: boolean) {
    this.state = { ...this.state, checked: val };
    if (val) {
      this.setAttribute('checked', '');
    } else {
      this.setAttribute('checked', 'false');
    }
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

  get indeterminate(): boolean {
    return this.state.indeterminate;
  }

  set indeterminate(val: boolean) {
    this.state = { ...this.state, indeterminate: val };
    if (val) {
      this.setAttribute('indeterminate', '');
    } else {
      this.removeAttribute('indeterminate');
    }
    this.render();
  }

  get label(): string {
    return this.state.label;
  }

  set label(val: string) {
    this.state = { ...this.state, label: val };
    this.setAttribute('label', val);
    this.render();
  }

  get value(): string {
    return this.state.value;
  }

  set value(val: string) {
    this.state = { ...this.state, value: val };
    this.setAttribute('value', val);
    this.render();
  }

  get name(): string {
    return this.state.name;
  }

  set name(val: string) {
    this.state = { ...this.state, name: val };
    this.setAttribute('name', val);
    this.render();
  }

  click(): void {
    if (!this.state.disabled) {
      this.toggle();
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

  toggle(): void {
    if (this.state.disabled) return;

    const newChecked = !this.state.checked;
    this.state = { ...this.state, checked: newChecked, indeterminate: false };
    
    this.dispatchEvent(new CustomEvent('change', {
      detail: { checked: newChecked, indeterminate: false },
      bubbles: true,
      composed: true
    }));
    
    this.render();
  }

  private getStyles(): string {
    return `
      :host {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        user-select: none;
      }
      :host([disabled]) {
        cursor: not-allowed;
        opacity: 0.6;
      }
      .checkbox-container {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .checkbox-input {
        position: relative;
        width: 18px;
        height: 18px;
        border: 2px solid var(--ui-color-border-default, #ddd);
        border-radius: 3px;
        background: var(--ui-color-background-default, #fff);
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
      .checkbox-input:hover:not([disabled]) {
        border-color: var(--ui-color-primary, #007bff);
      }
      .checkbox-input:focus {
        outline: 2px solid var(--ui-color-primary, #007bff);
        outline-offset: 2px;
      }
      .checkbox-input.checked {
        background-color: var(--ui-color-primary, #007bff);
        border-color: var(--ui-color-primary, #007bff);
      }
      .checkbox-input.indeterminate {
        background-color: var(--ui-color-primary, #007bff);
        border-color: var(--ui-color-primary, #007bff);
      }
      .checkbox-input.disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
      .checkbox-checkmark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .checkbox-input.checked .checkbox-checkmark {
        opacity: 1;
      }
      .checkbox-indeterminate {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 2px;
        background-color: white;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .checkbox-input.indeterminate .checkbox-indeterminate {
        opacity: 1;
      }
      .checkbox-label {
        font-size: var(--ui-font-size-md, 1rem);
        color: var(--ui-color-text-default, #000);
        cursor: pointer;
        line-height: 1.5;
      }
      :host([disabled]) .checkbox-label {
        color: var(--ui-color-text-disabled, #999);
        cursor: not-allowed;
      }
      .checkbox-input::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .checkbox-input.checked::before {
        opacity: 1;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const isChecked = this.state.checked;
    const isDisabled = this.state.disabled;
    const isIndeterminate = this.state.indeterminate;
    const hasLabel = this.state.label.length > 0;

    const inputClass = `checkbox-input${isChecked ? ' checked' : ''}${isIndeterminate ? ' indeterminate' : ''}${isDisabled ? ' disabled' : ''}`;
    const ariaChecked = isIndeterminate ? 'mixed' : isChecked ? 'true' : 'false';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="checkbox-container">
        <div 
          class="${inputClass}"
          role="checkbox"
          tabindex="${isDisabled ? '-1' : '0'}"
          aria-checked="${ariaChecked}"
          aria-disabled="${isDisabled}"
          ${isDisabled ? 'disabled' : ''}
        >
          <div class="checkbox-checkmark"></div>
          <div class="checkbox-indeterminate"></div>
        </div>
        ${hasLabel ? `<span class="checkbox-label">${this.escapeHtml(this.state.label)}</span>` : ''}
      </div>
    `;
  }

  private attachEventListeners(): void {
    const checkboxInput = this.shadowRootInternal?.querySelector('.checkbox-input') as HTMLElement;
    if (!checkboxInput) return;

    checkboxInput.addEventListener('click', (event) => {
      if (!this.state.disabled) {
        this.toggle();
      }
    });

    checkboxInput.addEventListener('focus', () => {
      this.dispatchEvent(new CustomEvent('focus', {
        bubbles: true,
        composed: true
      }));
    });

    checkboxInput.addEventListener('blur', () => {
      this.dispatchEvent(new CustomEvent('blur', {
        bubbles: true,
        composed: true
      }));
    });

    checkboxInput.addEventListener('keydown', (event) => {
      if (this.state.disabled) return;

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        this.toggle();
      }
    });

    // Handle label click
    const label = this.shadowRootInternal?.querySelector('.checkbox-label') as HTMLElement;
    if (label) {
      label.addEventListener('click', (event) => {
        if (!this.state.disabled) {
          event.preventDefault();
          this.toggle();
        }
      });
    }
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
  customElements.define('ui-checkbox', UiCheckbox);
}