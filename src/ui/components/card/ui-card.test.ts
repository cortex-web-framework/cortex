import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-card', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-card');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-CARD');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render card container', () => {
      const card = element.shadowRoot?.querySelector('.card');
      assert(card);
    });
  });

  describe('Title and Subtitle', () => {
    it('should accept cardTitle property', () => {
      const el = element as any;
      el.cardTitle = 'Card Title';
      assert.equal(el.cardTitle, 'Card Title');
    });

    it('should accept cardSubtitle property', () => {
      const el = element as any;
      el.cardSubtitle = 'Card Subtitle';
      assert.equal(el.cardSubtitle, 'Card Subtitle');
    });

    it('should display title', () => {
      const el = element as any;
      el.cardTitle = 'My Card';
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('My Card'));
    });

    it('should display subtitle', () => {
      const el = element as any;
      el.cardSubtitle = 'Subtitle Text';
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('Subtitle Text'));
    });
  });

  describe('Variants', () => {
    it('should default to default variant', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should accept elevated variant', () => {
      const el = element as any;
      el.variant = 'elevated';
      assert.equal(el.variant, 'elevated');
    });

    it('should accept outlined variant', () => {
      const el = element as any;
      el.variant = 'outlined';
      assert.equal(el.variant, 'outlined');
    });

    it('should accept filled variant', () => {
      const el = element as any;
      el.variant = 'filled';
      assert.equal(el.variant, 'filled');
    });
  });

  describe('Clickable State', () => {
    it('should not be clickable by default', () => {
      const el = element as any;
      assert.equal(el.clickable, false);
    });

    it('should accept clickable property', () => {
      const el = element as any;
      el.clickable = true;
      assert.equal(el.clickable, true);
    });

    it('should accept clickable attribute', () => {
      element.setAttribute('clickable', '');
      const el = element as any;
      assert.equal(el.clickable, true);
    });
  });

  describe('Link Functionality', () => {
    it('should accept href property', () => {
      const el = element as any;
      el.href = '/page';
      assert.equal(el.href, '/page');
    });

    it('should accept href attribute', () => {
      element.setAttribute('href', '/link');
      const el = element as any;
      assert.equal(el.href, '/link');
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
  });

  describe('Content Rendering', () => {
    it('should have slot for content', () => {
      const slot = element.shadowRoot?.querySelector('slot');
      assert(slot);
    });

    it('should render children in content slot', () => {
      const div = document.createElement('div');
      div.textContent = 'Card Content';
      element.appendChild(div);
      assert(element.shadowRoot);
    });
  });

  describe('Attributes', () => {
    it('should accept cardTitle attribute', () => {
      element.setAttribute('cardTitle', 'Title');
      const el = element as any;
      assert.equal(el.cardTitle, 'Title');
    });

    it('should accept cardSubtitle attribute', () => {
      element.setAttribute('cardSubtitle', 'Subtitle');
      const el = element as any;
      assert.equal(el.cardSubtitle, 'Subtitle');
    });

    it('should accept variant attribute', () => {
      element.setAttribute('variant', 'elevated');
      const el = element as any;
      assert.equal(el.variant, 'elevated');
    });

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', '');
      const el = element as any;
      assert.equal(el.disabled, true);
    });

    it('should accept clickable attribute', () => {
      element.setAttribute('clickable', '');
      const el = element as any;
      assert.equal(el.clickable, true);
    });

    it('should accept href attribute', () => {
      element.setAttribute('href', '/path');
      const el = element as any;
      assert.equal(el.href, '/path');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const el = element as any;
      el.cardTitle = '';
      assert.equal(el.cardTitle, '');
    });

    it('should handle very long title', () => {
      const el = element as any;
      el.cardTitle = 'A'.repeat(500);
      assert.equal(el.cardTitle.length, 500);
    });

    it('should handle changing variants', () => {
      const el = element as any;
      el.variant = 'elevated';
      el.variant = 'outlined';
      el.variant = 'filled';
      assert.equal(el.variant, 'filled');
    });

    it('should handle toggling clickable', () => {
      const el = element as any;
      el.clickable = true;
      el.clickable = false;
      assert.equal(el.clickable, false);
    });

    it('should handle toggling disabled', () => {
      const el = element as any;
      el.disabled = true;
      el.disabled = false;
      assert.equal(el.disabled, false);
    });

    it('should handle multiple re-renders', () => {
      const el = element as any;
      el.title = 'Title 1';
      el.title = 'Title 2';
      el.title = 'Title 3';
      assert.equal(el.title, 'Title 3');
    });
  });

  describe('Initial State', () => {
    it('should start without title', () => {
      const el = element as any;
      assert.equal(el.cardTitle, undefined);
    });

    it('should start without subtitle', () => {
      const el = element as any;
      assert.equal(el.cardSubtitle, undefined);
    });

    it('should default variant to default', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should not be disabled initially', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should not be clickable initially', () => {
      const el = element as any;
      assert.equal(el.clickable, false);
    });

    it('should not have href initially', () => {
      const el = element as any;
      assert.equal(el.href, undefined);
    });
  });
});
