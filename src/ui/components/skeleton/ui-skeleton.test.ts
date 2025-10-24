import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-skeleton', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-skeleton');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-SKELETON');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render skeleton', () => {
      const skeleton = element.shadowRoot?.querySelector('.skeleton');
      assert(skeleton);
    });
  });

  describe('Variants', () => {
    it('should default to text variant', () => {
      const el = element as any;
      assert.equal(el.variant, 'text');
    });

    it('should accept circle variant', () => {
      const el = element as any;
      el.variant = 'circle';
      assert.equal(el.variant, 'circle');
    });

    it('should accept rectangle variant', () => {
      const el = element as any;
      el.variant = 'rectangle';
      assert.equal(el.variant, 'rectangle');
    });
  });

  describe('Size Properties', () => {
    it('should accept width property', () => {
      const el = element as any;
      el.width = '200px';
      assert.equal(el.width, '200px');
    });

    it('should accept height property', () => {
      const el = element as any;
      el.height = '40px';
      assert.equal(el.height, '40px');
    });
  });

  describe('Animation', () => {
    it('should animate by default', () => {
      const el = element as any;
      assert.equal(el.animating, true);
    });

    it('should accept animating property', () => {
      const el = element as any;
      el.animating = false;
      assert.equal(el.animating, false);
    });
  });

  describe('Attributes', () => {
    it('should accept variant attribute', () => {
      element.setAttribute('variant', 'circle');
      const el = element as any;
      assert.equal(el.variant, 'circle');
    });

    it('should accept width attribute', () => {
      element.setAttribute('width', '100%');
      const el = element as any;
      assert.equal(el.width, '100%');
    });

    it('should accept height attribute', () => {
      element.setAttribute('height', '16px');
      const el = element as any;
      assert.equal(el.height, '16px');
    });

    it('should accept animate attribute', () => {
      element.setAttribute('animate', 'false');
      const el = element as any;
      assert.equal(el.animating, false);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-busy', () => {
      const skeleton = element.shadowRoot?.querySelector('[aria-busy="true"]');
      assert(skeleton);
    });
  });

  describe('Edge Cases', () => {
    it('should handle changing variants', () => {
      const el = element as any;
      el.variant = 'text';
      el.variant = 'circle';
      assert.equal(el.variant, 'circle');
    });

    it('should handle changing dimensions', () => {
      const el = element as any;
      el.width = '100px';
      el.height = '50px';
      assert.equal(el.width, '100px');
      assert.equal(el.height, '50px');
    });
  });

  describe('Initial State', () => {
    it('should default variant to text', () => {
      const el = element as any;
      assert.equal(el.variant, 'text');
    });

    it('should animate by default', () => {
      const el = element as any;
      assert.equal(el.animating, true);
    });
  });
});
