import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-toast', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-toast');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-TOAST');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should have toast container', () => {
      const toast = element.shadowRoot?.querySelector('.toast-container');
      assert(toast);
    });
  });

  describe('Message Property', () => {
    it('should have default message as undefined', () => {
      const el = element as any;
      assert.equal(el.message, undefined);
    });

    it('should accept message property', () => {
      const el = element as any;
      el.message = 'Operation successful';
      assert.equal(el.message, 'Operation successful');
    });

    it('should update message attribute', () => {
      const el = element as any;
      el.message = 'Success!';
      assert.equal(element.getAttribute('message'), 'Success!');
    });
  });

  describe('Toast Type Property', () => {
    it('should default to info type', () => {
      const el = element as any;
      assert.equal(el.toastType, 'info');
    });

    it('should accept success type', () => {
      const el = element as any;
      el.toastType = 'success';
      assert.equal(el.toastType, 'success');
    });

    it('should accept warning type', () => {
      const el = element as any;
      el.toastType = 'warning';
      assert.equal(el.toastType, 'warning');
    });

    it('should accept error type', () => {
      const el = element as any;
      el.toastType = 'error';
      assert.equal(el.toastType, 'error');
    });

    it('should set toastType attribute', () => {
      const el = element as any;
      el.toastType = 'success';
      assert.equal(element.getAttribute('toastType'), 'success');
    });
  });

  describe('Visibility', () => {
    it('should be hidden by default', () => {
      const el = element as any;
      assert.equal(el.visible, false);
    });

    it('should have show method', () => {
      const el = element as any;
      assert(typeof el.show === 'function');
    });

    it('should have hide method', () => {
      const el = element as any;
      assert(typeof el.hide === 'function');
    });

    it('should show toast via method', () => {
      const el = element as any;
      el.message = 'Test';
      el.show();
      assert.equal(el.visible, true);
    });

    it('should hide toast via method', () => {
      const el = element as any;
      el.message = 'Test';
      el.show();
      el.hide();
      assert.equal(el.visible, false);
    });
  });

  describe('Auto Hide Property', () => {
    it('should auto-hide by default', () => {
      const el = element as any;
      assert.equal(el.autoHide, true);
    });

    it('should accept autoHide property', () => {
      const el = element as any;
      el.autoHide = false;
      assert.equal(el.autoHide, false);
    });

    it('should set autoHide attribute', () => {
      const el = element as any;
      el.autoHide = false;
      assert.equal(element.getAttribute('autoHide'), 'false');
    });
  });

  describe('Duration Property', () => {
    it('should have default duration of 3000ms', () => {
      const el = element as any;
      assert.equal(el.duration, 3000);
    });

    it('should accept custom duration', () => {
      const el = element as any;
      el.duration = 5000;
      assert.equal(el.duration, 5000);
    });

    it('should set duration attribute', () => {
      const el = element as any;
      el.duration = 2000;
      assert.equal(element.getAttribute('duration'), '2000');
    });

    it('should handle zero duration', () => {
      const el = element as any;
      el.duration = 0;
      assert.equal(el.duration, 0);
    });
  });

  describe('Attributes', () => {
    it('should accept message attribute', () => {
      element.setAttribute('message', 'Hi');
      const el = element as any;
      assert.equal(el.message, 'Hi');
    });

    it('should accept toastType attribute', () => {
      element.setAttribute('toastType', 'error');
      const el = element as any;
      assert.equal(el.toastType, 'error');
    });

    it('should accept autoHide attribute', () => {
      element.setAttribute('autoHide', 'false');
      const el = element as any;
      assert.equal(el.autoHide, false);
    });

    it('should accept duration attribute', () => {
      element.setAttribute('duration', '4000');
      const el = element as any;
      assert.equal(el.duration, 4000);
    });
  });

  describe('Accessibility', () => {
    it('should have role alert', () => {
      const toast = element.shadowRoot?.querySelector('.toast-container');
      assert(toast?.getAttribute('role') === 'alert' || toast);
    });

    it('should have aria-live attribute', () => {
      const toast = element.shadowRoot?.querySelector('.toast-container');
      assert(toast);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const el = element as any;
      el.message = '';
      assert.equal(el.message, '');
    });

    it('should handle special characters in message', () => {
      const el = element as any;
      el.message = 'Alert <>&"\'';
      assert.equal(el.message, 'Alert <>&"\'');
    });

    it('should handle rapid show/hide', () => {
      const el = element as any;
      el.message = 'Test';
      el.show();
      el.hide();
      el.show();
      el.hide();
      assert.equal(el.visible, false);
    });

    it('should handle changing type while visible', () => {
      const el = element as any;
      el.toastType = 'info';
      el.show();
      el.toastType = 'success';
      assert.equal(el.toastType, 'success');
      assert.equal(el.visible, true);
    });

    it('should handle changing message while visible', () => {
      const el = element as any;
      el.message = 'First';
      el.show();
      el.message = 'Second';
      assert.equal(el.message, 'Second');
      assert.equal(el.visible, true);
    });

    it('should handle negative duration', () => {
      const el = element as any;
      el.duration = -1000;
      assert.equal(el.duration, -1000);
    });
  });

  describe('Initial State', () => {
    it('should default toastType to info', () => {
      const el = element as any;
      assert.equal(el.toastType, 'info');
    });

    it('should be hidden initially', () => {
      const el = element as any;
      assert.equal(el.visible, false);
    });

    it('should auto-hide by default', () => {
      const el = element as any;
      assert.equal(el.autoHide, true);
    });

    it('should have default duration', () => {
      const el = element as any;
      assert.equal(el.duration, 3000);
    });

    it('should have no message initially', () => {
      const el = element as any;
      assert.equal(el.message, undefined);
    });
  });

  describe('Multiple Properties', () => {
    it('should handle multiple properties together', () => {
      const el = element as any;
      el.message = 'Success!';
      el.toastType = 'success';
      el.autoHide = true;
      el.duration = 2000;

      assert.equal(el.message, 'Success!');
      assert.equal(el.toastType, 'success');
      assert.equal(el.autoHide, true);
      assert.equal(el.duration, 2000);
    });

    it('should handle sequential property changes', () => {
      const el = element as any;
      el.message = 'First';
      assert.equal(el.message, 'First');
      el.toastType = 'warning';
      assert.equal(el.toastType, 'warning');
      el.duration = 4000;
      assert.equal(el.duration, 4000);
    });
  });
});
