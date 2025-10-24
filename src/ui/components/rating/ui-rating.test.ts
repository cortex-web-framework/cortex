import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-rating', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-rating');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-RATING');
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
      el.value = 3;
      assert.equal(el.value, 3);
    });

    it('should update value attribute', () => {
      const el = element as any;
      el.value = 4;
      assert.equal(element.getAttribute('value'), '4');
    });
  });

  describe('Max Value Property', () => {
    it('should default maxValue to 5', () => {
      const el = element as any;
      assert.equal(el.maxValue, 5);
    });

    it('should accept maxValue property', () => {
      const el = element as any;
      el.maxValue = 10;
      assert.equal(el.maxValue, 10);
    });
  });

  describe('Readonly Property', () => {
    it('should not be readonly by default', () => {
      const el = element as any;
      assert.equal(el.readonly, false);
    });

    it('should accept readonly property', () => {
      const el = element as any;
      el.readonly = true;
      assert.equal(el.readonly, true);
    });
  });

  describe('Size Property', () => {
    it('should default to medium size', () => {
      const el = element as any;
      assert.equal(el.size, 'medium');
    });

    it('should accept size property', () => {
      const el = element as any;
      el.size = 'large';
      assert.equal(el.size, 'large');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero value', () => {
      const el = element as any;
      el.value = 0;
      assert.equal(el.value, 0);
    });

    it('should handle max value', () => {
      const el = element as any;
      el.value = 5;
      el.maxValue = 5;
      assert.equal(el.value, 5);
    });

    it('should handle changing value', () => {
      const el = element as any;
      el.value = 2;
      el.value = 4;
      assert.equal(el.value, 4);
    });
  });

  describe('Initial State', () => {
    it('should default value to 0', () => {
      const el = element as any;
      assert.equal(el.value, 0);
    });

    it('should default maxValue to 5', () => {
      const el = element as any;
      assert.equal(el.maxValue, 5);
    });

    it('should not be readonly', () => {
      const el = element as any;
      assert.equal(el.readonly, false);
    });
  });
});
