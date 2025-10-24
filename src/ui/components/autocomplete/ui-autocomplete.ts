/**
 * ui-autocomplete: A searchable input with autocomplete suggestions.
 */

import { AutocompleteState, IAutocompleteElement, AutocompleteOption } from './ui-autocomplete.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiAutocomplete extends HTMLElement implements IAutocompleteElement {
  private shadowRootInternal: ShadowRoot;
  private inputElement: HTMLInputElement | null = null;

  private state: AutocompleteState = {
    options: [],
    value: null,
    placeholder: 'Search...',
    name: '',
    required: false,
    disabled: false,
    minChars: 1,
    maxResults: 10,
    isOpen: false,
    searchQuery: '',
    filteredOptions: [],
    highlightedIndex: -1,
    isValid: true,
  };

  static get observedAttributes(): string[] {
    return ['value', 'placeholder', 'label', 'name', 'required', 'disabled', 'minChars', 'maxResults'];
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
        this.state.value = newValue;
        break;
      case 'placeholder':
        this.state.placeholder = newValue ?? 'Search...';
        break;
      case 'label':
        this.state.label = newValue ?? undefined;
        break;
      case 'name':
        this.state.name = newValue ?? '';
        break;
      case 'required':
        this.state.required = newValue !== null;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'minChars':
        this.state.minChars = newValue ? parseInt(newValue, 10) : 1;
        break;
      case 'maxResults':
        this.state.maxResults = newValue ? parseInt(newValue, 10) : 10;
        break;
    }

    this.render();
  }

  get options(): AutocompleteOption[] {
    return this.state.options;
  }

  set options(val: AutocompleteOption[]) {
    this.state.options = val;
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

  get name(): string {
    return this.state.name;
  }

  set name(val: string) {
    this.state.name = val;
    this.setAttribute('name', val);
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

  get minChars(): number {
    return this.state.minChars;
  }

  set minChars(val: number) {
    this.state.minChars = val;
    this.setAttribute('minChars', String(val));
  }

  get maxResults(): number {
    return this.state.maxResults;
  }

  set maxResults(val: number) {
    this.state.maxResults = val;
    this.setAttribute('maxResults', String(val));
  }

  get isOpen(): boolean {
    return this.state.isOpen;
  }

  get filteredOptions(): AutocompleteOption[] {
    return this.state.filteredOptions;
  }

  get highlightedIndex(): number {
    return this.state.highlightedIndex;
  }

  get validationMessage(): string {
    if (this.state.isValid) return '';
    if (this.state.required && !this.state.value) {
      return 'Please select an option.';
    }
    return 'Invalid selection.';
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

  search(query: string): void {
    this.state.searchQuery = query;

    if (query.length < this.state.minChars) {
      this.state.filteredOptions = [];
      this.state.isOpen = false;
    } else {
      const queryLower = query.toLowerCase();
      this.state.filteredOptions = this.state.options
        .filter((opt) => opt.label.toLowerCase().includes(queryLower))
        .slice(0, this.state.maxResults);
      this.state.isOpen = this.state.filteredOptions.length > 0;
    }

    this.state.highlightedIndex = -1;
    this.render();
  }

  private validate(): void {
    if (this.state.required && !this.state.value) {
      this.state.isValid = false;
    } else {
      this.state.isValid = true;
    }
  }

  private setupEventListeners(): void {
    if (!this.inputElement) return;

    this.inputElement.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.search(target.value);

      this.dispatchEvent(
        new CustomEvent('input', {
          detail: { value: target.value },
          bubbles: true,
          composed: true,
        })
      );
    });

    this.inputElement.addEventListener('keydown', (e) => {
      const event = e as KeyboardEvent;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.state.highlightedIndex = Math.min(
            this.state.highlightedIndex + 1,
            this.state.filteredOptions.length - 1
          );
          this.render();
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.state.highlightedIndex = Math.max(this.state.highlightedIndex - 1, -1);
          this.render();
          break;
        case 'Enter':
          event.preventDefault();
          if (
            this.state.highlightedIndex >= 0 &&
            this.state.highlightedIndex < this.state.filteredOptions.length
          ) {
            const option = this.state.filteredOptions[this.state.highlightedIndex];
            this.value = option.value;
            if (this.inputElement) {
              this.inputElement.value = option.label;
            }
            this.state.isOpen = false;
            this.render();
          }
          break;
        case 'Escape':
          event.preventDefault();
          this.state.isOpen = false;
          this.render();
          break;
      }
    });

    this.inputElement.addEventListener('focus', () => {
      if (this.state.searchQuery.length >= this.state.minChars) {
        this.state.isOpen = true;
        this.render();
      }
    });
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
      }

      .autocomplete-wrapper {
        position: relative;
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
      }

      [role="listbox"] {
        display: ${this.state.isOpen ? 'block' : 'none'};
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
        border-top: none;
        border-radius: 0 0 ${themeManager.getBorderRadius('MD') || '4px'} ${themeManager.getBorderRadius('MD') || '4px'};
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        margin-top: -1px;
      }

      [role="option"] {
        padding: ${themeManager.getSpacing('MD')} ${themeManager.getSpacing('LG')};
        cursor: pointer;
        user-select: none;
        border-bottom: 1px solid ${themeManager.getColor('BORDER_LIGHT') || '#f0f0f0'};
      }

      [role="option"]:hover,
      [role="option"][aria-selected="true"] {
        background: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f5f5f5'};
      }

      [role="option"].highlighted {
        background: ${themeManager.getColor('PRIMARY_LIGHT') || '#e7f3ff'};
      }

      .option-label {
        font-weight: 500;
        color: ${themeManager.getColor('TEXT') || '#333'};
      }

      .option-description {
        font-size: ${themeManager.getFontSize('XS')};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
        margin-top: 2px;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const labelId = `label-${Math.random().toString(36).substr(2, 9)}`;

    const optionsHtml = this.state.filteredOptions
      .map((option, index) => {
        const isHighlighted = index === this.state.highlightedIndex;

        return `
          <button
            role="option"
            class="${isHighlighted ? 'highlighted' : ''}"
            data-value="${option.value}"
          >
            <div class="option-label">${option.label}</div>
            ${option.description ? `<div class="option-description">${option.description}</div>` : ''}
          </button>
        `;
      })
      .join('');

    const selectedLabel = this.state.value
      ? this.state.options.find((opt) => opt.value === this.state.value)?.label || ''
      : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="autocomplete-wrapper">
        ${this.state.label ? `<label id="${labelId}">${this.state.label}${this.state.required ? '<span style="color: red;">*</span>' : ''}</label>` : ''}
        <input
          type="text"
          placeholder="${this.state.placeholder}"
          value="${this.state.value ? selectedLabel : this.state.searchQuery}"
          ${this.state.disabled ? 'disabled' : ''}
          aria-labelledby="${this.state.label ? labelId : ''}"
          aria-autocomplete="list"
          aria-expanded="${this.state.isOpen}"
          aria-controls="autocomplete-list"
        >
        <div role="listbox" id="autocomplete-list">
          ${optionsHtml}
        </div>
      </div>
    `;

    this.inputElement = this.shadowRootInternal.querySelector('input');
    this.setupEventListeners();

    const buttons = this.shadowRootInternal.querySelectorAll('[role="option"]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = (btn as HTMLElement).getAttribute('data-value');
        if (value) {
          const option = this.state.options.find((opt) => opt.value === value);
          if (option) {
            this.value = value;
            this.inputElement!.value = option.label;
            this.state.isOpen = false;
            this.render();
          }
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (this.state.isOpen && !this.contains(e.target as Node)) {
        this.state.isOpen = false;
        this.render();
      }
    });
  }
}

customElements.define('ui-autocomplete', UiAutocomplete);

declare global {
  interface HTMLElementTagNameMap {
    'ui-autocomplete': UiAutocomplete;
  }
}

export { UiAutocomplete };
