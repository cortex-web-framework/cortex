import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-divider', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-divider');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-DIVIDER');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render divider line', () => {
      const divider = element.shadowRoot?.querySelector('.divider');
      assert(divider);
    });
  });

  describe('Orientation', () => {
    it('should default to horizontal', () => {
      const el = element as any;
      assert.equal(el.orientation, 'horizontal');
    });

    it('should accept horizontal orientation', () => {
      const el = element as any;
      el.orientation = 'horizontal';
      assert.equal(el.orientation, 'horizontal');
    });

    it('should accept vertical orientation', () => {
      const el = element as any;
      el.orientation = 'vertical';
      assert.equal(el.orientation, 'vertical');
    });

    it('should render with correct orientation', () => {
      const el = element as any;
      el.orientation = 'vertical';
      const divider = element.shadowRoot?.querySelector('.divider');
      assert(divider);
    });
  });

  describe('Variants', () => {
    it('should default to default variant', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should accept default variant', () => {
      const el = element as any;
      el.variant = 'default';
      assert.equal(el.variant, 'default');
    });

    it('should accept dashed variant', () => {
      const el = element as any;
      el.variant = 'dashed';
      assert.equal(el.variant, 'dashed');
    });

    it('should accept dotted variant', () => {
      const el = element as any;
      el.variant = 'dotted';
      assert.equal(el.variant, 'dotted');
    });
  });

  describe('Text Content', () => {
    it('should accept text property', () => {
      const el = element as any;
      el.text = 'Divider Label';
      assert.equal(el.text, 'Divider Label');
    });

    it('should display text', () => {
      const el = element as any;
      el.text = 'Section Break';
      const dividerText = element.shadowRoot?.querySelector('.divider-text');
      assert(dividerText);
    });

    it('should not display text by default', () => {
      const el = element as any;
      assert.equal(el.text, undefined);
    });
  });

  describe('Attributes', () => {
    it('should accept orientation attribute', () => {
      element.setAttribute('orientation', 'vertical');
      const el = element as any;
      assert.equal(el.orientation, 'vertical');
    });

    it('should accept variant attribute', () => {
      element.setAttribute('variant', 'dashed');
      const el = element as any;
      assert.equal(el.variant, 'dashed');
    });

    it('should accept text attribute', () => {
      element.setAttribute('text', 'Label');
      const el = element as any;
      assert.equal(el.text, 'Label');
    });
  });

  describe('Accessibility', () => {
    it('should have role=separator', () => {
      const divider = element.shadowRoot?.querySelector('[role="separator"]');
      assert(divider);
    });

    it('should have aria-orientation', () => {
      const el = element as any;
      el.orientation = 'vertical';
      const divider = element.shadowRoot?.querySelector('[role="separator"]');
      assert(divider?.getAttribute('aria-orientation'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle changing orientation', () => {
      const el = element as any;
      el.orientation = 'vertical';
      el.orientation = 'horizontal';
      assert.equal(el.orientation, 'horizontal');
    });

    it('should handle changing variant', () => {
      const el = element as any;
      el.variant = 'dashed';
      el.variant = 'dotted';
      assert.equal(el.variant, 'dotted');
    });

    it('should handle long text', () => {
      const el = element as any;
      el.text = 'A'.repeat(100);
      assert.equal(el.text.length, 100);
    });

    it('should handle empty text', () => {
      const el = element as any;
      el.text = '';
      assert.equal(el.text, '');
    });
  });

  describe('Initial State', () => {
    it('should default orientation to horizontal', () => {
      const el = element as any;
      assert.equal(el.orientation, 'horizontal');
    });

    it('should default variant to default', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should start without text', () => {
      const el = element as any;
      assert.equal(el.text, undefined);
    });
  });
});
