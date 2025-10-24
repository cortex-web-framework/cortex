/**
 * ui-label: A form label component for associating labels with form inputs.
 * Supports required indicator and disabled state.
 */

import { LabelState, ILabelElement } from './ui-label.types.js';
import { themeManager } from '../../theme/theme-manager.js';

/**
 * Label Web Component
 *
 * @element ui-label
 *
 * @attr for - ID of associated form control
 * @attr required - Show required indicator
 * @attr disabled - Disabled state
 *
 * @slot default - Label text content
 */
class UiLabel extends HTMLElement implements ILabelElement {
  private shadowRootInternal: ShadowRoot;
  private labelElement: HTMLLabelElement | null = null;

  private state: LabelState = {
    for: '',
    required: false,
    disabled: false,
  };

  static get observedAttributes(): string[] {
    return ['for', 'required', 'disabled'];
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
      case 'for':
        this.state.for = newValue ?? '';
        break;
      case 'required':
        this.state.required = newValue !== null;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
    }

    this.render();
  }

  /** Property: for */
  get for(): string {
    return this.state.for;
  }

  set for(val: string) {
    this.state.for = val;
    this.setAttribute('for', val);
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

  /** Method: focus */
  focus(): void {
    this.labelElement?.focus();
  }

  /** Method: blur */
  blur(): void {
    this.labelElement?.blur();
  }

  private getLabelStyles(): string {
    return `
      :host {
        display: inline;
        font-family: inherit;
      }

      label {
        display: inline-block;
        font-size: ${themeManager.getFontSize('MD')};
        color: ${themeManager.getColor('TEXT') || '#333'};
        font-weight: 500;
        margin-bottom: ${themeManager.getSpacing('XS')};
        cursor: pointer;
        user-select: none;
        transition: color 0.2s;
      }

      label.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        color: ${themeManager.getColor('TEXT_LIGHT') || '#999'};
      }

      label:hover:not(.disabled) {
        color: ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      .required-indicator {
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
        margin-left: 2px;
        font-weight: 600;
      }

      ::slotted(*) {
        margin-right: 4px;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    this.shadowRootInternal.innerHTML = `
      <style>${this.getLabelStyles()}</style>
      <label ${this.state.for ? `for="${this.state.for}"` : ''} class="${this.state.disabled ? 'disabled' : ''}">
        <slot></slot>${this.state.required ? '<span class="required-indicator">*</span>' : ''}
      </label>
    `;

    // Cache reference
    this.labelElement = this.shadowRootInternal.querySelector('label');
  }
}

// Register the custom element
customElements.define('ui-label', UiLabel);

// Export for TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'ui-label': UiLabel;
  }
}

export { UiLabel };
