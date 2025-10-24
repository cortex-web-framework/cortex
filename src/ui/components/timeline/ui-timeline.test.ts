import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-timeline', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-timeline');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-TIMELINE');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });
  });

  describe('Items Property', () => {
    it('should have empty items by default', () => {
      const el = element as any;
      assert(Array.isArray(el.items));
      assert.equal(el.items.length, 0);
    });

    it('should accept items property', () => {
      const el = element as any;
      el.items = [{ id: '1', title: 'Step 1' }, { id: '2', title: 'Step 2' }];
      assert.equal(el.items.length, 2);
    });
  });

  describe('Orientation Property', () => {
    it('should default to vertical orientation', () => {
      const el = element as any;
      assert.equal(el.orientation, 'vertical');
    });

    it('should accept horizontal orientation', () => {
      const el = element as any;
      el.orientation = 'horizontal';
      assert.equal(el.orientation, 'horizontal');
    });
  });

  describe('Methods', () => {
    it('should have addItem method', () => {
      const el = element as any;
      assert(typeof el.addItem === 'function');
    });

    it('should have removeItem method', () => {
      const el = element as any;
      assert(typeof el.removeItem === 'function');
    });

    it('should add items', () => {
      const el = element as any;
      el.addItem({ id: '1', title: 'Item 1' });
      assert.equal(el.items.length, 1);
    });
  });

  describe('Initial State', () => {
    it('should have empty items initially', () => {
      const el = element as any;
      assert.equal(el.items.length, 0);
    });

    it('should default orientation to vertical', () => {
      const el = element as any;
      assert.equal(el.orientation, 'vertical');
    });
  });
});
