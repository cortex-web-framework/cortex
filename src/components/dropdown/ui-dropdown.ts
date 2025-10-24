/**
 * Dropdown Component with Flexible Positioning and Keyboard Navigation
 * NO external dependencies - pure TypeScript
 */

export class DropdownComponent extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private isOpen: boolean = false;
  private position: 'bottom' | 'top' | 'left' | 'right' = 'bottom';
  private trigger: HTMLElement | null = null;
  private menu: HTMLElement | null = null;
  private selectedValue: string = '';

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    this.setupEventListeners();
  }

  private parseAttributes() {
    const positionAttr = this.getAttribute('position');
    if (positionAttr === 'top' || positionAttr === 'left' || positionAttr === 'right') {
      this.position = positionAttr;
    }

    const valueAttr = this.getAttribute('data-value');
    if (valueAttr) {
      this.selectedValue = valueAttr;
    }
  }

  private render() {
    const selectedText = this.getAttribute('data-selected-text') || 'Select option...';

    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .dropdown-container {
          position: relative;
          display: inline-block;
          width: 100%;
        }

        .dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-width: 200px;
          padding: 0.75rem 1rem;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s;
          font-size: 0.95rem;
        }

        .dropdown-trigger:hover {
          border-color: #999;
          background: #fafafa;
        }

        .dropdown-trigger:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .dropdown-trigger.open {
          border-color: #4CAF50;
          background: white;
        }

        .trigger-text {
          flex: 1;
          text-align: left;
          color: #333;
        }

        .trigger-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: #666;
          transition: transform 0.2s;
          font-size: 1.2rem;
        }

        .dropdown-trigger.open .trigger-icon {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          min-width: 200px;
          max-height: 300px;
          overflow-y: auto;
          display: none;
        }

        .dropdown-menu.open {
          display: block;
        }

        /* Position: bottom (default) */
        .dropdown-menu.bottom {
          top: 100%;
          left: 0;
          margin-top: 8px;
        }

        /* Position: top */
        .dropdown-menu.top {
          bottom: 100%;
          left: 0;
          margin-bottom: 8px;
        }

        /* Position: right */
        .dropdown-menu.right {
          left: 100%;
          top: 0;
          margin-left: 8px;
        }

        /* Position: left */
        .dropdown-menu.left {
          right: 100%;
          top: 0;
          margin-right: 8px;
        }

        .dropdown-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.15s;
          color: #333;
          user-select: none;
        }

        .dropdown-item:hover {
          background: #f5f5f5;
        }

        .dropdown-item.selected {
          background: #e8f5e9;
          color: #2e7d32;
          font-weight: 500;
        }

        .dropdown-item.disabled {
          color: #ccc;
          cursor: not-allowed;
          background: #fafafa;
        }

        .dropdown-item.disabled:hover {
          background: #fafafa;
        }

        .dropdown-divider {
          height: 1px;
          background: #eee;
          margin: 4px 0;
        }

        .dropdown-group-label {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .no-options {
          padding: 1rem;
          text-align: center;
          color: #999;
          font-size: 0.9rem;
        }

        @media (max-width: 640px) {
          .dropdown-menu {
            max-height: 250px;
          }

          .dropdown-trigger {
            min-width: 160px;
            padding: 0.5rem 0.75rem;
            font-size: 0.9rem;
          }
        }
      </style>

      <div class="dropdown-container">
        <button class="dropdown-trigger" data-trigger type="button">
          <span class="trigger-text" data-trigger-text>${selectedText}</span>
          <span class="trigger-icon">▼</span>
        </button>
        <div class="dropdown-menu" data-menu data-position="${this.position}"></div>
      </div>
    `;

    this.trigger = this._shadowRoot.querySelector('[data-trigger]') as HTMLElement;
    this.menu = this._shadowRoot.querySelector('[data-menu]') as HTMLElement;

    // Initial menu population
    this.renderMenuItems();
  }

  private renderMenuItems() {
    if (!this.menu) return;

    const items = Array.from(this.querySelectorAll('[data-option]'));

    if (items.length === 0) {
      this.menu.innerHTML = '<div class="no-options">No options available</div>';
      return;
    }

    this.menu.innerHTML = items
      .map((item) => {
        const value = item.getAttribute('data-value') || '';
        const label = item.textContent || '';
        const disabled = item.hasAttribute('disabled');
        const divider = item.hasAttribute('data-divider');
        const groupLabel = item.hasAttribute('data-group-label');

        if (divider) {
          return '<div class="dropdown-divider"></div>';
        }

        if (groupLabel) {
          return `<div class="dropdown-group-label">${label}</div>`;
        }

        const isSelected = this.selectedValue === value;
        const disabledClass = disabled ? 'disabled' : '';
        const selectedClass = isSelected ? 'selected' : '';

        return `
          <div
            class="dropdown-item ${selectedClass} ${disabledClass}"
            data-dropdown-item
            data-value="${value}"
            ${disabled ? 'data-disabled' : ''}
            role="option"
            ${isSelected ? 'aria-selected="true"' : ''}
          >
            ${label}
          </div>
        `;
      })
      .join('');
  }

  private setupEventListeners() {
    if (!this.trigger || !this.menu) return;

    // Trigger click handler
    this.trigger.addEventListener('click', () => {
      this.toggle();
    });

    // Trigger keyboard handler
    this.trigger.addEventListener('keydown', (e) => {
      this.handleTriggerKeyboard(e as KeyboardEvent);
    });

    // Menu item click handler
    this.menu.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('[data-dropdown-item]');
      if (item && !item.hasAttribute('data-disabled')) {
        const value = item.getAttribute('data-value') || '';
        const text = item.textContent || '';
        this.selectItem(value, text);
      }
    });

    // Menu item keyboard handler
    this.menu.addEventListener('keydown', (e) => {
      this.handleMenuKeyboard(e as KeyboardEvent);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target as Node)) {
        this.close();
      }
    });

    // Close on Escape anywhere
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Rerender menu items when child content changes
    const observer = new MutationObserver(() => {
      this.renderMenuItems();
    });

    observer.observe(this, { childList: true, subtree: true });
  }

  private handleTriggerKeyboard(e: KeyboardEvent) {
    if (!this.menu) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          const items = this.menu.querySelectorAll('[data-dropdown-item]:not([data-disabled])');
          if (items.length > 0) {
            (items[0] as HTMLElement).focus();
          }
        }
        break;

      case 'Escape':
        e.preventDefault();
        if (this.isOpen) {
          this.close();
          this.trigger?.focus();
        }
        break;
    }
  }

  private handleMenuKeyboard(e: KeyboardEvent) {
    if (!this.menu) return;

    const items = Array.from(this.menu.querySelectorAll('[data-dropdown-item]:not([data-disabled]'));
    const currentItem = e.target as HTMLElement;
    const currentIndex = items.indexOf(currentItem);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          (items[currentIndex + 1] as HTMLElement).focus();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          (items[currentIndex - 1] as HTMLElement).focus();
        } else {
          this.trigger?.focus();
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        const value = currentItem.getAttribute('data-value') || '';
        const text = currentItem.textContent || '';
        this.selectItem(value, text);
        break;

      case 'Escape':
        e.preventDefault();
        this.close();
        this.trigger?.focus();
        break;
    }
  }

  private selectItem(value: string, text: string) {
    this.selectedValue = value;

    // Update trigger text
    const triggerText = this._shadowRoot.querySelector('[data-trigger-text]');
    if (triggerText) {
      triggerText.textContent = text;
    }

    // Update selection styles
    this.renderMenuItems();

    // Emit change event
    this.emitChangeEvent(value, text);

    // Close menu
    this.close();
    this.trigger?.focus();
  }

  private emitChangeEvent(value: string, label: string) {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value, label },
        bubbles: true,
        composed: true,
      })
    );
  }

  private emitOpenEvent() {
    this.dispatchEvent(
      new CustomEvent('open', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private emitCloseEvent() {
    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public API
  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    if (this.trigger) this.trigger.classList.add('open');
    if (this.menu) {
      this.menu.classList.add('open');
      this.menu.classList.add(this.position);
    }

    // Focus first item
    const firstItem = this.menu?.querySelector('[data-dropdown-item]:not([data-disabled])') as HTMLElement;
    if (firstItem) {
      firstItem.tabIndex = 0;
      firstItem.focus();
    }

    this.emitOpenEvent();
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    if (this.trigger) this.trigger.classList.remove('open');
    if (this.menu) {
      this.menu.classList.remove('open');
      this.menu.classList.remove(this.position);
    }

    this.emitCloseEvent();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  getValue() {
    return this.selectedValue;
  }

  setValue(value: string) {
    const item = this.querySelector(`[data-option][data-value="${value}"]`);
    if (item) {
      const text = item.textContent || '';
      this.selectItem(value, text);
    }
  }

  getLabel() {
    return this._shadowRoot.querySelector('[data-trigger-text]')?.textContent || '';
  }

  setLabel(label: string) {
    const triggerText = this._shadowRoot.querySelector('[data-trigger-text]');
    if (triggerText) {
      triggerText.textContent = label;
    }
  }

  isMenuOpen() {
    return this.isOpen;
  }

  addOption(value: string, label: string, disabled: boolean = false) {
    const option = document.createElement('div');
    option.setAttribute('data-option', '');
    option.setAttribute('data-value', value);
    option.textContent = label;
    if (disabled) {
      option.setAttribute('disabled', '');
    }
    this.appendChild(option);
    this.renderMenuItems();
  }

  removeOption(value: string) {
    const option = this.querySelector(`[data-option][data-value="${value}"]`);
    if (option) {
      option.remove();
      this.renderMenuItems();
    }
  }

  clearOptions() {
    const options = this.querySelectorAll('[data-option]');
    options.forEach((option) => option.remove());
    this.selectedValue = '';
    this.renderMenuItems();
  }

  focus() {
    this.trigger?.focus();
  }
}

// Register the custom element
if (!customElements.get('ui-dropdown')) {
  customElements.define('ui-dropdown', DropdownComponent);
}
