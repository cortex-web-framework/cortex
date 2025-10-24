/**
 * ui-select: A customizable dropdown select component built with Web Components.
 * Supports single/multiple selection, search, keyboard navigation, and form integration.
 */

import {
  SelectOption,
  SelectChangeDetail,
  SelectState,
  ISelectElement,
} from './ui-select.types.js';
import { themeManager } from '../../theme/theme-manager.js';

/**
 * Select/Dropdown Web Component
 *
 * @element ui-select
 * @fires change - Emitted when selection changes
 * @fires open - Emitted when dropdown opens
 * @fires close - Emitted when dropdown closes
 *
 * @attr options - JSON string of options array
 * @attr value - Selected value(s)
 * @attr placeholder - Placeholder text
 * @attr label - Label text
 * @attr disabled - Disabled state
 * @attr required - Required validation
 * @attr multiple - Multiple selection mode
 * @attr searchable - Enable search
 * @attr name - Form field name
 */
class UiSelect extends HTMLElement implements ISelectElement {
  private shadowRootInternal: ShadowRoot;
  private buttonElement: HTMLButtonElement | null = null;
  private listboxElement: HTMLElement | null = null;
  private searchInputElement: HTMLInputElement | null = null;

  private state: SelectState = {
    options: [],
    value: null,
    placeholder: 'Select an option',
    multiple: false,
    disabled: false,
    required: false,
    searchable: false,
    name: '',
    isOpen: false,
    isFocused: false,
    highlightedIndex: -1,
    searchQuery: '',
    isValid: true,
  };

  static get observedAttributes(): string[] {
    return ['options', 'value', 'placeholder', 'label', 'disabled', 'required', 'multiple', 'searchable', 'name'];
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
      case 'placeholder':
        this.state.placeholder = newValue || 'Select an option';
        break;
      case 'label':
        this.state.label = newValue || undefined;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'required':
        this.state.required = newValue !== null;
        break;
      case 'multiple':
        this.state.multiple = newValue !== null;
        break;
      case 'searchable':
        this.state.searchable = newValue !== null;
        break;
      case 'name':
        this.state.name = newValue ?? '';
        break;
    }

    this.render();
  }

  /** Property: options */
  get options(): SelectOption[] {
    return this.state.options;
  }

  set options(val: SelectOption[]) {
    this.state.options = val;
    this.setAttribute('options', JSON.stringify(val));
    this.render();
  }

  /** Property: value */
  get value(): string | string[] | null {
    return this.state.value;
  }

  set value(val: string | string[] | null) {
    this.state.value = val;
    if (val === null) {
      this.removeAttribute('value');
    } else {
      this.setAttribute('value', Array.isArray(val) ? val.join(',') : val);
    }
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

  /** Property: multiple */
  get multiple(): boolean {
    return this.state.multiple;
  }

  set multiple(val: boolean) {
    this.state.multiple = val;
    if (val) {
      this.setAttribute('multiple', '');
    } else {
      this.removeAttribute('multiple');
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
  }

  /** Property: searchable */
  get searchable(): boolean {
    return this.state.searchable;
  }

  set searchable(val: boolean) {
    this.state.searchable = val;
    if (val) {
      this.setAttribute('searchable', '');
    } else {
      this.removeAttribute('searchable');
    }
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

  /** Property: isOpen (read-only) */
  get isOpen(): boolean {
    return this.state.isOpen;
  }

  /** Property: highlightedIndex (read-only) */
  get highlightedIndex(): number {
    return this.state.highlightedIndex;
  }

  /** Property: validationMessage */
  get validationMessage(): string {
    if (this.state.isValid) return '';
    if (this.state.required && !this.state.value) {
      return 'This field is required.';
    }
    return 'Invalid selection.';
  }

  /** Method: open */
  open(): void {
    this.state.isOpen = true;
    this.state.highlightedIndex = 0;
    this.render();

    this.dispatchEvent(
      new CustomEvent('open', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /** Method: close */
  close(): void {
    this.state.isOpen = false;
    this.state.searchQuery = '';
    this.render();

    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /** Method: toggle */
  toggle(): void {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /** Method: focus */
  focus(): void {
    this.buttonElement?.focus();
  }

  /** Method: blur */
  blur(): void {
    this.buttonElement?.blur();
  }

  /** Method: clearSelection */
  clearSelection(): void {
    this.value = this.state.multiple ? [] : null;
    this.render();
  }

  /** Method: toggleOption */
  toggleOption(value: string): void {
    if (!this.state.multiple) return;

    const current = Array.isArray(this.state.value) ? this.state.value : [];
    const index = current.indexOf(value);

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }

    this.value = current;
  }

  /** Method: search */
  search(query: string): void {
    this.state.searchQuery = query.toLowerCase();
    this.render();
  }

  /** Method: checkValidity */
  checkValidity(): boolean {
    this.validate();
    return this.state.isValid;
  }

  /** Method: getButtonElement (for testing) */
  getButtonElement(): HTMLButtonElement | null {
    return this.buttonElement;
  }

  /** Method: getListboxElement (for testing) */
  getListboxElement(): HTMLElement | null {
    return this.listboxElement;
  }

  private setupEventListeners(): void {
    if (!this.buttonElement) return;

    this.buttonElement.addEventListener('click', this.handleButtonClick.bind(this));
    this.buttonElement.addEventListener('keydown', this.handleKeyDown.bind(this));

    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  private removeEventListeners(): void {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  private handleButtonClick(event: Event): void {
    event.stopPropagation();
    this.toggle();
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
      return;
    }

    if (!this.state.isOpen && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.open();
      return;
    }

    if (this.state.isOpen) {
      this.handleOpenKeyDown(event);
    }
  }

  private handleOpenKeyDown(event: KeyboardEvent): void {
    const visibleOptions = this.getVisibleOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.state.highlightedIndex = Math.min(this.state.highlightedIndex + 1, visibleOptions.length - 1);
        this.render();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.state.highlightedIndex = Math.max(this.state.highlightedIndex - 1, 0);
        this.render();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.state.highlightedIndex >= 0 && this.state.highlightedIndex < visibleOptions.length) {
          this.selectOption(visibleOptions[this.state.highlightedIndex]);
          if (!this.state.multiple) {
            this.close();
          }
        }
        break;
    }
  }

  private handleDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.contains(target) && this.state.isOpen) {
      this.close();
    }
  }

  private selectOption(option: SelectOption): void {
    if (this.state.multiple) {
      this.toggleOption(option.value);
    } else {
      this.value = option.value;
    }

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: this.state.value,
          label: option.label,
          previousValue: this.state.value,
        } as SelectChangeDetail,
        bubbles: true,
        composed: true,
      })
    );
  }

  private getVisibleOptions(): SelectOption[] {
    if (!this.state.searchQuery) {
      return this.state.options;
    }

    return this.state.options.filter((opt) =>
      opt.label.toLowerCase().includes(this.state.searchQuery)
    );
  }

  private validate(): void {
    if (this.state.required && !this.state.value) {
      this.state.isValid = false;
    } else {
      this.state.isValid = true;
    }
  }

  private getSelectedLabel(): string {
    if (!this.state.value) {
      return this.state.placeholder;
    }

    if (this.state.multiple && Array.isArray(this.state.value)) {
      if (this.state.value.length === 0) {
        return this.state.placeholder;
      }
      if (this.state.value.length === 1) {
        const firstValue = this.state.value[0];
        const option = this.state.options.find((o) => o.value === firstValue);
        return option?.label || firstValue;
      }
      return `${this.state.value.length} selected`;
    }

    const valueStr = typeof this.state.value === 'string' ? this.state.value : '';
    const option = this.state.options.find((o) => o.value === valueStr);
    return option?.label || valueStr || this.state.placeholder;
  }

  private getSelectStyles(): string {
    const borderColor = this.state.isFocused
      ? themeManager.getColor('PRIMARY') || '#007bff'
      : themeManager.getColor('BORDER') || '#ddd';

    return `
      :host {
        display: block;
        font-family: inherit;
      }

      .select-wrapper {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('SM')};
      }

      label {
        font-weight: 600;
        font-size: ${themeManager.getFontSize('SM')};
        color: ${themeManager.getColor('TEXT') || '#333'};
      }

      button {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${themeManager.getSpacing('MD')} ${themeManager.getSpacing('LG')};
        border: 1px solid ${borderColor};
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        background: white;
        cursor: pointer;
        font-size: ${themeManager.getFontSize('MD')};
        color: ${themeManager.getColor('TEXT') || '#333'};
        transition: all 0.2s;
      }

      button:hover {
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      button:focus {
        outline: none;
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .listbox {
        display: ${this.state.isOpen ? 'block' : 'none'};
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        border: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
        border-top: none;
        border-radius: 0 0 ${themeManager.getBorderRadius('MD') || '4px'} ${themeManager.getBorderRadius('MD') || '4px'};
        background: white;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
      }

      .search-input {
        padding: ${themeManager.getSpacing('MD')} ${themeManager.getSpacing('LG')};
        border-bottom: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
        font-size: ${themeManager.getFontSize('MD')};
        width: 100%;
        box-sizing: border-box;
      }

      [role="option"] {
        padding: ${themeManager.getSpacing('MD')} ${themeManager.getSpacing('LG')};
        cursor: pointer;
        user-select: none;
        display: ${this.state.searchQuery && !this.matchesSearch ? 'none' : 'block'};
      }

      [role="option"]:hover,
      [role="option"].highlighted {
        background: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f5f5f5'};
      }

      [role="option"].selected {
        background: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f5f5f5'};
        font-weight: 600;
        color: ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      [role="option"].hidden {
        display: none;
      }

      .error-message {
        display: ${this.state.isValid ? 'none' : 'block'};
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
        font-size: ${themeManager.getFontSize('SM')};
        margin-top: ${themeManager.getSpacing('XS')};
      }
    `;
  }

  private matchesSearch = false;

  private render(): void {
    if (!this.shadowRootInternal) return;

    const visibleOptions = this.getVisibleOptions();
    const labelId = `label-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `error-${Math.random().toString(36).substr(2, 9)}`;

    const optionsHtml = visibleOptions
      .map((option, index) => {
        const isSelected = this.state.multiple
          ? Array.isArray(this.state.value) && this.state.value.includes(option.value)
          : this.state.value === option.value;

        const isHighlighted = index === this.state.highlightedIndex;

        return `
          <div
            role="option"
            aria-selected="${isSelected}"
            class="${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}"
            data-value="${option.value}"
          >
            ${option.label}
          </div>
        `;
      })
      .join('');

    this.shadowRootInternal.innerHTML = `
      <style>${this.getSelectStyles()}</style>
      <div class="select-wrapper">
        ${
          this.state.label
            ? `<label id="${labelId}">${this.state.label}${this.state.required ? '<span style="color: red;">*</span>' : ''}</label>`
            : ''
        }
        <button
          ${this.state.disabled ? 'disabled' : ''}
          aria-haspopup="listbox"
          aria-expanded="${this.state.isOpen}"
          aria-labelledby="${this.state.label ? labelId : ''}"
          aria-required="${this.state.required}"
        >
          <span>${this.getSelectedLabel()}</span>
          <span style="margin-left: 8px;">▼</span>
        </button>
        <div class="listbox" role="listbox">
          ${
            this.state.searchable
              ? `<input type="text" class="search-input" placeholder="Search..." value="${this.state.searchQuery}">`
              : ''
          }
          ${optionsHtml}
        </div>
      </div>
      ${
        !this.state.isValid
          ? `<div class="error-message" id="${errorId}" role="alert">${this.validationMessage}</div>`
          : ''
      }
    `;

    // Cache references
    this.buttonElement = this.shadowRootInternal.querySelector('button');
    this.listboxElement = this.shadowRootInternal.querySelector('[role="listbox"]');
    this.searchInputElement = this.shadowRootInternal.querySelector('.search-input');

    // Attach event listeners
    this.setupOptionListeners();
    this.setupSearchListener();

    // Update class
    if (this.state.isValid) {
      this.classList.remove('error');
    } else {
      this.classList.add('error');
    }
  }

  private setupOptionListeners(): void {
    const options = this.shadowRootInternal?.querySelectorAll('[role="option"]');
    if (!options) return;

    options.forEach((option) => {
      option.addEventListener('click', () => {
        const value = (option as HTMLElement).getAttribute('data-value');
        if (value) {
          const selectedOption = this.state.options.find((o) => o.value === value);
          if (selectedOption) {
            this.selectOption(selectedOption);
            if (!this.state.multiple) {
              this.close();
            }
          }
        }
      });
    });
  }

  private setupSearchListener(): void {
    if (!this.searchInputElement) return;

    this.searchInputElement.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      this.search(target.value);
    });
  }
}

// Register the custom element
customElements.define('ui-select', UiSelect);

// Export for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'ui-select': UiSelect;
  }
}

export { UiSelect };
