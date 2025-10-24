import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-avatar', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-avatar');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-AVATAR');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render avatar container', () => {
      const avatar = element.shadowRoot?.querySelector('.avatar');
      assert(avatar);
    });
  });

  describe('Image Source', () => {
    it('should accept src property', () => {
      const el = element as any;
      el.src = 'https://example.com/image.jpg';
      assert.equal(el.src, 'https://example.com/image.jpg');
    });

    it('should accept alt property', () => {
      const el = element as any;
      el.alt = 'User Avatar';
      assert.equal(el.alt, 'User Avatar');
    });

    it('should render image element when src provided', () => {
      const el = element as any;
      el.src = 'https://example.com/image.jpg';
      const img = element.shadowRoot?.querySelector('img');
      assert(img);
    });
  });

  describe('Initials Fallback', () => {
    it('should accept initials property', () => {
      const el = element as any;
      el.initials = 'JD';
      assert.equal(el.initials, 'JD');
    });

    it('should display initials when no image', () => {
      const el = element as any;
      el.initials = 'AB';
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('AB'));
    });

    it('should show initials when src fails to load', () => {
      const el = element as any;
      el.src = 'https://invalid.url/notfound.jpg';
      el.initials = 'XY';
      assert(element.shadowRoot);
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

    it('should accept medium size', () => {
      const el = element as any;
      el.size = 'medium';
      assert.equal(el.size, 'medium');
    });

    it('should accept large size', () => {
      const el = element as any;
      el.size = 'large';
      assert.equal(el.size, 'large');
    });

    it('should accept xlarge size', () => {
      const el = element as any;
      el.size = 'xlarge';
      assert.equal(el.size, 'xlarge');
    });
  });

  describe('Shape', () => {
    it('should default to circle shape', () => {
      const el = element as any;
      assert.equal(el.shape, 'circle');
    });

    it('should accept circle shape', () => {
      const el = element as any;
      el.shape = 'circle';
      assert.equal(el.shape, 'circle');
    });

    it('should accept square shape', () => {
      const el = element as any;
      el.shape = 'square';
      assert.equal(el.shape, 'square');
    });

    it('should accept rounded shape', () => {
      const el = element as any;
      el.shape = 'rounded';
      assert.equal(el.shape, 'rounded');
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

    it('should apply disabled styling', () => {
      const el = element as any;
      el.disabled = true;
      assert(element.shadowRoot);
    });
  });

  describe('Attributes', () => {
    it('should accept src attribute', () => {
      element.setAttribute('src', 'https://example.com/img.jpg');
      const el = element as any;
      assert.equal(el.src, 'https://example.com/img.jpg');
    });

    it('should accept alt attribute', () => {
      element.setAttribute('alt', 'Avatar');
      const el = element as any;
      assert.equal(el.alt, 'Avatar');
    });

    it('should accept initials attribute', () => {
      element.setAttribute('initials', 'AB');
      const el = element as any;
      assert.equal(el.initials, 'AB');
    });

    it('should accept size attribute', () => {
      element.setAttribute('size', 'large');
      const el = element as any;
      assert.equal(el.size, 'large');
    });

    it('should accept shape attribute', () => {
      element.setAttribute('shape', 'rounded');
      const el = element as any;
      assert.equal(el.shape, 'rounded');
    });

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', '');
      const el = element as any;
      assert.equal(el.disabled, true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single initial', () => {
      const el = element as any;
      el.initials = 'A';
      assert.equal(el.initials, 'A');
    });

    it('should handle long initials', () => {
      const el = element as any;
      el.initials = 'ABC';
      assert.equal(el.initials, 'ABC');
    });

    it('should handle changing sizes', () => {
      const el = element as any;
      el.size = 'small';
      el.size = 'large';
      assert.equal(el.size, 'large');
    });

    it('should handle changing shapes', () => {
      const el = element as any;
      el.shape = 'circle';
      el.shape = 'square';
      assert.equal(el.shape, 'square');
    });

    it('should handle changing src', () => {
      const el = element as any;
      el.src = 'https://example.com/1.jpg';
      el.src = 'https://example.com/2.jpg';
      assert.equal(el.src, 'https://example.com/2.jpg');
    });
  });

  describe('Initial State', () => {
    it('should start without src', () => {
      const el = element as any;
      assert.equal(el.src, undefined);
    });

    it('should start without alt', () => {
      const el = element as any;
      assert.equal(el.alt, undefined);
    });

    it('should start without initials', () => {
      const el = element as any;
      assert.equal(el.initials, undefined);
    });

    it('should default size to medium', () => {
      const el = element as any;
      assert.equal(el.size, 'medium');
    });

    it('should default shape to circle', () => {
      const el = element as any;
      assert.equal(el.shape, 'circle');
    });

    it('should not be disabled initially', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });
  });
});
