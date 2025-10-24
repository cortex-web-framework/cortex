import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-tag', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-tag');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-TAG');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should have tag element', () => {
      const tag = element.shadowRoot?.querySelector('.tag');
      assert(tag);
    });
  });

  describe('Label Property', () => {
    it('should have default label as undefined', () => {
      const el = element as any;
      assert.equal(el.label, undefined);
    });

    it('should accept label property', () => {
      const el = element as any;
      el.label = 'New';
      assert.equal(el.label, 'New');
    });

    it('should update label attribute', () => {
      const el = element as any;
      el.label = 'Feature';
      assert.equal(element.getAttribute('label'), 'Feature');
    });
  });

  describe('Variant Property', () => {
    it('should default to default variant', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should accept all variants', () => {
      const el = element as any;
      const variants = ['default', 'primary', 'success', 'warning', 'error', 'info'];
      variants.forEach(v => {
        el.variant = v;
        assert.equal(el.variant, v);
      });
    });
  });

  describe('Size Property', () => {
    it('should default to medium size', () => {
      const el = element as any;
      assert.equal(el.size, 'medium');
    });

    it('should accept small size', () => {
      const el = element as any;
      el.size = 'small';
      assert.equal(el.size, 'small');
    });

    it('should accept large size', () => {
      const el = element as any;
      el.size = 'large';
      assert.equal(el.size, 'large');
    });
  });

  describe('Closable Property', () => {
    it('should not be closable by default', () => {
      const el = element as any;
      assert.equal(el.closable, false);
    });

    it('should accept closable property', () => {
      const el = element as any;
      el.closable = true;
      assert.equal(el.closable, true);
    });
  });

  describe('Attributes', () => {
    it('should accept label attribute', () => {
      element.setAttribute('label', 'Hot');
      const el = element as any;
      assert.equal(el.label, 'Hot');
    });

    it('should accept variant attribute', () => {
      element.setAttribute('variant', 'success');
      const el = element as any;
      assert.equal(el.variant, 'success');
    });

    it('should accept size attribute', () => {
      element.setAttribute('size', 'large');
      const el = element as any;
      assert.equal(el.size, 'large');
    });

    it('should accept closable attribute', () => {
      element.setAttribute('closable', 'true');
      const el = element as any;
      assert.equal(el.closable, true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty label', () => {
      const el = element as any;
      el.label = '';
      assert.equal(el.label, '');
    });

    it('should handle special characters', () => {
      const el = element as any;
      el.label = 'v1.0-beta';
      assert.equal(el.label, 'v1.0-beta');
    });

    it('should handle changing properties', () => {
      const el = element as any;
      el.label = 'First';
      el.variant = 'primary';
      el.size = 'large';
      assert.equal(el.label, 'First');
      assert.equal(el.variant, 'primary');
      assert.equal(el.size, 'large');
    });
  });

  describe('Initial State', () => {
    it('should default variant to default', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should default size to medium', () => {
      const el = element as any;
      assert.equal(el.size, 'medium');
    });

    it('should not be closable by default', () => {
      const el = element as any;
      assert.equal(el.closable, false);
    });
  });

  describe('Multiple Properties', () => {
    it('should handle multiple properties', () => {
      const el = element as any;
      el.label = 'Important';
      el.variant = 'error';
      el.size = 'small';
      el.closable = true;

      assert.equal(el.label, 'Important');
      assert.equal(el.variant, 'error');
      assert.equal(el.size, 'small');
      assert.equal(el.closable, true);
    });
  });
});
