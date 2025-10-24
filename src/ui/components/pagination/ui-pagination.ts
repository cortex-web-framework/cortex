/**
 * ui-pagination: A pagination component for navigating through pages.
 */

import { IPaginationElement, PaginationState } from './ui-pagination.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiPagination extends HTMLElement implements IPaginationElement {
  private shadowRootInternal: ShadowRoot;

  private state: PaginationState = {
    currentPage: 1,
    totalPages: 0,
    maxVisiblePages: 5,
    disabled: false,
    showFirstLast: false,
  };

  static get observedAttributes(): string[] {
    return ['currentPage', 'totalPages', 'maxVisiblePages', 'disabled', 'showFirstLast'];
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
      case 'currentPage':
        const page = parseInt(newValue || '1', 10);
        if (page >= 1 && page <= this.state.totalPages) {
          this.state.currentPage = page;
        }
        break;
      case 'totalPages':
        this.state.totalPages = parseInt(newValue || '0', 10);
        break;
      case 'maxVisiblePages':
        this.state.maxVisiblePages = parseInt(newValue || '5', 10);
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'showFirstLast':
        this.state.showFirstLast = newValue !== null;
        break;
    }

    this.render();
  }

  get currentPage(): number {
    return this.state.currentPage;
  }

  set currentPage(val: number) {
    if (val >= 1 && val <= this.state.totalPages) {
      this.state.currentPage = val;
      this.setAttribute('currentPage', String(val));
      this.render();
    }
  }

  get totalPages(): number {
    return this.state.totalPages;
  }

  set totalPages(val: number) {
    this.state.totalPages = val;
    this.setAttribute('totalPages', String(val));
    if (this.state.currentPage > val) {
      this.state.currentPage = val;
    }
    this.render();
  }

  get maxVisiblePages(): number {
    return this.state.maxVisiblePages;
  }

  set maxVisiblePages(val: number) {
    this.state.maxVisiblePages = val;
    this.setAttribute('maxVisiblePages', String(val));
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

  get showFirstLast(): boolean {
    return this.state.showFirstLast;
  }

  set showFirstLast(val: boolean) {
    this.state.showFirstLast = val;
    if (val) {
      this.setAttribute('showFirstLast', '');
    } else {
      this.removeAttribute('showFirstLast');
    }
    this.render();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.state.totalPages) {
      this.state.currentPage = page;
      this.setAttribute('currentPage', String(page));
      this.emitChangeEvent(page);
      this.render();
    }
  }

  nextPage(): void {
    if (this.state.currentPage < this.state.totalPages) {
      this.goToPage(this.state.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.state.currentPage > 1) {
      this.goToPage(this.state.currentPage - 1);
    }
  }

  private emitChangeEvent(page: number): void {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { page },
        bubbles: true,
        composed: true,
      })
    );
  }

  private getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const { currentPage, totalPages, maxVisiblePages } = this.state;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
      }

      .pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: ${themeManager.getSpacing('SM')};
        list-style: none;
        margin: 0;
        padding: 0;
      }

      [role="button"] {
        min-width: 40px;
        height: 40px;
        padding: 0 ${themeManager.getSpacing('SM')};
        border: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
        background: ${themeManager.getColor('SURFACE') || '#fff'};
        color: ${themeManager.getColor('TEXT') || '#000'};
        font-size: ${themeManager.getFontSize('SM')};
        cursor: pointer;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      [role="button"]:hover:not([aria-disabled="true"]) {
        background: ${themeManager.getColor('PRIMARY') || '#007bff'};
        color: #fff;
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      [role="button"][aria-disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .page-number.active {
        background: ${themeManager.getColor('PRIMARY') || '#007bff'};
        color: #fff;
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      .page-ellipsis {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: default;
      }

      .page-prev,
      .page-next,
      .page-first,
      .page-last {
        font-weight: bold;
      }

      :host([disabled]) [role="button"] {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const visiblePages = this.getVisiblePages();
    let buttonsHtml = '';

    // First button
    if (this.state.showFirstLast) {
      const isDisabled = this.state.currentPage === 1 || this.state.disabled;
      buttonsHtml += `
        <button
          class="page-first"
          role="button"
          aria-disabled="${isDisabled}"
          aria-label="First page"
          ${isDisabled ? 'disabled' : ''}
        >«</button>
      `;
    }

    // Previous button
    const isPrevDisabled = this.state.currentPage === 1 || this.state.disabled;
    buttonsHtml += `
      <button
        class="page-prev"
        role="button"
        aria-disabled="${isPrevDisabled}"
        aria-label="Previous page"
        ${isPrevDisabled ? 'disabled' : ''}
      >‹</button>
    `;

    // Page numbers
    visiblePages.forEach((page) => {
      if (page === '...') {
        buttonsHtml += `<div class="page-ellipsis">…</div>`;
      } else {
        const isActive = page === this.state.currentPage;
        buttonsHtml += `
          <button
            class="page-number ${isActive ? 'active' : ''}"
            role="button"
            aria-disabled="${this.state.disabled}"
            aria-current="${isActive ? 'page' : 'false'}"
            ${this.state.disabled ? 'disabled' : ''}
          >${page}</button>
        `;
      }
    });

    // Next button
    const isNextDisabled = this.state.currentPage === this.state.totalPages || this.state.disabled;
    buttonsHtml += `
      <button
        class="page-next"
        role="button"
        aria-disabled="${isNextDisabled}"
        aria-label="Next page"
        ${isNextDisabled ? 'disabled' : ''}
      >›</button>
    `;

    // Last button
    if (this.state.showFirstLast) {
      const isDisabled = this.state.currentPage === this.state.totalPages || this.state.disabled;
      buttonsHtml += `
        <button
          class="page-last"
          role="button"
          aria-disabled="${isDisabled}"
          aria-label="Last page"
          ${isDisabled ? 'disabled' : ''}
        >»</button>
      `;
    }

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <nav class="pagination" role="navigation" aria-label="Pagination Navigation">
        ${buttonsHtml}
      </nav>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const buttons = this.shadowRootInternal?.querySelectorAll('[role="button"]');
    if (!buttons) return;

    buttons.forEach((button: Element) => {
      const btn = button as HTMLButtonElement;
      const ariaDisabled = btn.getAttribute('aria-disabled') === 'true';

      if (ariaDisabled) {
        btn.removeEventListener('click', this.handleButtonClick);
        return;
      }

      btn.addEventListener('click', this.handleButtonClick.bind(this));
    });
  }

  private handleButtonClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    const ariaDisabled = target.getAttribute('aria-disabled') === 'true';

    if (ariaDisabled || this.state.disabled) return;

    const classList = target.className;

    if (classList.includes('page-prev')) {
      this.previousPage();
    } else if (classList.includes('page-next')) {
      this.nextPage();
    } else if (classList.includes('page-first')) {
      this.goToPage(1);
    } else if (classList.includes('page-last')) {
      this.goToPage(this.state.totalPages);
    } else if (classList.includes('page-number')) {
      const pageNum = parseInt(target.textContent || '1', 10);
      this.goToPage(pageNum);
    }
  };
}

customElements.define('ui-pagination', UiPagination);

declare global {
  interface HTMLElementTagNameMap {
    'ui-pagination': UiPagination;
  }
}

export { UiPagination };
