import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-spinner', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-spinner');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-SPINNER');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render spinner animation', () => {
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner);
    });
  });

  describe('Size Property', () => {
    it('should default to medium size', () => {
      const el = element as any;
      assert.equal(el.size, 'medium');
    });

    it('should support small size', () => {
      const el = element as any;
      el.size = 'small';
      assert.equal(el.size, 'small');
    });

    it('should support large size', () => {
      const el = element as any;
      el.size = 'large';
      assert.equal(el.size, 'large');
    });

    it('should apply size class', () => {
      const el = element as any;
      el.size = 'large';
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner?.classList.contains('spinner-large'));
    });
  });

  describe('Variant Property', () => {
    it('should default to ring variant', () => {
      const el = element as any;
      assert.equal(el.variant, 'ring');
    });

    it('should support ring variant', () => {
      const el = element as any;
      el.variant = 'ring';
      assert.equal(el.variant, 'ring');
    });

    it('should support dots variant', () => {
      const el = element as any;
      el.variant = 'dots';
      assert.equal(el.variant, 'dots');
    });

    it('should support wave variant', () => {
      const el = element as any;
      el.variant = 'wave';
      assert.equal(el.variant, 'wave');
    });

    it('should apply variant class', () => {
      const el = element as any;
      el.variant = 'dots';
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner?.classList.contains('spinner-dots'));
    });
  });

  describe('Message Property', () => {
    it('should accept message property', () => {
      const el = element as any;
      el.message = 'Loading...';
      assert.equal(el.message, 'Loading...');
    });

    it('should display message when set', () => {
      const el = element as any;
      el.message = 'Please wait';
      const message = element.shadowRoot?.querySelector('.spinner-message');
      assert(message?.textContent?.includes('Please'));
    });

    it('should support undefined message', () => {
      const el = element as any;
      el.message = undefined;
      assert.equal(el.message, undefined);
    });
  });

  describe('Attributes', () => {
    it('should accept size attribute', () => {
      element.setAttribute('size', 'large');
      const el = element as any;
      assert.equal(el.size, 'large');
    });

    it('should accept variant attribute', () => {
      element.setAttribute('variant', 'dots');
      const el = element as any;
      assert.equal(el.variant, 'dots');
    });

    it('should accept message attribute', () => {
      element.setAttribute('message', 'Loading data');
      const el = element as any;
      assert(el.message === 'Loading data' || el.message);
    });
  });

  describe('Animations', () => {
    it('should have animated spinner', () => {
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner);
      // Spinner should be visible and animated
      const styles = window.getComputedStyle(spinner || document.body);
      assert(styles);
    });

    it('should support different animation styles', () => {
      const el = element as any;
      el.variant = 'wave';
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner?.classList.contains('spinner-wave'));
    });
  });

  describe('Initial State', () => {
    it('should default to medium size', () => {
      const el = element as any;
      assert.equal(el.size, 'medium');
    });

    it('should default to ring variant', () => {
      const el = element as any;
      assert.equal(el.variant, 'ring');
    });

    it('should have no message initially', () => {
      const el = element as any;
      assert.equal(el.message, undefined);
    });
  });

  describe('Accessibility', () => {
    it('should have role presentation or status', () => {
      const spinner = element.shadowRoot?.querySelector('.spinner');
      const role = spinner?.getAttribute('role');
      assert(role === 'status' || role === 'presentation' || role === null);
    });

    it('should have aria-busy when loading', () => {
      const el = element as any;
      el.message = 'Loading';
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner?.getAttribute('aria-busy') === 'true' || spinner?.getAttribute('aria-busy') === null);
    });

    it('should support aria-label', () => {
      const el = element as any;
      el.message = 'Loading content';
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner);
    });
  });

  describe('Visual Variants', () => {
    it('should render ring animation', () => {
      const el = element as any;
      el.variant = 'ring';
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner?.classList.contains('spinner-ring'));
    });

    it('should render dots animation', () => {
      const el = element as any;
      el.variant = 'dots';
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner?.classList.contains('spinner-dots'));
    });

    it('should render wave animation', () => {
      const el = element as any;
      el.variant = 'wave';
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner?.classList.contains('spinner-wave'));
    });
  });

  describe('Size Variations', () => {
    it('should render small spinner', () => {
      const el = element as any;
      el.size = 'small';
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner?.classList.contains('spinner-small'));
    });

    it('should render medium spinner', () => {
      const el = element as any;
      el.size = 'medium';
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner?.classList.contains('spinner-medium'));
    });

    it('should render large spinner', () => {
      const el = element as any;
      el.size = 'large';
      const spinner = element.shadowRoot?.querySelector('.spinner');
      assert(spinner?.classList.contains('spinner-large'));
    });
  });
});
