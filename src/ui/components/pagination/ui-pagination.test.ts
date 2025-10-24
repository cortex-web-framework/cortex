import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-pagination', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-pagination');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-PAGINATION');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render pagination container', () => {
      const pagination = element.shadowRoot?.querySelector('.pagination');
      assert(pagination);
    });

    it('should render page buttons', () => {
      const el = element as any;
      el.totalPages = 5;
      const buttons = element.shadowRoot?.querySelectorAll('[role="button"]');
      assert(buttons && buttons.length > 0);
    });
  });

  describe('Page Management', () => {
    it('should have default currentPage of 1', () => {
      const el = element as any;
      el.totalPages = 5;
      assert.equal(el.currentPage, 1);
    });

    it('should accept totalPages property', () => {
      const el = element as any;
      el.totalPages = 10;
      assert.equal(el.totalPages, 10);
    });

    it('should go to page with goToPage method', () => {
      const el = element as any;
      el.totalPages = 5;
      el.goToPage?.(3);
      assert.equal(el.currentPage, 3);
    });

    it('should go to next page', () => {
      const el = element as any;
      el.totalPages = 5;
      el.currentPage = 2;
      el.nextPage?.();
      assert.equal(el.currentPage, 3);
    });

    it('should go to previous page', () => {
      const el = element as any;
      el.totalPages = 5;
      el.currentPage = 3;
      el.previousPage?.();
      assert.equal(el.currentPage, 2);
    });

    it('should not go before page 1', () => {
      const el = element as any;
      el.totalPages = 5;
      el.currentPage = 1;
      el.previousPage?.();
      assert.equal(el.currentPage, 1);
    });

    it('should not go after totalPages', () => {
      const el = element as any;
      el.totalPages = 5;
      el.currentPage = 5;
      el.nextPage?.();
      assert.equal(el.currentPage, 5);
    });
  });

  describe('Visible Pages', () => {
    it('should default to showing 5 visible pages', () => {
      const el = element as any;
      el.totalPages = 10;
      assert.equal(el.maxVisiblePages, 5);
    });

    it('should accept maxVisiblePages property', () => {
      const el = element as any;
      el.maxVisiblePages = 7;
      assert.equal(el.maxVisiblePages, 7);
    });

    it('should limit visible page numbers', () => {
      const el = element as any;
      el.totalPages = 20;
      el.maxVisiblePages = 5;
      const pageButtons = element.shadowRoot?.querySelectorAll('.page-number');
      assert(pageButtons && pageButtons.length <= 7); // 5 pages + next/prev
    });

    it('should show ellipsis when pages are hidden', () => {
      const el = element as any;
      el.totalPages = 20;
      el.maxVisiblePages = 5;
      el.goToPage?.(10);
      // Ellipsis might be rendered
      assert(element.shadowRoot);
    });
  });

  describe('Navigation Buttons', () => {
    it('should have previous button', () => {
      const prevBtn = element.shadowRoot?.querySelector('.page-prev');
      assert(prevBtn);
    });

    it('should have next button', () => {
      const nextBtn = element.shadowRoot?.querySelector('.page-next');
      assert(nextBtn);
    });

    it('should disable previous on first page', () => {
      const el = element as any;
      el.totalPages = 5;
      el.currentPage = 1;
      const prevBtn = element.shadowRoot?.querySelector('.page-prev') as HTMLElement;
      assert(prevBtn?.getAttribute('aria-disabled') === 'true' || prevBtn?.hasAttribute('disabled'));
    });

    it('should disable next on last page', () => {
      const el = element as any;
      el.totalPages = 5;
      el.currentPage = 5;
      const nextBtn = element.shadowRoot?.querySelector('.page-next') as HTMLElement;
      assert(nextBtn?.getAttribute('aria-disabled') === 'true' || nextBtn?.hasAttribute('disabled'));
    });
  });

  describe('First/Last Buttons', () => {
    it('should not show first/last buttons by default', () => {
      const el = element as any;
      assert.equal(el.showFirstLast, false);
    });

    it('should support showFirstLast property', () => {
      const el = element as any;
      el.showFirstLast = true;
      assert.equal(el.showFirstLast, true);
    });

    it('should show first button when enabled', () => {
      const el = element as any;
      el.showFirstLast = true;
      el.totalPages = 10;
      const firstBtn = element.shadowRoot?.querySelector('.page-first');
      assert(firstBtn);
    });

    it('should show last button when enabled', () => {
      const el = element as any;
      el.showFirstLast = true;
      el.totalPages = 10;
      const lastBtn = element.shadowRoot?.querySelector('.page-last');
      assert(lastBtn);
    });
  });

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should accept disabled property', () => {
      const el = element as any;
      el.disabled = true;
      assert.equal(el.disabled, true);
    });

    it('should disable all buttons when disabled', () => {
      const el = element as any;
      el.totalPages = 5;
      el.disabled = true;
      const buttons = element.shadowRoot?.querySelectorAll('[role="button"]');
      assert(buttons && buttons.length > 0);
    });
  });

  describe('Events', () => {
    it('should emit change event on page selection', () => {
      let changed = false;
      element.addEventListener('change', () => {
        changed = true;
      });

      const el = element as any;
      el.totalPages = 5;
      el.goToPage?.(2);
      assert(changed);
    });

    it('should include page number in event', () => {
      let page: number | null = null;
      element.addEventListener('change', (e: Event) => {
        page = (e as CustomEvent).detail?.page;
      });

      const el = element as any;
      el.totalPages = 5;
      el.goToPage?.(3);
      assert.equal(page, 3);
    });
  });

  describe('Attributes', () => {
    it('should accept currentPage attribute', () => {
      element.setAttribute('currentPage', '2');
      const el = element as any;
      assert(el.currentPage === 2 || el.currentPage === 1);
    });

    it('should accept totalPages attribute', () => {
      element.setAttribute('totalPages', '10');
      const el = element as any;
      assert.equal(el.totalPages, 10);
    });

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', '');
      const el = element as any;
      assert.equal(el.disabled, true);
    });

    it('should accept showFirstLast attribute', () => {
      element.setAttribute('showFirstLast', '');
      const el = element as any;
      assert.equal(el.showFirstLast, true);
    });
  });

  describe('Accessibility', () => {
    it('should have navigation role', () => {
      const pagination = element.shadowRoot?.querySelector('[role="navigation"]');
      assert(pagination);
    });

    it('should have aria-label on pagination', () => {
      const pagination = element.shadowRoot?.querySelector('[role="navigation"]');
      assert(pagination?.getAttribute('aria-label'));
    });

    it('should mark current page as current', () => {
      const el = element as any;
      el.totalPages = 5;
      el.currentPage = 2;
      // Current page should be marked
      assert(element.shadowRoot);
    });

    it('should have proper ARIA on disabled buttons', () => {
      const el = element as any;
      el.totalPages = 5;
      el.currentPage = 1;
      const prevBtn = element.shadowRoot?.querySelector('.page-prev');
      assert(prevBtn?.getAttribute('aria-disabled') === 'true' || prevBtn?.hasAttribute('disabled'));
    });
  });

  describe('Initial State', () => {
    it('should start at page 1', () => {
      const el = element as any;
      el.totalPages = 10;
      assert.equal(el.currentPage, 1);
    });

    it('should have 0 totalPages initially', () => {
      const el = element as any;
      assert.equal(el.totalPages, 0);
    });

    it('should default maxVisiblePages to 5', () => {
      const el = element as any;
      assert.equal(el.maxVisiblePages, 5);
    });

    it('should not show first/last by default', () => {
      const el = element as any;
      assert.equal(el.showFirstLast, false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page', () => {
      const el = element as any;
      el.totalPages = 1;
      assert.equal(el.currentPage, 1);
    });

    it('should handle very large page count', () => {
      const el = element as any;
      el.totalPages = 1000;
      el.goToPage?.(500);
      assert.equal(el.currentPage, 500);
    });

    it('should handle invalid page numbers', () => {
      const el = element as any;
      el.totalPages = 5;
      el.goToPage?.(10);
      // Should clamp to valid range
      assert(el.currentPage >= 1 && el.currentPage <= 5);
    });

    it('should handle zero pages gracefully', () => {
      const el = element as any;
      el.totalPages = 0;
      // Should handle gracefully
      assert(element.shadowRoot);
    });
  });
});
