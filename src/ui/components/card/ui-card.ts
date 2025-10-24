/**
 * ui-card: A card container component for grouping content.
 */

import { ICardElement, CardState, CardVariant } from './ui-card.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiCard extends HTMLElement implements ICardElement {
  private shadowRootInternal: ShadowRoot;

  private state: CardState = {
    cardTitle: undefined,
    cardSubtitle: undefined,
    variant: 'default',
    disabled: false,
    clickable: false,
    href: undefined,
  };

  static get observedAttributes(): string[] {
    return ['cardTitle', 'cardSubtitle', 'variant', 'disabled', 'clickable', 'href'];
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
      case 'cardTitle':
        this.state.cardTitle = newValue ?? undefined;
        break;
      case 'cardSubtitle':
        this.state.cardSubtitle = newValue ?? undefined;
        break;
      case 'variant':
        if (['default', 'elevated', 'outlined', 'filled'].includes(newValue || '')) {
          this.state.variant = newValue as CardVariant;
        }
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'clickable':
        this.state.clickable = newValue !== null;
        break;
      case 'href':
        this.state.href = newValue ?? undefined;
        break;
    }

    this.render();
  }

  get cardTitle(): string | undefined {
    return this.state.cardTitle;
  }

  set cardTitle(val: string | undefined) {
    this.state.cardTitle = val;
    if (val) {
      this.setAttribute('cardTitle', val);
    } else {
      this.removeAttribute('cardTitle');
    }
    this.render();
  }

  get cardSubtitle(): string | undefined {
    return this.state.cardSubtitle;
  }

  set cardSubtitle(val: string | undefined) {
    this.state.cardSubtitle = val;
    if (val) {
      this.setAttribute('cardSubtitle', val);
    } else {
      this.removeAttribute('cardSubtitle');
    }
    this.render();
  }

  get variant(): CardVariant {
    return this.state.variant;
  }

  set variant(val: CardVariant) {
    this.state.variant = val;
    this.setAttribute('variant', val);
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

  get clickable(): boolean {
    return this.state.clickable;
  }

  set clickable(val: boolean) {
    this.state.clickable = val;
    if (val) {
      this.setAttribute('clickable', '');
    } else {
      this.removeAttribute('clickable');
    }
    this.render();
  }

  get href(): string | undefined {
    return this.state.href;
  }

  set href(val: string | undefined) {
    this.state.href = val;
    if (val) {
      this.setAttribute('href', val);
    } else {
      this.removeAttribute('href');
    }
    this.render();
  }

  private getStyles(): string {
    let boxShadow = 'none';
    let border = 'none';
    let background = themeManager.getColor('SURFACE') || '#fff';

    switch (this.state.variant) {
      case 'elevated':
        boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        break;
      case 'outlined':
        border = `1px solid ${themeManager.getColor('BORDER') || '#ddd'}`;
        break;
      case 'filled':
        background = themeManager.getColor('SURFACE_LIGHT') || '#f5f5f5';
        break;
      case 'default':
      default:
        boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        break;
    }

    return `
      :host {
        display: block;
      }

      .card {
        background: ${background};
        border-radius: 8px;
        overflow: hidden;
        border: ${border};
        box-shadow: ${boxShadow};
        transition: all 0.2s ease;
      }

      :host([clickable]) .card {
        cursor: pointer;
      }

      :host([clickable]) .card:hover:not([data-disabled="true"]) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      :host([disabled]) .card {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .card-header {
        padding: ${themeManager.getSpacing('MD')};
        border-bottom: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
      }

      .card-header:empty {
        display: none;
      }

      .card-title {
        margin: 0;
        padding: 0;
        font-size: ${themeManager.getFontSize('LG')};
        font-weight: 600;
        color: ${themeManager.getColor('TEXT') || '#000'};
      }

      .card-subtitle {
        margin: ${themeManager.getSpacing('XS')} 0 0 0;
        padding: 0;
        font-size: ${themeManager.getFontSize('SM')};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
      }

      .card-content {
        padding: ${themeManager.getSpacing('MD')};
      }

      .card-content:empty {
        padding: 0;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const headerHtml = this.state.cardTitle || this.state.cardSubtitle
      ? `
        <div class="card-header">
          ${this.state.cardTitle ? `<h2 class="card-title">${this.escapeHtml(this.state.cardTitle)}</h2>` : ''}
          ${this.state.cardSubtitle ? `<h3 class="card-subtitle">${this.escapeHtml(this.state.cardSubtitle)}</h3>` : ''}
        </div>
      `
      : '';

    const rootElement = this.state.href && this.state.clickable ? 'a' : 'div';
    const href = this.state.href ? `href="${this.escapeHtml(this.state.href)}"` : '';
    const disabled = this.state.disabled ? 'data-disabled="true"' : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <${rootElement}
        class="card"
        ${href}
        ${disabled}
        role="${this.state.href ? 'link' : 'article'}"
      >
        ${headerHtml}
        <div class="card-content">
          <slot></slot>
        </div>
      </${rootElement}>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('ui-card', UiCard);

declare global {
  interface HTMLElementTagNameMap {
    'ui-card': UiCard;
  }
}

export { UiCard };
