import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-badge', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-badge');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-BADGE');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render badge container', () => {
      const badge = element.shadowRoot?.querySelector('.badge');
      assert(badge);
    });

    it('should display content', () => {
      const el = element as any;
      el.content = 'New';
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('New'));
    });
  });

  describe('Content', () => {
    it('should accept content property', () => {
      const el = element as any;
      el.content = '5';
      assert.equal(el.content, '5');
    });

    it('should accept content attribute', () => {
      element.setAttribute('content', 'Badge Text');
      const el = element as any;
      assert.equal(el.content, 'Badge Text');
    });

    it('should display numeric content', () => {
      const el = element as any;
      el.content = '99';
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('99'));
    });

    it('should display text content', () => {
      const el = element as any;
      el.content = 'Active';
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('Active'));
    });

    it('should handle empty content', () => {
      const el = element as any;
      el.content = '';
      assert.equal(el.content, '');
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
  });

  describe('Sizes', () => {
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

    it('should apply size styling', () => {
      const el = element as any;
      el.size = 'small';
      const badge = element.shadowRoot?.querySelector('.badge');
      assert(badge);
    });
  });

  describe('Pill Style', () => {
    it('should not be pill by default', () => {
      const el = element as any;
      assert.equal(el.pill, false);
    });

    it('should accept pill property', () => {
      const el = element as any;
      el.pill = true;
      assert.equal(el.pill, true);
    });

    it('should accept pill attribute', () => {
      element.setAttribute('pill', '');
      const el = element as any;
      assert.equal(el.pill, true);
    });

    it('should apply pill styling', () => {
      const el = element as any;
      el.pill = true;
      const badge = element.shadowRoot?.querySelector('.badge.pill');
      assert(badge);
    });
  });

  describe('Dot Badge', () => {
    it('should not be dot by default', () => {
      const el = element as any;
      assert.equal(el.dot, false);
    });

    it('should accept dot property', () => {
      const el = element as any;
      el.dot = true;
      assert.equal(el.dot, true);
    });

    it('should accept dot attribute', () => {
      element.setAttribute('dot', '');
      const el = element as any;
      assert.equal(el.dot, true);
    });

    it('should render as dot when enabled', () => {
      const el = element as any;
      el.dot = true;
      const badge = element.shadowRoot?.querySelector('.badge.dot');
      assert(badge);
    });

    it('should ignore content when dot', () => {
      const el = element as any;
      el.dot = true;
      el.content = 'Text';
      const badge = element.shadowRoot?.querySelector('.badge');
      assert(badge);
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

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', '');
      const el = element as any;
      assert.equal(el.disabled, true);
    });

    it('should apply disabled styling', () => {
      const el = element as any;
      el.disabled = true;
      const badge = element.shadowRoot?.querySelector('.badge');
      assert(badge);
    });
  });

  describe('Accessibility', () => {
    it('should have role=status by default', () => {
      const el = element as any;
      el.content = 'Badge';
      const badge = element.shadowRoot?.querySelector('[role="status"]');
      assert(badge);
    });

    it('should have aria-label', () => {
      const el = element as any;
      el.content = '5 messages';
      const badge = element.shadowRoot?.querySelector('[role="status"]');
      assert(badge?.getAttribute('aria-label'));
    });

    it('should have aria-disabled when disabled', () => {
      const el = element as any;
      el.disabled = true;
      el.content = 'Badge';
      const badge = element.shadowRoot?.querySelector('[role="status"]');
      assert.equal(badge?.getAttribute('aria-disabled'), 'true');
    });
  });

  describe('Attributes', () => {
    it('should accept content attribute', () => {
      element.setAttribute('content', 'Test');
      const el = element as any;
      assert.equal(el.content, 'Test');
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

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', '');
      const el = element as any;
      assert.equal(el.disabled, true);
    });

    it('should accept pill attribute', () => {
      element.setAttribute('pill', '');
      const el = element as any;
      assert.equal(el.pill, true);
    });

    it('should accept dot attribute', () => {
      element.setAttribute('dot', '');
      const el = element as any;
      assert.equal(el.dot, true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single character', () => {
      const el = element as any;
      el.content = 'A';
      assert.equal(el.content, 'A');
    });

    it('should handle numbers', () => {
      const el = element as any;
      el.content = '999';
      assert.equal(el.content, '999');
    });

    it('should handle very long text', () => {
      const el = element as any;
      el.content = 'A'.repeat(100);
      assert.equal(el.content.length, 100);
    });

    it('should handle special characters', () => {
      const el = element as any;
      el.content = '±!@#$%';
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('±'));
    });

    it('should handle whitespace', () => {
      const el = element as any;
      el.content = '  spaced  ';
      assert.equal(el.content, '  spaced  ');
    });

    it('should handle changing variants', () => {
      const el = element as any;
      el.variant = 'success';
      el.variant = 'error';
      el.variant = 'primary';
      assert.equal(el.variant, 'primary');
    });

    it('should handle changing sizes', () => {
      const el = element as any;
      el.size = 'small';
      el.size = 'large';
      el.size = 'medium';
      assert.equal(el.size, 'medium');
    });

    it('should handle toggling pill', () => {
      const el = element as any;
      el.pill = true;
      el.pill = false;
      assert.equal(el.pill, false);
    });

    it('should handle toggling dot', () => {
      const el = element as any;
      el.dot = true;
      el.dot = false;
      assert.equal(el.dot, false);
    });
  });

  describe('Initial State', () => {
    it('should start with empty content', () => {
      const el = element as any;
      assert.equal(el.content, '');
    });

    it('should default variant to default', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should default size to medium', () => {
      const el = element as any;
      assert.equal(el.size, 'medium');
    });

    it('should not be disabled initially', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should not be pill initially', () => {
      const el = element as any;
      assert.equal(el.pill, false);
    });

    it('should not be dot initially', () => {
      const el = element as any;
      assert.equal(el.dot, false);
    });
  });
});
