import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-carousel', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-carousel');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-CAROUSEL');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });
  });

  describe('Items Property', () => {
    it('should have empty items by default', () => {
      const el = element as any;
      assert(Array.isArray(el.items));
    });

    it('should accept items', () => {
      const el = element as any;
      el.items = [{ src: 'image.jpg' }];
      assert.equal(el.items.length, 1);
    });
  });

  describe('Methods', () => {
    it('should have next method', () => {
      const el = element as any;
      assert(typeof el.next === 'function');
    });

    it('should have prev method', () => {
      const el = element as any;
      assert(typeof el.prev === 'function');
    });

    it('should have goTo method', () => {
      const el = element as any;
      assert(typeof el.goTo === 'function');
    });
  });

  describe('Initial State', () => {
    it('should render successfully', () => {
      const el = element as any;
      assert.equal(el.currentIndex, 0);
    });
  });
});
