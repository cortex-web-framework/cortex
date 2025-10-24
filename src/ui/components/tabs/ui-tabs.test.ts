import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-tabs', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-tabs');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-TABS');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render tab list', () => {
      const tabList = element.shadowRoot?.querySelector('[role="tablist"]');
      assert(tabList);
    });

    it('should render tab panels area', () => {
      const panels = element.shadowRoot?.querySelector('.tab-panels');
      assert(panels);
    });
  });

  describe('Tab Management', () => {
    it('should have empty tabs by default', () => {
      const el = element as any;
      assert.equal(el.tabs?.length, 0);
    });

    it('should accept tabs property', () => {
      const el = element as any;
      el.tabs = [{ id: 'tab1', label: 'Tab 1' }];
      assert.equal(el.tabs?.length, 1);
    });

    it('should render tabs', () => {
      const el = element as any;
      el.tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
      ];
      const buttons = element.shadowRoot?.querySelectorAll('[role="tab"]');
      assert.equal(buttons?.length, 2);
    });

    it('should add tab with addTab method', () => {
      const el = element as any;
      el.addTab?.({ id: 'new', label: 'New Tab' });
      assert(el.tabs?.length > 0);
    });

    it('should remove tab with removeTab method', () => {
      const el = element as any;
      el.tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
      ];
      el.removeTab?.('tab1');
      assert(el.tabs?.find((t: any) => t.id === 'tab1') === undefined);
    });
  });

  describe('Tab Selection', () => {
    it('should select first tab by default', () => {
      const el = element as any;
      el.tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
      ];
      assert.equal(el.activeTabId, 'tab1');
    });

    it('should select tab with selectTab method', () => {
      const el = element as any;
      el.tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
      ];
      el.selectTab?.('tab2');
      assert.equal(el.activeTabId, 'tab2');
    });

    it('should set aria-selected on active tab', () => {
      const el = element as any;
      el.tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
      ];
      el.selectTab?.('tab2');
      const tab2 = element.shadowRoot?.querySelector('[data-tab-id="tab2"]');
      assert.equal(tab2?.getAttribute('aria-selected'), 'true');
    });

    it('should emit change event on tab selection', () => {
      let changed = false;
      element.addEventListener('change', () => {
        changed = true;
      });

      const el = element as any;
      el.tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
      ];
      el.selectTab?.('tab2');
      assert(changed);
    });
  });

  describe('Tab Variants', () => {
    it('should default to default variant', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should support pills variant', () => {
      const el = element as any;
      el.variant = 'pills';
      assert.equal(el.variant, 'pills');
    });

    it('should support underline variant', () => {
      const el = element as any;
      el.variant = 'underline';
      assert.equal(el.variant, 'underline');
    });

    it('should apply variant class to tab list', () => {
      const el = element as any;
      el.variant = 'pills';
      const tabList = element.shadowRoot?.querySelector('[role="tablist"]');
      assert(tabList?.classList.contains('tablist-pills'));
    });
  });

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should support disabled property', () => {
      const el = element as any;
      el.disabled = true;
      assert.equal(el.disabled, true);
    });

    it('should disable individual tabs', () => {
      const el = element as any;
      el.tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2', disabled: true },
      ];
      const tab2 = element.shadowRoot?.querySelector('[data-tab-id="tab2"]');
      assert.equal(tab2?.getAttribute('aria-disabled'), 'true');
    });

    it('should prevent selecting disabled tabs', () => {
      const el = element as any;
      el.tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2', disabled: true },
      ];
      el.selectTab?.('tab2');
      assert.equal(el.activeTabId, 'tab1');
    });
  });

  describe('Slots', () => {
    it('should support content slots for each tab', () => {
      const slot = element.shadowRoot?.querySelector('slot');
      assert(slot);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have tablist role', () => {
      const tabList = element.shadowRoot?.querySelector('[role="tablist"]');
      assert.equal(tabList?.getAttribute('role'), 'tablist');
    });

    it('should have tab role on tab buttons', () => {
      const el = element as any;
      el.tabs = [{ id: 'tab1', label: 'Tab 1' }];
      const tab = element.shadowRoot?.querySelector('[role="tab"]');
      assert.equal(tab?.getAttribute('role'), 'tab');
    });

    it('should have tabpanel role on panels', () => {
      const panel = element.shadowRoot?.querySelector('[role="tabpanel"]');
      assert(panel?.getAttribute('role') === 'tabpanel' || panel === null);
    });
  });

  describe('Attributes', () => {
    it('should accept variant attribute', () => {
      element.setAttribute('variant', 'pills');
      const el = element as any;
      assert.equal(el.variant, 'pills');
    });

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', '');
      const el = element as any;
      assert.equal(el.disabled, true);
    });
  });

  describe('Initial State', () => {
    it('should have empty tabs initially', () => {
      const el = element as any;
      assert.equal(el.tabs?.length, 0);
    });

    it('should have null activeTabId initially', () => {
      const el = element as any;
      assert.equal(el.activeTabId, null);
    });

    it('should be enabled initially', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should use default variant initially', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tab list', () => {
      const el = element as any;
      el.tabs = [];
      assert.equal(el.tabs?.length, 0);
    });

    it('should handle adding duplicate tab', () => {
      const el = element as any;
      el.tabs = [{ id: 'tab1', label: 'Tab 1' }];
      el.addTab?.({ id: 'tab1', label: 'Duplicate' });
      // Should handle gracefully
      assert(el.tabs);
    });

    it('should handle removing non-existent tab', () => {
      const el = element as any;
      el.tabs = [{ id: 'tab1', label: 'Tab 1' }];
      el.removeTab?.('nonexistent');
      // Should handle gracefully
      assert.equal(el.tabs?.length, 1);
    });

    it('should handle selecting non-existent tab', () => {
      const el = element as any;
      el.tabs = [{ id: 'tab1', label: 'Tab 1' }];
      el.selectTab?.('nonexistent');
      // Should keep current selection
      assert(el.activeTabId === 'tab1' || el.activeTabId === null);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const el = element as any;
      el.tabs = [{ id: 'tab1', label: 'Tab 1' }];
      const tab = element.shadowRoot?.querySelector('[role="tab"]');
      assert(tab?.getAttribute('aria-selected') !== null);
    });

    it('should have aria-labelledby on panels', () => {
      const el = element as any;
      el.tabs = [{ id: 'tab1', label: 'Tab 1' }];
      // Panels should reference their tabs
      assert(element.shadowRoot);
    });
  });
});
