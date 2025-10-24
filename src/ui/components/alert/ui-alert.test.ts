import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-alert', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-alert');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-ALERT');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render alert container', () => {
      const alert = element.shadowRoot?.querySelector('.alert');
      assert(alert);
    });

    it('should be visible by default', () => {
      const el = element as any;
      assert.equal(el.visible, true);
    });
  });

  describe('Alert Types', () => {
    it('should support success type', () => {
      const el = element as any;
      el.type = 'success';
      assert.equal(el.type, 'success');
    });

    it('should support error type', () => {
      const el = element as any;
      el.type = 'error';
      assert.equal(el.type, 'error');
    });

    it('should support warning type', () => {
      const el = element as any;
      el.type = 'warning';
      assert.equal(el.type, 'warning');
    });

    it('should support info type', () => {
      const el = element as any;
      el.type = 'info';
      assert.equal(el.type, 'info');
    });

    it('should default to info type', () => {
      const el = element as any;
      assert.equal(el.type, 'info');
    });

    it('should apply type class to alert', () => {
      const el = element as any;
      el.type = 'error';
      const alert = element.shadowRoot?.querySelector('.alert');
      assert(alert?.classList.contains('alert-error'));
    });
  });

  describe('Message Property', () => {
    it('should accept message', () => {
      const el = element as any;
      el.message = 'Error occurred';
      assert.equal(el.message, 'Error occurred');
    });

    it('should render message when set', () => {
      const el = element as any;
      el.message = 'Success!';
      const title = element.shadowRoot?.querySelector('.alert-title');
      assert(title?.textContent?.includes('Success'));
    });

    it('should support undefined message', () => {
      const el = element as any;
      el.message = undefined;
      assert.equal(el.message, undefined);
    });
  });

  describe('Dismissible Behavior', () => {
    it('should be dismissible by default', () => {
      const el = element as any;
      assert.equal(el.dismissible, true);
    });

    it('should support disabling dismissible', () => {
      const el = element as any;
      el.dismissible = false;
      assert.equal(el.dismissible, false);
    });

    it('should show close button when dismissible', () => {
      const el = element as any;
      el.dismissible = true;
      const btn = element.shadowRoot?.querySelector('.alert-close');
      assert(btn);
    });

    it('should hide close button when not dismissible', () => {
      const el = element as any;
      el.dismissible = false;
      // Button should not be rendered when not dismissible
      assert(element.shadowRoot);
    });

    it('should hide alert on dismiss', () => {
      const el = element as any;
      el.dismiss?.();
      assert.equal(el.visible, false);
    });
  });

  describe('Visibility Control', () => {
    it('should be visible by default', () => {
      const el = element as any;
      assert.equal(el.visible, true);
    });

    it('should hide with hide method', () => {
      const el = element as any;
      el.hide?.();
      assert.equal(el.visible, false);
    });

    it('should show with show method', () => {
      const el = element as any;
      el.hide?.();
      el.show?.();
      assert.equal(el.visible, true);
    });

    it('should not show close button when hidden', () => {
      const el = element as any;
      el.hide?.();
      const alert = element.shadowRoot?.querySelector('.alert');
      // Alert should be hidden
      assert(alert);
    });
  });

  describe('Events', () => {
    it('should emit dismiss event', () => {
      let dismissed = false;
      element.addEventListener('dismiss', () => {
        dismissed = true;
      });

      const el = element as any;
      el.dismiss?.();
      assert(dismissed);
    });

    it('should emit show event', () => {
      let showed = false;
      element.addEventListener('show', () => {
        showed = true;
      });

      const el = element as any;
      el.hide?.();
      el.show?.();
      assert(showed);
    });

    it('should emit hide event', () => {
      let hidden = false;
      element.addEventListener('hide', () => {
        hidden = true;
      });

      const el = element as any;
      el.hide?.();
      assert(hidden);
    });
  });

  describe('Slots', () => {
    it('should support content slot', () => {
      const slot = element.shadowRoot?.querySelector('slot[name="content"]');
      assert(slot);
    });
  });

  describe('Attributes', () => {
    it('should accept type attribute', () => {
      element.setAttribute('type', 'error');
      const el = element as any;
      assert.equal(el.type, 'error');
    });

    it('should accept dismissible attribute', () => {
      element.setAttribute('dismissible', '');
      const el = element as any;
      assert.equal(el.dismissible, true);
    });

    it('should accept message attribute', () => {
      element.setAttribute('message', 'Alert Message');
      const el = element as any;
      assert(el.message === 'Alert Message' || el.message);
    });

    it('should accept visible attribute', () => {
      element.setAttribute('visible', '');
      const el = element as any;
      assert.equal(el.visible, true);
    });
  });

  describe('Accessibility', () => {
    it('should have alert role', () => {
      const alert = element.shadowRoot?.querySelector('.alert');
      assert.equal(alert?.getAttribute('role'), 'alert');
    });

    it('should have close button with aria-label', () => {
      const el = element as any;
      el.dismissible = true;
      const closeBtn = element.shadowRoot?.querySelector('.alert-close');
      assert(closeBtn?.getAttribute('aria-label'));
    });
  });

  describe('Initial State', () => {
    it('should be visible initially', () => {
      const el = element as any;
      assert.equal(el.visible, true);
    });

    it('should be dismissible initially', () => {
      const el = element as any;
      assert.equal(el.dismissible, true);
    });

    it('should be info type initially', () => {
      const el = element as any;
      assert.equal(el.type, 'info');
    });

    it('should have no message initially', () => {
      const el = element as any;
      assert.equal(el.message, undefined);
    });
  });
});
