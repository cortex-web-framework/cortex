/**
 * ui-tag: A tag/label component for categorization.
 */

import { ITagElement, TagState, TagVariant, TagSize } from './ui-tag.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiTag extends HTMLElement implements ITagElement {
  private shadowRootInternal: ShadowRoot;

  private state: TagState = {
    label: undefined,
    variant: 'default',
    size: 'medium',
    closable: false,
  };

  static get observedAttributes(): string[] {
    return ['label', 'variant', 'size', 'closable'];
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
        this.state.label = newValue ?? undefined;
        break;
      case 'variant':
        if (['default', 'primary', 'success', 'warning', 'error', 'info'].includes(newValue || '')) {
          this.state.variant = newValue as TagVariant;
        }
        break;
      case 'size':
        if (['small', 'medium', 'large'].includes(newValue || '')) {
          this.state.size = newValue as TagSize;
        }
        break;
      case 'closable':
        this.state.closable = newValue === 'true';
        break;
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

  get variant(): TagVariant {
    return this.state.variant;
  }

  set variant(val: TagVariant) {
    this.state.variant = val;
    this.setAttribute('variant', val);
    this.render();
  }

  get size(): TagSize {
    return this.state.size;
  }

  set size(val: TagSize) {
    this.state.size = val;
    this.setAttribute('size', val);
    this.render();
  }

  get closable(): boolean {
    return this.state.closable;
  }

  set closable(val: boolean) {
    this.state.closable = val;
    if (val) {
      this.setAttribute('closable', 'true');
    } else {
      this.removeAttribute('closable');
    }
    this.render();
  }

  private getColor(): string {
    const colors: Record<TagVariant, string> = {
      default: themeManager.getColor('TEXT') || '#666',
      primary: themeManager.getColor('PRIMARY') || '#007bff',
      success: themeManager.getColor('SUCCESS') || '#28a745',
      warning: themeManager.getColor('WARNING') || '#ffc107',
      error: themeManager.getColor('ERROR') || '#dc3545',
      info: themeManager.getColor('INFO') || '#17a2b8',
    };
    return colors[this.state.variant];
  }

  private getPadding(): string {
    const paddings: Record<TagSize, string> = {
      small: '4px 8px',
      medium: '6px 12px',
      large: '8px 14px',
    };
    return paddings[this.state.size];
  }

  private getFontSize(): string {
    const sizes: Record<TagSize, string> = {
      small: '12px',
      medium: '13px',
      large: '14px',
    };
    return sizes[this.state.size];
  }

  private getStyles(): string {
    const color = this.getColor();
    const bgColor = this.lightenColor(color, 85);

    return `
      :host {
        display: inline-block;
      }

      .tag {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: ${this.getPadding()};
        background: ${bgColor};
        color: ${color};
        border-radius: 12px;
        font-size: ${this.getFontSize()};
        font-weight: 500;
        white-space: nowrap;
      }

      .close-button {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0;
        font-size: inherit;
        display: flex;
        align-items: center;
      }

      .close-button:hover {
        opacity: 0.7;
      }
    `;
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const r = Math.min(255, (num >> 16) + amt);
    const g = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const b = Math.min(255, (num & 0x0000ff) + amt);
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const label = this.state.label || '';
    const closeBtn = this.state.closable ? '<button class="close-button">×</button>' : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="tag">
        <span>${label}</span>
        ${closeBtn}
      </div>
    `;

    const closeButton = this.shadowRoot?.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, detail: { label } }));
      });
    }
  }
}

customElements.define('ui-tag', UiTag);

declare global {
  interface HTMLElementTagNameMap {
    'ui-tag': UiTag;
  }
}

export { UiTag };
