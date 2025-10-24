/**
 * Search Component with Debouncing and Suggestions
 * NO external dependencies - pure TypeScript
 */

import { debounce } from '../../utils/events.js';

export class SearchComponent extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private items: string[] = [];
  private filteredItems: string[] = [];
  private selectedIndex: number = -1;
  private debounceDelay: number = 300;
  private showAllOnFocus: boolean = false;
  private debouncedSearch: (query: string) => void;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
    this.debouncedSearch = debounce((query: string) => this.performSearch(query), this.debounceDelay);
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    this.setupEventListeners();
  }

  private parseAttributes() {
    const itemsAttr = this.getAttribute('data-items');
    if (itemsAttr) {
      this.items = itemsAttr.split(',').map((item) => item.trim());
    }

    const delayAttr = this.getAttribute('debounce-delay');
    if (delayAttr) {
      this.debounceDelay = parseInt(delayAttr);
    }

    this.showAllOnFocus = this.hasAttribute('show-all-on-focus');
  }

  private render() {
    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
        }

        .search-container {
          position: relative;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 0.5rem;
          background: white;
        }

        .search-input-wrapper:focus-within {
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        input[type="text"] {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.95rem;
          padding: 0.25rem;
        }

        .clear-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          color: #999;
          display: none;
          font-size: 1.2rem;
        }

        .clear-button.visible {
          display: block;
        }

        .clear-button:hover {
          color: #333;
        }

        .suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 4px 4px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
          display: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: -2px;
        }

        .suggestions.visible {
          display: block;
        }

        .suggestion-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .suggestion-item:hover,
        .suggestion-item.selected {
          background: #f5f5f5;
        }

        .suggestion-item.selected {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .suggestion-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .match {
          font-weight: 600;
          color: #4CAF50;
        }

        .no-results {
          padding: 1rem;
          text-align: center;
          color: #999;
          font-size: 0.9rem;
        }

        @media (max-width: 640px) {
          .suggestions {
            position: static;
            max-height: 200px;
          }
        }
      </style>

      <div class="search-container">
        <div class="search-input-wrapper">
          <input
            type="text"
            data-search-input
            placeholder="Search..."
            autocomplete="off"
          />
          <button
            type="button"
            class="clear-button"
            data-action="clear"
            title="Clear search"
          >
            ✕
          </button>
        </div>

        <div class="suggestions" data-suggestions>
          <div data-no-results class="no-results" style="display: none;">
            No results found
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners() {
    const input = this._shadowRoot.querySelector('input[type="text"]') as HTMLInputElement;
    const clearBtn = this._shadowRoot.querySelector('[data-action="clear"]') as HTMLButtonElement;
    const suggestionsContainer = this._shadowRoot.querySelector('[data-suggestions]') as HTMLElement;

    // Input handler
    input.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      this.updateClearButton(query);
      this.debouncedSearch(query);
      this.emitSearchEvent(query);
    });

    // Focus handler
    input.addEventListener('focus', () => {
      if (this.showAllOnFocus && !input.value) {
        this.filteredItems = [...this.items];
        this.renderSuggestions();
      }
    });

    // Blur handler
    input.addEventListener('blur', () => {
      setTimeout(() => {
        this.clearSuggestions();
      }, 100);
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      this.handleKeyboard(e as KeyboardEvent);
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
      input.value = '';
      input.focus();
      this.updateClearButton('');
      this.clearSuggestions();
      this.emitSearchEvent('');
    });

    // Suggestion click handler
    suggestionsContainer.addEventListener('click', (e) => {
      const item = (e.target as HTMLElement).closest('[data-suggestion-item]');
      if (item) {
        const value = item.getAttribute('data-value');
        input.value = value || '';
        this.updateClearButton(value || '');
        this.clearSuggestions();
        this.emitSelectEvent(value || '');
      }
    });
  }

  private performSearch(query: string) {
    if (!query) {
      this.filteredItems = [];
      this.renderSuggestions();
      return;
    }

    const lowerQuery = query.toLowerCase();
    this.filteredItems = this.items.filter((item) => item.toLowerCase().includes(lowerQuery));

    this.selectedIndex = -1;
    this.renderSuggestions();
  }

  private renderSuggestions() {
    const container = this._shadowRoot.querySelector('[data-suggestions]') as HTMLElement;
    const noResults = this._shadowRoot.querySelector('[data-no-results]') as HTMLElement;
    const input = this._shadowRoot.querySelector('input[type="text"]') as HTMLInputElement;

    if (this.filteredItems.length === 0) {
      container.innerHTML = '';
      if (input.value) {
        noResults.style.display = 'block';
        container.appendChild(noResults);
      }
      container.classList.remove('visible');
      return;
    }

    noResults.style.display = 'none';
    const query = input.value.toLowerCase();

    container.innerHTML = this.filteredItems
      .map(
        (item, index) => `
      <div
        class="suggestion-item ${index === this.selectedIndex ? 'selected' : ''}"
        data-suggestion-item
        data-value="${item}"
        data-index="${index}"
      >
        <div class="suggestion-text">
          ${this.highlightMatch(item, query)}
        </div>
      </div>
    `
      )
      .join('');

    container.classList.add('visible');
  }

  private highlightMatch(text: string, query: string): string {
    if (!query) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
      return text;
    }

    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);

    return `${before}<span class="match">${match}</span>${after}`;
  }

  private handleKeyboard(e: KeyboardEvent) {
    const items = this._shadowRoot.querySelectorAll('[data-suggestion-item]');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.updateSelection(items);
        break;

      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection(items);
        break;

      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
          const value = (items[this.selectedIndex] as HTMLElement).getAttribute('data-value');
          (e.target as HTMLInputElement).value = value || '';
          this.updateClearButton(value || '');
          this.clearSuggestions();
          this.emitSelectEvent(value || '');
        }
        break;

      case 'Escape':
        e.preventDefault();
        this.clearSuggestions();
        break;
    }
  }

  private updateSelection(items: NodeListOf<Element>) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        (item as HTMLElement).scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  private updateClearButton(query: string) {
    const clearBtn = this._shadowRoot.querySelector('[data-action="clear"]') as HTMLButtonElement;
    if (query) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }
  }

  private clearSuggestions() {
    const container = this._shadowRoot.querySelector('[data-suggestions]') as HTMLElement;
    container.classList.remove('visible');
    container.innerHTML = '';
  }

  private emitSearchEvent(query: string) {
    this.dispatchEvent(
      new CustomEvent('search', {
        detail: { query },
        bubbles: true,
        composed: true,
      })
    );
  }

  private emitSelectEvent(value: string) {
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: { value },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public methods
  setItems(items: string[]) {
    this.items = items;
  }

  getItems() {
    return this.items;
  }

  getFilteredItems() {
    return this.filteredItems;
  }

  clear() {
    const input = this._shadowRoot.querySelector('input[type="text"]') as HTMLInputElement;
    input.value = '';
    this.updateClearButton('');
    this.clearSuggestions();
  }

  focus() {
    const input = this._shadowRoot.querySelector('input[type="text"]') as HTMLInputElement;
    input.focus();
  }
}

// Register the custom element
if (!customElements.get('ui-search')) {
  customElements.define('ui-search', SearchComponent);
}
