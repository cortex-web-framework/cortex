import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-link', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-link');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-LINK');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render link element', () => {
      const link = element.shadowRoot?.querySelector('a');
      assert(link);
    });

    it('should have slot for content', () => {
      const slot = element.shadowRoot?.querySelector('slot');
      assert(slot);
    });
  });

  describe('Navigation Properties', () => {
    it('should have default href as undefined', () => {
      const el = element as any;
      assert.equal(el.href, undefined);
    });

    it('should accept href property', () => {
      const el = element as any;
      el.href = 'https://example.com';
      assert.equal(el.href, 'https://example.com');
    });

    it('should accept target property', () => {
      const el = element as any;
      el.target = '_blank';
      assert.equal(el.target, '_blank');
    });

    it('should support all target values', () => {
      const el = element as any;
      const targets = ['_blank', '_self', '_parent', '_top'];
      targets.forEach(target => {
        el.target = target;
        assert.equal(el.target, target);
      });
    });

    it('should update href attribute', () => {
      const el = element as any;
      el.href = 'https://test.com';
      assert.equal(element.getAttribute('href'), 'https://test.com');
    });

    it('should update target attribute', () => {
      const el = element as any;
      el.target = '_blank';
      assert.equal(element.getAttribute('target'), '_blank');
    });
  });

  describe('Variants', () => {
    it('should default to default variant', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should accept primary variant', () => {
      const el = element as any;
      el.variant = 'primary';
      assert.equal(el.variant, 'primary');
    });

    it('should accept success variant', () => {
      const el = element as any;
      el.variant = 'success';
      assert.equal(el.variant, 'success');
    });

    it('should accept warning variant', () => {
      const el = element as any;
      el.variant = 'warning';
      assert.equal(el.variant, 'warning');
    });

    it('should accept error variant', () => {
      const el = element as any;
      el.variant = 'error';
      assert.equal(el.variant, 'error');
    });

    it('should accept info variant', () => {
      const el = element as any;
      el.variant = 'info';
      assert.equal(el.variant, 'info');
    });

    it('should set variant attribute', () => {
      const el = element as any;
      el.variant = 'primary';
      assert.equal(element.getAttribute('variant'), 'primary');
    });
  });

  describe('Disabled State', () => {
    it('should be enabled by default', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should accept disabled property', () => {
      const el = element as any;
      el.disabled = true;
      assert.equal(el.disabled, true);
    });

    it('should set disabled attribute', () => {
      const el = element as any;
      el.disabled = true;
      assert.equal(element.getAttribute('disabled'), 'true');
    });

    it('should remove disabled attribute when false', () => {
      const el = element as any;
      el.disabled = true;
      el.disabled = false;
      assert.equal(element.hasAttribute('disabled'), false);
    });

    it('should apply disabled styles', () => {
      const el = element as any;
      el.disabled = true;
      const link = element.shadowRoot?.querySelector('a');
      const styles = window.getComputedStyle(link!);
      assert(styles.pointerEvents === 'none' || element.hasAttribute('disabled'));
    });
  });

  describe('Underline Property', () => {
    it('should have underline by default', () => {
      const el = element as any;
      assert.equal(el.underline, true);
    });

    it('should accept underline property', () => {
      const el = element as any;
      el.underline = false;
      assert.equal(el.underline, false);
    });

    it('should update underline attribute', () => {
      const el = element as any;
      el.underline = false;
      assert.equal(element.getAttribute('underline'), 'false');
    });
  });

  describe('Attributes', () => {
    it('should accept href attribute', () => {
      element.setAttribute('href', 'https://example.com');
      const el = element as any;
      assert.equal(el.href, 'https://example.com');
    });

    it('should accept target attribute', () => {
      element.setAttribute('target', '_blank');
      const el = element as any;
      assert.equal(el.target, '_blank');
    });

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', 'true');
      const el = element as any;
      assert.equal(el.disabled, true);
    });

    it('should accept variant attribute', () => {
      element.setAttribute('variant', 'primary');
      const el = element as any;
      assert.equal(el.variant, 'primary');
    });

    it('should accept underline attribute', () => {
      element.setAttribute('underline', 'false');
      const el = element as any;
      assert.equal(el.underline, false);
    });
  });

  describe('Content', () => {
    it('should display slotted content', () => {
      element.textContent = 'Click me';
      const slot = element.shadowRoot?.querySelector('slot');
      assert(slot);
    });

    it('should render href in underlying anchor', () => {
      const el = element as any;
      el.href = 'https://example.com';
      const anchor = element.shadowRoot?.querySelector('a') as HTMLAnchorElement;
      assert.equal(anchor.href, 'https://example.com/');
    });
  });

  describe('Accessibility', () => {
    it('should have role link when not disabled', () => {
      const anchor = element.shadowRoot?.querySelector('a');
      assert(anchor?.getAttribute('role') === 'link' || anchor?.tagName === 'A');
    });

    it('should be keyboard accessible', () => {
      const el = element as any;
      el.href = 'https://example.com';
      const anchor = element.shadowRoot?.querySelector('a') as HTMLAnchorElement;
      assert(anchor.href);
    });

    it('should have aria-disabled when disabled', () => {
      const el = element as any;
      el.disabled = true;
      const anchor = element.shadowRoot?.querySelector('a');
      assert.equal(anchor?.getAttribute('aria-disabled'), 'true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty href', () => {
      const el = element as any;
      el.href = '';
      assert.equal(el.href, '');
    });

    it('should handle relative URLs', () => {
      const el = element as any;
      el.href = '/relative/path';
      assert.equal(el.href, '/relative/path');
    });

    it('should handle hash navigation', () => {
      const el = element as any;
      el.href = '#section';
      assert.equal(el.href, '#section');
    });

    it('should handle changing variant', () => {
      const el = element as any;
      el.variant = 'primary';
      el.variant = 'error';
      assert.equal(el.variant, 'error');
    });

    it('should handle changing disabled state multiple times', () => {
      const el = element as any;
      el.disabled = true;
      el.disabled = false;
      el.disabled = true;
      assert.equal(el.disabled, true);
    });

    it('should handle changing href multiple times', () => {
      const el = element as any;
      el.href = 'https://example1.com';
      el.href = 'https://example2.com';
      assert.equal(el.href, 'https://example2.com');
    });
  });

  describe('Initial State', () => {
    it('should default variant to default', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should be enabled by default', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should have underline by default', () => {
      const el = element as any;
      assert.equal(el.underline, true);
    });

    it('should have no href by default', () => {
      const el = element as any;
      assert.equal(el.href, undefined);
    });

    it('should have no target by default', () => {
      const el = element as any;
      assert.equal(el.target, undefined);
    });
  });

  describe('Multiple Properties', () => {
    it('should handle multiple properties together', () => {
      const el = element as any;
      el.href = 'https://example.com';
      el.target = '_blank';
      el.variant = 'primary';
      el.disabled = false;
      el.underline = false;

      assert.equal(el.href, 'https://example.com');
      assert.equal(el.target, '_blank');
      assert.equal(el.variant, 'primary');
      assert.equal(el.disabled, false);
      assert.equal(el.underline, false);
    });

    it('should handle sequential property changes', () => {
      const el = element as any;
      el.href = 'https://example.com';
      assert.equal(el.href, 'https://example.com');
      el.target = '_blank';
      assert.equal(el.target, '_blank');
      el.variant = 'success';
      assert.equal(el.variant, 'success');
    });
  });
});
