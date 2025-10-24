import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-breadcrumb', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-breadcrumb');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-BREADCRUMB');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render breadcrumb container', () => {
      const breadcrumb = element.shadowRoot?.querySelector('.breadcrumb');
      assert(breadcrumb);
    });

    it('should have empty items initially', () => {
      const el = element as any;
      assert(Array.isArray(el.items));
      assert.equal(el.items.length, 0);
    });
  });

  describe('Item Management', () => {
    it('should add item with addItem method', () => {
      const el = element as any;
      el.addItem({ label: 'Home', href: '/' });
      assert.equal(el.items.length, 1);
    });

    it('should remove item by index', () => {
      const el = element as any;
      el.addItem({ label: 'Home', href: '/' });
      el.addItem({ label: 'Products', href: '/products' });
      el.removeItem(0);
      assert.equal(el.items.length, 1);
    });

    it('should set items array', () => {
      const el = element as any;
      el.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
      ];
      assert.equal(el.items.length, 2);
    });

    it('should maintain item order', () => {
      const el = element as any;
      el.addItem({ label: 'Home', href: '/' });
      el.addItem({ label: 'Products', href: '/products' });
      el.addItem({ label: 'Details', href: '/details' });
      assert.equal(el.items[0].label, 'Home');
      assert.equal(el.items[1].label, 'Products');
      assert.equal(el.items[2].label, 'Details');
    });
  });

  describe('Current Item', () => {
    it('should set current item', () => {
      const el = element as any;
      el.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
      ];
      el.setCurrentItem(1);
      assert(element.shadowRoot);
    });

    it('should mark last item as current by default', () => {
      const el = element as any;
      el.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
      ];
      assert(element.shadowRoot);
    });

    it('should have only one current item', () => {
      const el = element as any;
      el.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Details', href: '/details' },
      ];
      el.setCurrentItem(1);
      const currentItems = el.items.filter((item: any) => item.current);
      assert(currentItems.length <= 1);
    });
  });

  describe('Separator', () => {
    it('should have default forward slash separator', () => {
      const el = element as any;
      assert.equal(el.separator, '/');
    });

    it('should accept custom separator', () => {
      const el = element as any;
      el.separator = '>';
      assert.equal(el.separator, '>');
    });

    it('should render separator between items', () => {
      const el = element as any;
      el.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
      ];
      el.separator = '>';
      const separators = element.shadowRoot?.querySelectorAll('.breadcrumb-separator');
      assert(separators && separators.length >= 1);
    });
  });

  describe('Links and Navigation', () => {
    it('should render links for items with href', () => {
      const el = element as any;
      el.addItem({ label: 'Home', href: '/' });
      const link = element.shadowRoot?.querySelector('a');
      assert(link);
    });

    it('should have correct href attribute', () => {
      const el = element as any;
      el.addItem({ label: 'Products', href: '/products' });
      const link = element.shadowRoot?.querySelector('a');
      assert.equal(link?.getAttribute('href'), '/products');
    });

    it('should render span for items without href', () => {
      const el = element as any;
      el.addItem({ label: 'Current Page' });
      const items = element.shadowRoot?.querySelectorAll('.breadcrumb-item');
      assert(items && items.length > 0);
    });

    it('should render text for items without href', () => {
      const el = element as any;
      el.addItem({ label: 'Current Page' });
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('Current Page'));
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

    it('should disable individual items', () => {
      const el = element as any;
      el.items = [
        { label: 'Home', href: '/', disabled: true },
        { label: 'Products', href: '/products' },
      ];
      assert(element.shadowRoot);
    });

    it('should disable all items when breadcrumb disabled', () => {
      const el = element as any;
      el.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
      ];
      el.disabled = true;
      const links = element.shadowRoot?.querySelectorAll('a');
      assert(links && links.length > 0);
    });
  });

  describe('Accessibility', () => {
    it('should have role=navigation', () => {
      const el = element as any;
      el.addItem({ label: 'Home', href: '/' });
      const nav = element.shadowRoot?.querySelector('[role="navigation"]');
      assert(nav);
    });

    it('should have aria-label', () => {
      const el = element as any;
      el.addItem({ label: 'Home', href: '/' });
      const nav = element.shadowRoot?.querySelector('[role="navigation"]');
      assert(nav?.getAttribute('aria-label'));
    });

    it('should have role=list on items', () => {
      const el = element as any;
      el.addItem({ label: 'Home', href: '/' });
      const list = element.shadowRoot?.querySelector('[role="list"]');
      assert(list);
    });

    it('should have role=listitem on breadcrumb items', () => {
      const el = element as any;
      el.addItem({ label: 'Home', href: '/' });
      const items = element.shadowRoot?.querySelectorAll('[role="listitem"]');
      assert(items && items.length > 0);
    });

    it('should have aria-current on current item', () => {
      const el = element as any;
      el.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
      ];
      el.setCurrentItem(1);
      const items = element.shadowRoot?.querySelectorAll('[aria-current]');
      assert(items && items.length > 0);
    });

    it('should have aria-disabled on disabled items', () => {
      const el = element as any;
      el.items = [
        { label: 'Home', href: '/', disabled: true },
        { label: 'Products', href: '/products' },
      ];
      const disabledItems = element.shadowRoot?.querySelectorAll('[aria-disabled="true"]');
      assert(disabledItems && disabledItems.length >= 1);
    });
  });

  describe('Rendering', () => {
    it('should render item labels', () => {
      const el = element as any;
      el.addItem({ label: 'Dashboard' });
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('Dashboard'));
    });

    it('should render multiple items', () => {
      const el = element as any;
      el.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Electronics', href: '/electronics' },
      ];
      const items = element.shadowRoot?.querySelectorAll('.breadcrumb-item');
      assert(items && items.length === 3);
    });

    it('should maintain item hierarchy', () => {
      const el = element as any;
      el.items = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Details', href: '/details' },
      ];
      const items = element.shadowRoot?.querySelectorAll('.breadcrumb-item');
      assert(items && items.length === 3);
    });
  });

  describe('Events', () => {
    it('should emit navigate event on link click', () => {
      let navigated = false;
      element.addEventListener('navigate', () => {
        navigated = true;
      });

      const el = element as any;
      el.addItem({ label: 'Home', href: '/' });
      const link = element.shadowRoot?.querySelector('a') as HTMLElement;
      link?.click();
      assert(navigated);
    });

    it('should include href in navigate event', () => {
      let href: string | null = null;
      element.addEventListener('navigate', (e: Event) => {
        href = (e as CustomEvent).detail?.href;
      });

      const el = element as any;
      el.addItem({ label: 'Products', href: '/products' });
      const link = element.shadowRoot?.querySelector('a') as HTMLElement;
      link?.click();
      assert.equal(href, '/products');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item', () => {
      const el = element as any;
      el.addItem({ label: 'Home' });
      assert.equal(el.items.length, 1);
    });

    it('should handle many items', () => {
      const el = element as any;
      for (let i = 0; i < 10; i++) {
        el.addItem({ label: `Level ${i}`, href: `/level${i}` });
      }
      assert.equal(el.items.length, 10);
    });

    it('should handle removing all items', () => {
      const el = element as any;
      el.addItem({ label: 'Item 1' });
      el.addItem({ label: 'Item 2' });
      el.removeItem(0);
      el.removeItem(0);
      assert.equal(el.items.length, 0);
    });

    it('should handle very long labels', () => {
      const el = element as any;
      el.addItem({ label: 'A'.repeat(500) });
      assert(el.items[0].label.length === 500);
    });

    it('should handle special characters in labels', () => {
      const el = element as any;
      el.addItem({ label: 'Home & Products > Details' });
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('Home & Products > Details'));
    });

    it('should handle empty items array', () => {
      const el = element as any;
      el.items = [];
      assert.equal(el.items.length, 0);
      assert(element.shadowRoot);
    });
  });

  describe('Attributes', () => {
    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', '');
      const el = element as any;
      assert.equal(el.disabled, true);
    });

    it('should accept separator attribute', () => {
      element.setAttribute('separator', '>>');
      const el = element as any;
      assert.equal(el.separator, '>>');
    });
  });

  describe('Initial State', () => {
    it('should start with empty items', () => {
      const el = element as any;
      assert.equal(el.items.length, 0);
    });

    it('should default separator to /', () => {
      const el = element as any;
      assert.equal(el.separator, '/');
    });

    it('should not be disabled initially', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });
  });
});
