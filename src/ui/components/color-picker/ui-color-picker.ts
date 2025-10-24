/**
 * ui-color-picker: A color selection component with hex and RGB format support.
 */

import { IColorPickerElement, ColorPickerState } from './ui-color-picker.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiColorPicker extends HTMLElement implements IColorPickerElement {
  private shadowRootInternal: ShadowRoot;
  private inputElement: HTMLInputElement | null = null;

  private state: ColorPickerState = {
    value: null,
    label: undefined,
    name: '',
    required: false,
    disabled: false,
    format: 'hex',
    isOpen: false,
    isValid: true,
  };

  static get observedAttributes(): string[] {
    return ['value', 'label', 'name', 'required', 'disabled', 'format'];
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
      case 'format':
        if (newValue === 'hex' || newValue === 'rgb') {
          this.state.format = newValue;
        }
        break;
    }

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

  get format(): 'hex' | 'rgb' {
    return this.state.format;
  }

  set format(val: 'hex' | 'rgb') {
    if (val === 'hex' || val === 'rgb') {
      const oldFormat = this.state.format;
      this.state.format = val;

      // Convert value if it exists
      if (this.state.value && oldFormat !== val) {
        this.state.value = this.convertColor(this.state.value, oldFormat, val);
      }

      this.setAttribute('format', val);
      this.render();
    }
  }

  get validationMessage(): string {
    if (this.state.isValid) return '';
    if (this.state.required && !this.state.value) {
      return 'Please select a color.';
    }
    return 'Invalid color.';
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

  private validate(): void {
    if (this.state.required && !this.state.value) {
      this.state.isValid = false;
    } else {
      this.state.isValid = true;
    }
  }

  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgb(${r}, ${g}, ${b})`;
    }
    return hex;
  }

  private rgbToHex(rgb: string): string {
    const match = rgb.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (match) {
      const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return rgb;
  }

  private convertColor(color: string, fromFormat: 'hex' | 'rgb', toFormat: 'hex' | 'rgb'): string {
    if (fromFormat === 'hex' && toFormat === 'rgb') {
      return this.hexToRgb(color);
    }
    if (fromFormat === 'rgb' && toFormat === 'hex') {
      return this.rgbToHex(color);
    }
    return color;
  }

  private setupEventListeners(): void {
    if (!this.inputElement) return;

    this.inputElement.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      let newValue = target.value;

      // Convert to desired format if needed
      if (this.state.format === 'rgb' && newValue.startsWith('#')) {
        newValue = this.hexToRgb(newValue);
      }

      this.state.value = newValue;

      this.dispatchEvent(
        new CustomEvent('input', {
          detail: { value: newValue },
          bubbles: true,
          composed: true,
        })
      );

      this.render();
    });

    this.inputElement.addEventListener('change', () => {
      this.validate();
      this.render();
    });
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
      }

      .color-wrapper {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('MD')};
      }

      label {
        font-weight: 600;
        font-size: ${themeManager.getFontSize('SM')};
        color: ${themeManager.getColor('TEXT') || '#333'};
      }

      .color-controls {
        display: flex;
        gap: ${themeManager.getSpacing('MD')};
        align-items: flex-end;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('SM')};
        flex: 1;
      }

      input[type="color"] {
        width: 60px;
        height: 50px;
        border: 2px solid ${themeManager.getColor('BORDER') || '#ddd'};
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        cursor: pointer;
        transition: border-color 0.2s;
      }

      input[type="color"]:focus {
        outline: none;
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
      }

      input[type="color"]:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .color-preview {
        width: 100%;
        height: 40px;
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        border: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
        background: linear-gradient(
          135deg,
          #ccc 25%,
          transparent 25%,
          transparent 75%,
          #ccc 75%,
          #ccc
        );
        background-size: 10px 10px;
        background-position: 0 0, 5px 5px;
        background-color: #f5f5f5;
        position: relative;
      }

      .color-preview::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
      }

      .color-display {
        font-size: ${themeManager.getFontSize('SM')};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
        padding: ${themeManager.getSpacing('SM')};
        background: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f5f5f5'};
        border-radius: ${themeManager.getBorderRadius('SM') || '2px'};
        font-family: monospace;
        word-break: break-all;
      }

      .error-message {
        font-size: ${themeManager.getFontSize('XS')};
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
        margin-top: ${themeManager.getSpacing('XS')};
      }

      :host([disabled]) input[type="color"] {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const labelId = `label-${Math.random().toString(36).substr(2, 9)}`;
    const previewColor = this.state.value || 'transparent';

    // For color preview, convert to hex if we have a value
    let previewHex = previewColor;
    if (previewColor && previewColor !== 'transparent' && previewColor.startsWith('rgb')) {
      previewHex = this.rgbToHex(previewColor);
    }

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="color-wrapper">
        ${this.state.label ? `<label id="${labelId}">${this.state.label}${this.state.required ? '<span style="color: red;">*</span>' : ''}</label>` : ''}
        <div class="color-controls">
          <div class="input-group">
            <input
              type="color"
              value="${previewHex.startsWith('#') ? previewHex : '#000000'}"
              ${this.state.disabled ? 'disabled' : ''}
              aria-labelledby="${this.state.label ? labelId : ''}"
              aria-required="${this.state.required}"
              aria-disabled="${this.state.disabled}"
            >
          </div>
          <div class="color-preview">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: inherit; background-color: ${previewHex.startsWith('#') ? previewHex : 'transparent'};"></div>
          </div>
        </div>
        ${this.state.value ? `<div class="color-display">${this.state.value}</div>` : ''}
        ${!this.state.isValid ? `<div class="error-message">${this.validationMessage}</div>` : ''}
      </div>
    `;

    this.inputElement = this.shadowRootInternal.querySelector('input[type="color"]');
    this.setupEventListeners();
  }
}

customElements.define('ui-color-picker', UiColorPicker);

declare global {
  interface HTMLElementTagNameMap {
    'ui-color-picker': UiColorPicker;
  }
}

export { UiColorPicker };
