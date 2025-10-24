/**
 * ui-tabs: A tabbed interface component with keyboard navigation support.
 */

import { ITabsElement, TabsState, TabItem } from './ui-tabs.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiTabs extends HTMLElement implements ITabsElement {
  private shadowRootInternal: ShadowRoot;

  private state: TabsState = {
    tabs: [],
    activeTabId: null,
    variant: 'default',
    disabled: false,
  };

  static get observedAttributes(): string[] {
    return ['variant', 'disabled'];
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
      case 'variant':
        if (['default', 'pills', 'underline'].includes(newValue || '')) {
          this.state.variant = newValue as 'default' | 'pills' | 'underline';
        }
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
    }

    this.render();
  }

  get tabs(): TabItem[] {
    return this.state.tabs;
  }

  set tabs(val: TabItem[]) {
    this.state.tabs = val;
    // Set first tab as active if none selected
    if (val.length > 0 && !this.state.activeTabId) {
      this.state.activeTabId = val[0].id;
    }
    this.render();
  }

  get activeTabId(): string | null {
    return this.state.activeTabId;
  }

  set activeTabId(val: string | null) {
    this.state.activeTabId = val;
    this.render();
  }

  get variant(): 'default' | 'pills' | 'underline' {
    return this.state.variant;
  }

  set variant(val: 'default' | 'pills' | 'underline') {
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

  selectTab(id: string): void {
    const tab = this.state.tabs.find((t) => t.id === id);
    if (tab && !tab.disabled && !this.state.disabled) {
      this.state.activeTabId = id;
      this.render();

      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { activeTabId: id },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  addTab(tab: TabItem): void {
    if (!this.state.tabs.find((t) => t.id === tab.id)) {
      this.state.tabs = [...this.state.tabs, tab];
      if (!this.state.activeTabId && this.state.tabs.length === 1) {
        this.state.activeTabId = tab.id;
      }
      this.render();
    }
  }

  removeTab(id: string): void {
    const index = this.state.tabs.findIndex((t) => t.id === id);
    if (index >= 0) {
      this.state.tabs = this.state.tabs.filter((t) => t.id !== id);

      // If removed tab was active, select another
      if (this.state.activeTabId === id) {
        if (this.state.tabs.length > 0) {
          this.state.activeTabId = this.state.tabs[Math.max(0, index - 1)].id;
        } else {
          this.state.activeTabId = null;
        }
      }

      this.render();
    }
  }

  private setupEventListeners(): void {
    const tabList = this.shadowRootInternal.querySelector('[role="tablist"]');
    if (!tabList) return;

    const tabs = tabList.querySelectorAll('[role="tab"]');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const id = (tab as HTMLElement).getAttribute('data-tab-id');
        if (id) {
          this.selectTab(id);
        }
      });

      tab.addEventListener('keydown', (e) => {
        const event = e as KeyboardEvent;
        const tabElements = Array.from(tabs);
        const currentIndex = tabElements.indexOf(tab);

        switch (event.key) {
          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault();
            if (currentIndex > 0) {
              const prevTab = tabElements[currentIndex - 1] as HTMLElement;
              prevTab.click();
              prevTab.focus();
            }
            break;
          case 'ArrowRight':
          case 'ArrowDown':
            event.preventDefault();
            if (currentIndex < tabElements.length - 1) {
              const nextTab = tabElements[currentIndex + 1] as HTMLElement;
              nextTab.click();
              nextTab.focus();
            }
            break;
          case 'Home':
            event.preventDefault();
            const firstTab = tabElements[0] as HTMLElement;
            firstTab.click();
            firstTab.focus();
            break;
          case 'End':
            event.preventDefault();
            const lastTab = tabElements[tabElements.length - 1] as HTMLElement;
            lastTab.click();
            lastTab.focus();
            break;
        }
      });
    });
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
      }

      .tabs-container {
        display: flex;
        flex-direction: column;
      }

      [role="tablist"] {
        display: flex;
        border-bottom: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
        gap: 0;
      }

      .tablist-pills {
        border-bottom: none;
        gap: ${themeManager.getSpacing('SM')};
        padding: ${themeManager.getSpacing('SM')};
        background: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f5f5f5'};
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
      }

      .tablist-underline {
        border-bottom: 2px solid ${themeManager.getColor('BORDER') || '#ddd'};
        gap: ${themeManager.getSpacing('LG')};
      }

      [role="tab"] {
        padding: ${themeManager.getSpacing('MD')} ${themeManager.getSpacing('LG')};
        background: none;
        border: none;
        cursor: pointer;
        font-size: ${themeManager.getFontSize('MD')};
        font-weight: 500;
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
        transition: all 0.2s;
        position: relative;
        white-space: nowrap;
      }

      [role="tab"]:hover {
        color: ${themeManager.getColor('TEXT') || '#333'};
      }

      [role="tab"][aria-selected="true"] {
        color: ${themeManager.getColor('PRIMARY') || '#007bff'};
        border-bottom: 3px solid ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      .tablist-pills [role="tab"] {
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        border: none;
        background: white;
      }

      .tablist-pills [role="tab"][aria-selected="true"] {
        background: ${themeManager.getColor('PRIMARY') || '#007bff'};
        color: white;
        border: none;
      }

      .tablist-underline [role="tab"] {
        border-bottom: 3px solid transparent;
        padding: ${themeManager.getSpacing('MD')} 0;
        margin-bottom: -2px;
      }

      .tablist-underline [role="tab"][aria-selected="true"] {
        border-bottom: 3px solid ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      [role="tab"]:disabled,
      [role="tab"][aria-disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .tab-panels {
        padding: ${themeManager.getSpacing('LG')};
      }

      [role="tabpanel"] {
        display: none;
      }

      [role="tabpanel"][aria-hidden="false"] {
        display: block;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const tabsHtml = this.state.tabs
      .map(
        (tab) => `
      <button
        role="tab"
        data-tab-id="${tab.id}"
        aria-selected="${tab.id === this.state.activeTabId}"
        aria-disabled="${tab.disabled ? 'true' : 'false'}"
        ${tab.disabled ? 'disabled' : ''}
        ${this.state.disabled ? 'disabled' : ''}
      >
        ${tab.label}
      </button>
    `
      )
      .join('');

    const panelsHtml = this.state.tabs
      .map(
        (tab) => `
      <div
        role="tabpanel"
        id="panel-${tab.id}"
        aria-labelledby="tab-${tab.id}"
        aria-hidden="${tab.id !== this.state.activeTabId}"
      >
        <slot name="panel-${tab.id}"></slot>
      </div>
    `
      )
      .join('');

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>

      <div class="tabs-container">
        <div role="tablist" class="tablist-${this.state.variant}">
          ${tabsHtml}
        </div>
        <div class="tab-panels">
          ${panelsHtml}
        </div>
      </div>
    `;

    this.setupEventListeners();
  }
}

customElements.define('ui-tabs', UiTabs);

declare global {
  interface HTMLElementTagNameMap {
    'ui-tabs': UiTabs;
  }
}

export { UiTabs };
