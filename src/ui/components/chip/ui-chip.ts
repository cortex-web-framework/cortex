/**
 * ui-chip: A compact labeled component for tags and selections.
 */

import { IChipElement, ChipState, ChipVariant } from './ui-chip.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiChip extends HTMLElement implements IChipElement {
  private shadowRootInternal: ShadowRoot;

  private state: ChipState = {
    label: '',
    variant: 'default',
    removable: false,
    disabled: false,
    selected: false,
  };

  static get observedAttributes(): string[] {
    return ['label', 'variant', 'removable', 'disabled', 'selected'];
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
      case 'label':
        this.state.label = newValue || '';
        break;
      case 'variant':
        if (['default', 'outlined', 'filled'].includes(newValue || '')) {
          this.state.variant = newValue as ChipVariant;
        }
        break;
      case 'removable':
        this.state.removable = newValue !== null;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'selected':
        this.state.selected = newValue !== null;
        break;
    }

    this.render();
  }

  get label(): string {
    return this.state.label;
  }

  set label(val: string) {
    this.state.label = val;
    this.setAttribute('label', val);
    this.render();
  }

  get variant(): ChipVariant {
    return this.state.variant;
  }

  set variant(val: ChipVariant) {
    this.state.variant = val;
    this.setAttribute('variant', val);
    this.render();
  }

  get removable(): boolean {
    return this.state.removable;
  }

  set removable(val: boolean) {
    this.state.removable = val;
    if (val) {
      this.setAttribute('removable', '');
    } else {
      this.removeAttribute('removable');
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

  get selected(): boolean {
    return this.state.selected;
  }

  set selected(val: boolean) {
    this.state.selected = val;
    if (val) {
      this.setAttribute('selected', '');
    } else {
      this.removeAttribute('selected');
    }
    this.render();
  }

  private getColorStyles(): { bg: string; text: string; border: string } {
    const primary = themeManager.getColor('PRIMARY') || '#007bff';

    switch (this.state.variant) {
      case 'outlined':
        return { bg: 'transparent', text: primary, border: primary };
      case 'filled':
        return { bg: primary, text: '#fff', border: primary };
      case 'default':
      default:
        return { bg: themeManager.getColor('SURFACE_LIGHT') || '#e9ecef', text: themeManager.getColor('TEXT') || '#000', border: 'transparent' };
    }
  }

  private getStyles(): string {
    const { bg, text, border } = this.getColorStyles();

    return `
      :host {
        display: inline-block;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        gap: ${themeManager.getSpacing('XS')};
        padding: 6px 12px;
        background: ${bg};
        color: ${text};
        border: 1px solid ${border};
        border-radius: 16px;
        font-size: ${themeManager.getFontSize('SM')};
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
      }

      .chip:hover:not([aria-disabled="true"]) {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .chip[aria-disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .chip[data-selected="true"] {
        background: ${themeManager.getColor('PRIMARY') || '#007bff'};
        color: #fff;
      }

      .chip-label {
        flex: 1;
      }

      .chip-remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        padding: 0;
        border: none;
        background: none;
        color: inherit;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
      }

      .chip-remove:hover {
        opacity: 0.7;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const removeBtn = this.state.removable
      ? `<button class="chip-remove" aria-label="Remove" type="button">×</button>`
      : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div
        class="chip"
        role="button"
        aria-disabled="${this.state.disabled}"
        data-selected="${this.state.selected}"
      >
        <span class="chip-label">${this.escapeHtml(this.state.label)}</span>
        ${removeBtn}
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const removeBtn = this.shadowRootInternal?.querySelector('.chip-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('remove', { bubbles: true, composed: true }));
      });
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('ui-chip', UiChip);

declare global {
  interface HTMLElementTagNameMap {
    'ui-chip': UiChip;
  }
}

export { UiChip };
