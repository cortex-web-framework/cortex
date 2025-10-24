import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-progress-circle', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-progress-circle');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-PROGRESS-CIRCLE');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });
  });

  describe('Value Property', () => {
    it('should default value to 0', () => {
      const el = element as any;
      assert.equal(el.value, 0);
    });

    it('should accept value property', () => {
      const el = element as any;
      el.value = 50;
      assert.equal(el.value, 50);
    });
  });

  describe('Max Value Property', () => {
    it('should default maxValue to 100', () => {
      const el = element as any;
      assert.equal(el.maxValue, 100);
    });

    it('should accept maxValue property', () => {
      const el = element as any;
      el.maxValue = 200;
      assert.equal(el.maxValue, 200);
    });
  });

  describe('Size Property', () => {
    it('should default size to 100', () => {
      const el = element as any;
      assert.equal(el.size, 100);
    });

    it('should accept size property', () => {
      const el = element as any;
      el.size = 150;
      assert.equal(el.size, 150);
    });
  });

  describe('Edge Cases', () => {
    it('should handle full progress', () => {
      const el = element as any;
      el.value = 100;
      el.maxValue = 100;
      assert.equal(el.value, 100);
    });

    it('should handle zero progress', () => {
      const el = element as any;
      el.value = 0;
      assert.equal(el.value, 0);
    });
  });

  describe('Initial State', () => {
    it('should have default value 0', () => {
      const el = element as any;
      assert.equal(el.value, 0);
    });

    it('should have default maxValue 100', () => {
      const el = element as any;
      assert.equal(el.maxValue, 100);
    });
  });
});
