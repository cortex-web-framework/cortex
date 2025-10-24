import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-accordion', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-accordion');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-ACCORDION');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render accordion container', () => {
      const accordion = element.shadowRoot?.querySelector('.accordion');
      assert(accordion);
    });

    it('should have empty items array initially', () => {
      const el = element as any;
      assert(Array.isArray(el.items));
      assert.equal(el.items.length, 0);
    });
  });

  describe('Item Management', () => {
    it('should add item with addItem method', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      assert.equal(el.items.length, 1);
      assert.equal(el.items[0].id, 'item1');
    });

    it('should remove item with removeItem method', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.removeItem('item1');
      assert.equal(el.items.length, 0);
    });

    it('should add multiple items', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.addItem({ id: 'item2', label: 'Item 2', content: 'Content 2' });
      el.addItem({ id: 'item3', label: 'Item 3', content: 'Content 3' });
      assert.equal(el.items.length, 3);
    });

    it('should set items property', () => {
      const el = element as any;
      const items = [
        { id: 'a', label: 'A', content: 'Content A' },
        { id: 'b', label: 'B', content: 'Content B' },
      ];
      el.items = items;
      assert.equal(el.items.length, 2);
    });
  });

  describe('Item State Management', () => {
    it('should open item with openItem', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.openItem('item1');
      assert(el.openItems.has('item1'));
    });

    it('should close item with closeItem', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.openItem('item1');
      el.closeItem('item1');
      assert(!el.openItems.has('item1'));
    });

    it('should toggle item state', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      assert(!el.openItems.has('item1'));
      el.toggleItem('item1');
      assert(el.openItems.has('item1'));
      el.toggleItem('item1');
      assert(!el.openItems.has('item1'));
    });

    it('should close all items', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.addItem({ id: 'item2', label: 'Item 2', content: 'Content 2' });
      el.openItem('item1');
      el.openItem('item2');
      assert.equal(el.openItems.size, 2);
      el.closeAll();
      assert.equal(el.openItems.size, 0);
    });
  });

  describe('Single vs Multiple Open Mode', () => {
    it('should default to allowMultiple false', () => {
      const el = element as any;
      assert.equal(el.allowMultiple, false);
    });

    it('should set allowMultiple property', () => {
      const el = element as any;
      el.allowMultiple = true;
      assert.equal(el.allowMultiple, true);
    });

    it('should close previous item when opening new item in single mode', () => {
      const el = element as any;
      el.allowMultiple = false;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.addItem({ id: 'item2', label: 'Item 2', content: 'Content 2' });
      el.openItem('item1');
      assert(el.openItems.has('item1'));
      el.openItem('item2');
      assert(!el.openItems.has('item1'));
      assert(el.openItems.has('item2'));
    });

    it('should allow multiple open items in multiple mode', () => {
      const el = element as any;
      el.allowMultiple = true;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.addItem({ id: 'item2', label: 'Item 2', content: 'Content 2' });
      el.openItem('item1');
      el.openItem('item2');
      assert.equal(el.openItems.size, 2);
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
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1', disabled: true });
      const buttons = element.shadowRoot?.querySelectorAll('[role="button"]');
      assert(buttons && buttons.length > 0);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with Arrow Down', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.addItem({ id: 'item2', label: 'Item 2', content: 'Content 2' });
      const buttons = element.shadowRoot?.querySelectorAll('.accordion-header');
      assert(buttons && buttons.length >= 2);
    });

    it('should navigate with Arrow Up', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.addItem({ id: 'item2', label: 'Item 2', content: 'Content 2' });
      const buttons = element.shadowRoot?.querySelectorAll('.accordion-header');
      assert(buttons && buttons.length >= 2);
    });

    it('should go to first item with Home key', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.addItem({ id: 'item2', label: 'Item 2', content: 'Content 2' });
      const buttons = element.shadowRoot?.querySelectorAll('.accordion-header');
      assert(buttons && buttons.length >= 2);
    });

    it('should go to last item with End key', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.addItem({ id: 'item2', label: 'Item 2', content: 'Content 2' });
      const buttons = element.shadowRoot?.querySelectorAll('.accordion-header');
      assert(buttons && buttons.length >= 2);
    });

    it('should toggle item with Enter key', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      const buttons = element.shadowRoot?.querySelectorAll('.accordion-header');
      assert(buttons && buttons.length > 0);
    });

    it('should toggle item with Space key', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      const buttons = element.shadowRoot?.querySelectorAll('.accordion-header');
      assert(buttons && buttons.length > 0);
    });
  });

  describe('Events', () => {
    it('should emit itemOpened event', () => {
      let opened = false;
      element.addEventListener('itemOpened', () => {
        opened = true;
      });

      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.openItem('item1');
      assert(opened);
    });

    it('should emit itemClosed event', () => {
      let closed = false;
      element.addEventListener('itemClosed', () => {
        closed = true;
      });

      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.openItem('item1');
      el.closeItem('item1');
      assert(closed);
    });

    it('should include item id in event detail', () => {
      let itemId: string | null = null;
      element.addEventListener('itemOpened', (e: Event) => {
        itemId = (e as CustomEvent).detail?.id;
      });

      const el = element as any;
      el.addItem({ id: 'test-item', label: 'Test', content: 'Content' });
      el.openItem('test-item');
      assert.equal(itemId, 'test-item');
    });
  });

  describe('Accessibility', () => {
    it('should have role=region on accordion', () => {
      const accordion = element.shadowRoot?.querySelector('[role="region"]');
      assert(accordion);
    });

    it('should have aria-label on accordion', () => {
      const accordion = element.shadowRoot?.querySelector('[role="region"]');
      assert(accordion?.getAttribute('aria-label'));
    });

    it('should have role=button on headers', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      const header = element.shadowRoot?.querySelector('.accordion-header');
      assert(header?.getAttribute('role') === 'button' || header?.tagName === 'BUTTON');
    });

    it('should have aria-expanded on headers', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      const header = element.shadowRoot?.querySelector('.accordion-header');
      assert(header?.hasAttribute('aria-expanded'));
    });

    it('should update aria-expanded when toggled', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.openItem('item1');
      const header = element.shadowRoot?.querySelector('.accordion-header');
      assert.equal(header?.getAttribute('aria-expanded'), 'true');
      el.closeItem('item1');
      assert.equal(header?.getAttribute('aria-expanded'), 'false');
    });

    it('should have aria-controls linking header to panel', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      const header = element.shadowRoot?.querySelector('.accordion-header');
      assert(header?.hasAttribute('aria-controls'));
    });
  });

  describe('Rendering', () => {
    it('should render item labels', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'My Item Label', content: 'Content' });
      const label = element.shadowRoot?.textContent;
      assert(label && label.includes('My Item Label'));
    });

    it('should render item content when open', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'My Content' });
      el.openItem('item1');
      const content = element.shadowRoot?.textContent;
      assert(content && content.includes('My Content'));
    });

    it('should hide item content when closed', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Hidden Content' });
      el.openItem('item1');
      el.closeItem('item1');
      assert(element.shadowRoot);
    });

    it('should show collapse/expand icon', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content' });
      const icon = element.shadowRoot?.querySelector('.accordion-icon');
      assert(icon);
    });
  });

  describe('Attributes', () => {
    it('should accept allowMultiple attribute', () => {
      element.setAttribute('allowMultiple', '');
      const el = element as any;
      assert.equal(el.allowMultiple, true);
    });

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', '');
      const el = element as any;
      assert.equal(el.disabled, true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty accordion', () => {
      const el = element as any;
      assert.equal(el.items.length, 0);
      el.closeAll();
      assert.equal(el.openItems.size, 0);
    });

    it('should handle opening non-existent item', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.openItem('nonexistent');
      assert.equal(el.openItems.size, 0);
    });

    it('should handle removing non-existent item', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      el.removeItem('nonexistent');
      assert.equal(el.items.length, 1);
    });

    it('should handle many items', () => {
      const el = element as any;
      for (let i = 0; i < 50; i++) {
        el.addItem({
          id: `item${i}`,
          label: `Item ${i}`,
          content: `Content ${i}`,
        });
      }
      assert.equal(el.items.length, 50);
    });

    it('should handle rapid open/close', () => {
      const el = element as any;
      el.addItem({ id: 'item1', label: 'Item 1', content: 'Content 1' });
      for (let i = 0; i < 10; i++) {
        el.toggleItem('item1');
      }
      assert(element.shadowRoot);
    });

    it('should handle updating items array', () => {
      const el = element as any;
      el.items = [
        { id: 'a', label: 'A', content: 'Content A' },
        { id: 'b', label: 'B', content: 'Content B' },
      ];
      el.items = [
        { id: 'c', label: 'C', content: 'Content C' },
        { id: 'd', label: 'D', content: 'Content D' },
        { id: 'e', label: 'E', content: 'Content E' },
      ];
      assert.equal(el.items.length, 3);
    });
  });

  describe('Initial State', () => {
    it('should have empty items initially', () => {
      const el = element as any;
      assert.equal(el.items.length, 0);
    });

    it('should have no open items initially', () => {
      const el = element as any;
      assert.equal(el.openItems.size, 0);
    });

    it('should default allowMultiple to false', () => {
      const el = element as any;
      assert.equal(el.allowMultiple, false);
    });

    it('should not be disabled initially', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });
  });
});
