/**
 * ui-accordion Component Implementation
 * Zero Dependencies - Super Clean Code - Strict TypeScript
 */

interface AccordionItem {
  readonly id: string;
  readonly label: string;
  readonly content: string;
  readonly disabled?: boolean;
}

interface AccordionState {
  readonly items: AccordionItem[];
  readonly openItems: Set<string>;
  readonly allowMultiple: boolean;
  readonly disabled: boolean;
}

export class UiAccordion extends HTMLElement {
  private static readonly observedAttributes: readonly string[] = ['allowMultiple', 'disabled'] as const;
  
  private state: AccordionState = {
    items: [],
    openItems: new Set<string>(),
    allowMultiple: false,
    disabled: false
  };

  private shadowRootInternal: ShadowRoot | null = null;

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes(): readonly string[] {
    return UiAccordion.observedAttributes;
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'allowMultiple':
        this.state = { ...this.state, allowMultiple: newValue !== null };
        break;
      case 'disabled':
        this.state = { ...this.state, disabled: newValue !== null };
        break;
    }
    this.render();
  }

  get items(): AccordionItem[] {
    return this.state.items;
  }

  set items(val: AccordionItem[]) {
    this.state = { ...this.state, items: val, openItems: new Set<string>() };
    this.render();
  }

  get openItems(): Set<string> {
    return this.state.openItems;
  }

  get allowMultiple(): boolean {
    return this.state.allowMultiple;
  }

  set allowMultiple(val: boolean) {
    this.state = { ...this.state, allowMultiple: val };
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
    this.state = { ...this.state, disabled: val };
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
    this.render();
  }

  openItem(id: string): void {
    const item = this.state.items.find(i => i.id === id);
    if (!item || item.disabled) return;

    if (!this.state.allowMultiple) {
      this.state = { ...this.state, openItems: new Set<string>() };
    }
    
    const newOpenItems = new Set(this.state.openItems);
    newOpenItems.add(id);
    this.state = { ...this.state, openItems: newOpenItems };
    
    this.emitItemEvent('itemOpened', id);
    this.render();
  }

  closeItem(id: string): void {
    if (this.state.openItems.has(id)) {
      const newOpenItems = new Set(this.state.openItems);
      newOpenItems.delete(id);
      this.state = { ...this.state, openItems: newOpenItems };
      
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
      this.state = { ...this.state, openItems: new Set<string>() };
      this.render();
    }
  }

  addItem(item: AccordionItem): void {
    const newItems = [...this.state.items, item];
    this.state = { ...this.state, items: newItems };
    this.render();
  }

  removeItem(id: string): void {
    const index = this.state.items.findIndex(i => i.id === id);
    if (index >= 0) {
      const newItems = [...this.state.items];
      newItems.splice(index, 1);
      const newOpenItems = new Set(this.state.openItems);
      newOpenItems.delete(id);
      this.state = { ...this.state, items: newItems, openItems: newOpenItems };
      this.render();
    }
  }

  private emitItemEvent(eventName: string, id: string): void {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail: { id },
      bubbles: true,
      composed: true
    }));
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
      }
      .accordion {
        border: 1px solid var(--ui-color-border-default, #ddd);
        border-radius: 4px;
        overflow: hidden;
      }
      .accordion-item {
        border-bottom: 1px solid var(--ui-color-border-default, #ddd);
      }
      .accordion-item:last-child {
        border-bottom: none;
      }
      .accordion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: var(--ui-spacing-md, 16px);
        background: var(--ui-color-background-default, #fff);
        color: var(--ui-color-text-default, #000);
        border: none;
        cursor: pointer;
        font-size: var(--ui-font-size-md, 1rem);
        transition: all 0.2s ease;
        text-align: left;
        font-weight: 500;
      }
      .accordion-header:hover:not([aria-disabled="true"]) {
        background: var(--ui-color-background-light, #f5f5f5);
      }
      .accordion-header[aria-disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .accordion-header[aria-expanded="true"] {
        background: var(--ui-color-background-light, #f5f5f5);
      }
      .accordion-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-left: var(--ui-spacing-sm, 12px);
        transition: transform 0.2s ease;
        flex-shrink: 0;
      }
      .accordion-header[aria-expanded="true"] .accordion-icon {
        transform: rotate(180deg);
      }
      .accordion-panel {
        display: none;
        background: var(--ui-color-background-default, #fff);
        padding: var(--ui-spacing-md, 16px);
        color: var(--ui-color-text-default, #000);
        font-size: var(--ui-font-size-sm, 0.875rem);
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
    this.state.items.forEach(item => {
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

    headers.forEach(header => {
      const btn = header as HTMLButtonElement;
      const itemId = btn.getAttribute('data-item-id');
      if (!itemId) return;

      btn.addEventListener('click', () => {
        if (!btn.hasAttribute('disabled')) {
          this.toggleItem(itemId);
        }
      });

      btn.addEventListener('keydown', (event) => {
        const headerArray = Array.from(headers) as HTMLButtonElement[];
        const currentIndex = headerArray.indexOf(btn);

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            const nextIndex = (currentIndex + 1) % headerArray.length;
            headerArray[nextIndex].focus();
            break;
          case 'ArrowUp':
            event.preventDefault();
            const prevIndex = (currentIndex - 1 + headerArray.length) % headerArray.length;
            headerArray[prevIndex].focus();
            break;
          case 'Home':
            event.preventDefault();
            headerArray[0].focus();
            break;
          case 'End':
            event.preventDefault();
            headerArray[headerArray.length - 1].focus();
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

// Register the component
if (typeof customElements !== 'undefined') {
  customElements.define('ui-accordion', UiAccordion);
}