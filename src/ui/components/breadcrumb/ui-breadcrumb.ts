/**
 * ui-breadcrumb: A breadcrumb navigation component for showing hierarchy.
 */

import { IBreadcrumbElement, BreadcrumbState, BreadcrumbItem } from './ui-breadcrumb.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiBreadcrumb extends HTMLElement implements IBreadcrumbElement {
  private shadowRootInternal: ShadowRoot;

  private state: BreadcrumbState = {
    items: [],
    disabled: false,
    separator: '/',
  };

  static get observedAttributes(): string[] {
    return ['disabled', 'separator'];
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
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'separator':
        this.state.separator = newValue || '/';
        break;
    }

    this.render();
  }

  get items(): BreadcrumbItem[] {
    return this.state.items;
  }

  set items(val: BreadcrumbItem[]) {
    this.state.items = val;
    // Mark last item as current
    this.state.items.forEach((item, idx) => {
      item.current = idx === this.state.items.length - 1;
    });
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

  get separator(): string {
    return this.state.separator;
  }

  set separator(val: string) {
    this.state.separator = val;
    this.setAttribute('separator', val);
    this.render();
  }

  addItem(item: BreadcrumbItem): void {
    // Mark previous current as not current
    if (this.state.items.length > 0) {
      this.state.items[this.state.items.length - 1].current = false;
    }
    // Mark new item as current
    item.current = true;
    this.state.items.push(item);
    this.render();
  }

  removeItem(index: number): void {
    if (index >= 0 && index < this.state.items.length) {
      this.state.items.splice(index, 1);
      // Ensure last item is current
      this.state.items.forEach((item, idx) => {
        item.current = idx === this.state.items.length - 1;
      });
      this.render();
    }
  }

  setCurrentItem(index: number): void {
    this.state.items.forEach((item, idx) => {
      item.current = idx === index;
    });
    this.render();
  }

  private emitNavigateEvent(href: string): void {
    this.dispatchEvent(
      new CustomEvent('navigate', {
        detail: { href },
        bubbles: true,
        composed: true,
      })
    );
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: ${themeManager.getSpacing('SM')};
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .breadcrumb-item {
        display: flex;
        align-items: center;
        gap: ${themeManager.getSpacing('SM')};
      }

      .breadcrumb-link {
        color: ${themeManager.getColor('PRIMARY') || '#007bff'};
        text-decoration: none;
        cursor: pointer;
        font-size: ${themeManager.getFontSize('SM')};
        transition: color 0.2s ease;
      }

      .breadcrumb-link:hover:not([aria-disabled="true"]) {
        color: ${themeManager.getColor('PRIMARY_DARK') || '#0056b3'};
        text-decoration: underline;
      }

      .breadcrumb-link[aria-disabled="true"] {
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .breadcrumb-text {
        color: ${themeManager.getColor('TEXT') || '#000'};
        font-size: ${themeManager.getFontSize('SM')};
      }

      .breadcrumb-text[aria-current="page"] {
        font-weight: 500;
        color: ${themeManager.getColor('TEXT') || '#000'};
      }

      .breadcrumb-separator {
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
        margin: 0 ${themeManager.getSpacing('XS')};
        user-select: none;
      }

      :host([disabled]) .breadcrumb-link {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      :host([disabled]) .breadcrumb-text {
        opacity: 0.5;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    let itemsHtml = '';

    this.state.items.forEach((item: BreadcrumbItem, idx: number) => {
      const isCurrent = item.current;
      const isDisabled = item.disabled || this.state.disabled;

      // Render separator (not after last item)
      if (idx > 0) {
        itemsHtml += `<span class="breadcrumb-separator" aria-hidden="true">${this.escapeHtml(this.state.separator)}</span>`;
      }

      // Render item
      itemsHtml += `<li class="breadcrumb-item" role="listitem">`;

      if (item.href && !isCurrent && !isDisabled) {
        itemsHtml += `
          <a
            class="breadcrumb-link"
            href="${this.escapeHtml(item.href)}"
            aria-disabled="false"
            data-href="${this.escapeHtml(item.href)}"
          >${this.escapeHtml(item.label)}</a>
        `;
      } else {
        itemsHtml += `
          <span
            class="breadcrumb-text"
            ${isCurrent ? 'aria-current="page"' : ''}
            ${isDisabled ? 'aria-disabled="true"' : ''}
          >${this.escapeHtml(item.label)}</span>
        `;
      }

      itemsHtml += `</li>`;
    });

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <nav class="breadcrumb" role="navigation" aria-label="Breadcrumb Navigation">
        ${itemsHtml}
      </nav>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const links = this.shadowRootInternal?.querySelectorAll('.breadcrumb-link');
    if (!links) return;

    links.forEach((link: Element) => {
      const a = link as HTMLAnchorElement;
      const href = a.getAttribute('data-href');

      a.addEventListener('click', (event: Event) => {
        event.preventDefault();
        if (href) {
          this.emitNavigateEvent(href);
        }
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('ui-breadcrumb', UiBreadcrumb);

declare global {
  interface HTMLElementTagNameMap {
    'ui-breadcrumb': UiBreadcrumb;
  }
}

export { UiBreadcrumb };
