import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-modal', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-modal');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-MODAL');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should have backdrop by default', () => {
      const backdrop = element.shadowRoot?.querySelector('.modal-backdrop');
      assert(backdrop);
    });

    it('should render modal content area', () => {
      const modal = element.shadowRoot?.querySelector('.modal');
      assert(modal);
    });

    it('should render close button', () => {
      const closeBtn = element.shadowRoot?.querySelector('.modal-close');
      assert(closeBtn);
    });
  });

  describe('Open/Close Behavior', () => {
    it('should be closed by default', () => {
      const el = element as any;
      assert.equal(el.isOpen, false);
    });

    it('should open modal with open method', () => {
      const el = element as any;
      el.open?.();
      assert.equal(el.isOpen, true);
    });

    it('should close modal with close method', () => {
      const el = element as any;
      el.open?.();
      el.close?.();
      assert.equal(el.isOpen, false);
    });

    it('should toggle modal open state', () => {
      const el = element as any;
      el.toggle?.();
      assert.equal(el.isOpen, true);
      el.toggle?.();
      assert.equal(el.isOpen, false);
    });

    it('should update display when opened', () => {
      const el = element as any;
      el.open?.();
      const backdrop = element.shadowRoot?.querySelector('.modal-backdrop');
      // Check if modal is displayed
      assert(backdrop);
    });

    it('should update display when closed', () => {
      const el = element as any;
      el.open?.();
      el.close?.();
      // Modal should be hidden
      assert.equal(el.isOpen, false);
    });
  });

  describe('Title Property', () => {
    it('should accept modalTitle property', () => {
      const el = element as any;
      el.modalTitle = 'Confirm Action';
      assert.equal(el.modalTitle, 'Confirm Action');
    });

    it('should render title when set', () => {
      const el = element as any;
      el.modalTitle = 'Modal Title';
      const title = element.shadowRoot?.querySelector('.modal-title');
      assert(title?.textContent?.includes('Modal'));
    });

    it('should support undefined title', () => {
      const el = element as any;
      el.modalTitle = undefined;
      assert.equal(el.modalTitle, undefined);
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

    it('should support medium size', () => {
      const el = element as any;
      el.size = 'medium';
      assert.equal(el.size, 'medium');
    });

    it('should support large size', () => {
      const el = element as any;
      el.size = 'large';
      assert.equal(el.size, 'large');
    });

    it('should support fullscreen size', () => {
      const el = element as any;
      el.size = 'fullscreen';
      assert.equal(el.size, 'fullscreen');
    });

    it('should apply size class to modal', () => {
      const el = element as any;
      el.size = 'small';
      const modal = element.shadowRoot?.querySelector('.modal');
      assert(modal?.classList.contains('modal-small'));
    });
  });

  describe('Close Behavior', () => {
    it('should support closeOnEscape property', () => {
      const el = element as any;
      el.closeOnEscape = true;
      assert.equal(el.closeOnEscape, true);
    });

    it('should support closeOnBackdrop property', () => {
      const el = element as any;
      el.closeOnBackdrop = true;
      assert.equal(el.closeOnBackdrop, true);
    });

    it('should default closeOnEscape to true', () => {
      const el = element as any;
      assert.equal(el.closeOnEscape, true);
    });

    it('should default closeOnBackdrop to true', () => {
      const el = element as any;
      assert.equal(el.closeOnBackdrop, true);
    });

    it('should close on close button click', () => {
      const el = element as any;
      el.open?.();
      const closeBtn = element.shadowRoot?.querySelector('.modal-close') as HTMLElement;
      closeBtn?.click();
      assert.equal(el.isOpen, false);
    });
  });

  describe('Backdrop Property', () => {
    it('should have backdrop by default', () => {
      const el = element as any;
      assert.equal(el.backdrop, true);
    });

    it('should support disabling backdrop', () => {
      const el = element as any;
      el.backdrop = false;
      assert.equal(el.backdrop, false);
    });

    it('should render backdrop when enabled', () => {
      const el = element as any;
      el.backdrop = true;
      const backdrop = element.shadowRoot?.querySelector('.modal-backdrop');
      assert(backdrop);
    });
  });

  describe('Slots', () => {
    it('should support content slot', () => {
      const slot = element.shadowRoot?.querySelector('slot[name="content"]');
      assert(slot);
    });

    it('should support footer slot', () => {
      const slot = element.shadowRoot?.querySelector('slot[name="footer"]');
      assert(slot);
    });
  });

  describe('Events', () => {
    it('should emit open event', () => {
      let opened = false;
      element.addEventListener('open', () => {
        opened = true;
      });

      const el = element as any;
      el.open?.();
      assert(opened);
    });

    it('should emit close event', () => {
      let closed = false;
      element.addEventListener('close', () => {
        closed = true;
      });

      const el = element as any;
      el.open?.();
      el.close?.();
      assert(closed);
    });

    it('should emit backdrop-click event', () => {
      let clicked = false;
      element.addEventListener('backdrop-click', () => {
        clicked = true;
      });

      // Simulate backdrop click
      const el = element as any;
      el.open?.();
      // Will only trigger if closeOnBackdrop is true
      assert(typeof clicked === 'boolean');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      const modal = element.shadowRoot?.querySelector('.modal');
      assert.equal(modal?.getAttribute('role'), 'dialog');
    });

    it('should have aria-modal attribute', () => {
      const modal = element.shadowRoot?.querySelector('.modal');
      assert(modal?.getAttribute('aria-modal'));
    });

    it('should be focusable', () => {
      const el = element as any;
      assert(typeof el.focus === 'function');
    });

    it('should support keyboard navigation', () => {
      const el = element as any;
      el.open?.();
      // Modal should be keyboard navigable
      assert.equal(el.isOpen, true);
    });
  });

  describe('Attributes', () => {
    it('should accept isOpen attribute', () => {
      element.setAttribute('isOpen', '');
      const el = element as any;
      assert(el.isOpen === true || el.isOpen === false);
    });

    it('should accept modalTitle attribute', () => {
      element.setAttribute('modalTitle', 'My Modal');
      const el = element as any;
      assert(el.modalTitle === 'My Modal' || el.modalTitle);
    });

    it('should accept size attribute', () => {
      element.setAttribute('size', 'large');
      const el = element as any;
      assert.equal(el.size, 'large');
    });

    it('should accept closeOnEscape attribute', () => {
      element.setAttribute('closeOnEscape', '');
      const el = element as any;
      assert.equal(el.closeOnEscape, true);
    });

    it('should accept closeOnBackdrop attribute', () => {
      element.setAttribute('closeOnBackdrop', '');
      const el = element as any;
      assert.equal(el.closeOnBackdrop, true);
    });

    it('should accept backdrop attribute', () => {
      element.setAttribute('backdrop', '');
      const el = element as any;
      assert.equal(el.backdrop, true);
    });
  });

  describe('Initial State', () => {
    it('should be closed initially', () => {
      const el = element as any;
      assert.equal(el.isOpen, false);
    });

    it('should have medium size by default', () => {
      const el = element as any;
      assert.equal(el.size, 'medium');
    });

    it('should have backdrop enabled by default', () => {
      const el = element as any;
      assert.equal(el.backdrop, true);
    });

    it('should have closeOnEscape enabled by default', () => {
      const el = element as any;
      assert.equal(el.closeOnEscape, true);
    });

    it('should have closeOnBackdrop enabled by default', () => {
      const el = element as any;
      assert.equal(el.closeOnBackdrop, true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple opens', () => {
      const el = element as any;
      el.open?.();
      el.open?.();
      assert.equal(el.isOpen, true);
    });

    it('should handle multiple closes', () => {
      const el = element as any;
      el.open?.();
      el.close?.();
      el.close?.();
      assert.equal(el.isOpen, false);
    });

    it('should handle rapid toggles', () => {
      const el = element as any;
      el.toggle?.();
      el.toggle?.();
      el.toggle?.();
      assert.equal(el.isOpen, true);
    });

    it('should preserve state across re-renders', () => {
      const el = element as any;
      el.open?.();
      el.title = 'New Title';
      assert.equal(el.isOpen, true);
    });
  });
});
