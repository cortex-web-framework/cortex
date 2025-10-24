/**
 * ui-accordion: A collapsible accordion component with multiple item support.
 */

import { IAccordionElement, AccordionState, AccordionItem } from './ui-accordion.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiAccordion extends HTMLElement implements IAccordionElement {
  private shadowRootInternal: ShadowRoot;

  private state: AccordionState = {
    items: [],
    openItems: new Set(),
    allowMultiple: false,
    disabled: false,
  };

  static get observedAttributes(): string[] {
    return ['allowMultiple', 'disabled'];
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
      case 'allowMultiple':
        this.state.allowMultiple = newValue !== null;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
    }

    this.render();
  }

  get items(): AccordionItem[] {
    return this.state.items;
  }

  set items(val: AccordionItem[]) {
    this.state.items = val;
    this.state.openItems.clear();
    this.render();
  }

  get openItems(): Set<string> {
    return this.state.openItems;
  }

  get allowMultiple(): boolean {
    return this.state.allowMultiple;
  }

  set allowMultiple(val: boolean) {
    this.state.allowMultiple = val;
    if (val) {
      this.setAttribute('allowMultiple', '');
    } else {
      this.removeAttribute('allowMultiple');
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

  openItem(id: string): void {
    const item = this.state.items.find((i) => i.id === id);
    if (!item || item.disabled) return;

    if (!this.state.allowMultiple) {
      this.state.openItems.clear();
    }

    this.state.openItems.add(id);
    this.emitItemEvent('itemOpened', id);
    this.render();
  }

  closeItem(id: string): void {
    if (this.state.openItems.has(id)) {
      this.state.openItems.delete(id);
      this.emitItemEvent('itemClosed', id);
      this.render();
    }
  }

  toggleItem(id: string): void {
    if (this.state.openItems.has(id)) {
      this.closeItem(id);
    } else {
      this.openItem(id);
    }
  }

  closeAll(): void {
    if (this.state.openItems.size > 0) {
      this.state.openItems.clear();
      this.render();
    }
  }

  addItem(item: AccordionItem): void {
    this.state.items.push(item);
    this.render();
  }

  removeItem(id: string): void {
    const index = this.state.items.findIndex((i) => i.id === id);
    if (index >= 0) {
      this.state.items.splice(index, 1);
      this.state.openItems.delete(id);
      this.render();
    }
  }

  private emitItemEvent(eventName: string, id: string): void {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { id },
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

      .accordion {
        border: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
        border-radius: 4px;
        overflow: hidden;
      }

      .accordion-item {
        border-bottom: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
      }

      .accordion-item:last-child {
        border-bottom: none;
      }

      .accordion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: ${themeManager.getSpacing('MD')};
        background: ${themeManager.getColor('SURFACE') || '#fff'};
        color: ${themeManager.getColor('TEXT') || '#000'};
        border: none;
        cursor: pointer;
        font-size: ${themeManager.getFontSize('MD')};
        transition: all 0.2s ease;
        text-align: left;
        font-weight: 500;
      }

      .accordion-header:hover:not([aria-disabled="true"]) {
        background: ${themeManager.getColor('SURFACE_LIGHT') || '#f5f5f5'};
      }

      .accordion-header[aria-disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .accordion-header[aria-expanded="true"] {
        background: ${themeManager.getColor('SURFACE_LIGHT') || '#f5f5f5'};
      }

      .accordion-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-left: ${themeManager.getSpacing('SM')};
        transition: transform 0.2s ease;
        flex-shrink: 0;
      }

      .accordion-header[aria-expanded="true"] .accordion-icon {
        transform: rotate(180deg);
      }

      .accordion-panel {
        display: none;
        background: ${themeManager.getColor('SURFACE') || '#fff'};
        padding: ${themeManager.getSpacing('MD')};
        color: ${themeManager.getColor('TEXT') || '#000'};
        font-size: ${themeManager.getFontSize('SM')};
        line-height: 1.6;
      }

      .accordion-panel[aria-hidden="false"] {
        display: block;
      }

      :host([disabled]) .accordion-header {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    let itemsHtml = '';

    this.state.items.forEach((item: AccordionItem) => {
      const isOpen = this.state.openItems.has(item.id);
      const isDisabled = item.disabled || this.state.disabled;
      const panelId = `panel-${item.id}`;

      itemsHtml += `
        <div class="accordion-item">
          <button
            class="accordion-header"
            id="header-${item.id}"
            aria-expanded="${isOpen}"
            aria-disabled="${isDisabled}"
            aria-controls="${panelId}"
            ${isDisabled ? 'disabled' : ''}
            data-item-id="${item.id}"
          >
            <span>${this.escapeHtml(item.label)}</span>
            <span class="accordion-icon">▼</span>
          </button>
          <div
            id="${panelId}"
            class="accordion-panel"
            role="region"
            aria-labelledby="header-${item.id}"
            aria-hidden="${!isOpen}"
          >
            ${this.escapeHtml(item.content)}
          </div>
        </div>
      `;
    });

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="accordion" role="region" aria-label="Accordion">
        ${itemsHtml}
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const headers = this.shadowRootInternal?.querySelectorAll('.accordion-header');
    if (!headers) return;

    headers.forEach((header: Element) => {
      const btn = header as HTMLButtonElement;
      const itemId = btn.getAttribute('data-item-id');
      if (!itemId) return;

      btn.addEventListener('click', () => {
        if (!btn.hasAttribute('disabled')) {
          this.toggleItem(itemId);
        }
      });

      btn.addEventListener('keydown', (event: KeyboardEvent) => {
        const headerArray = Array.from(headers);
        const currentIndex = headerArray.indexOf(btn);

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            const nextIndex = (currentIndex + 1) % headerArray.length;
            (headerArray[nextIndex] as HTMLButtonElement).focus();
            break;

          case 'ArrowUp':
            event.preventDefault();
            const prevIndex = (currentIndex - 1 + headerArray.length) % headerArray.length;
            (headerArray[prevIndex] as HTMLButtonElement).focus();
            break;

          case 'Home':
            event.preventDefault();
            (headerArray[0] as HTMLButtonElement).focus();
            break;

          case 'End':
            event.preventDefault();
            (headerArray[headerArray.length - 1] as HTMLButtonElement).focus();
            break;

          case 'Enter':
          case ' ':
            event.preventDefault();
            if (!btn.hasAttribute('disabled')) {
              this.toggleItem(itemId);
            }
            break;
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

customElements.define('ui-accordion', UiAccordion);

declare global {
  interface HTMLElementTagNameMap {
    'ui-accordion': UiAccordion;
  }
}

export { UiAccordion };
