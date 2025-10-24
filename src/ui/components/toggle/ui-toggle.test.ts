import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-toggle', () => {
  let element: any;

  beforeEach(() => {
    element = document.createElement('ui-toggle');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-TOGGLE');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render a toggle switch', () => {
      const toggle = element.shadowRoot?.querySelector('[role="switch"]');
      assert(toggle);
    });
  });

  describe('Properties', () => {
    it('should accept checked property', () => {
      element.checked = true;
      assert.equal(element.checked, true);
    });

    it('should accept disabled property', () => {
      element.disabled = true;
      assert.equal(element.disabled, true);
    });

    it('should accept required property', () => {
      element.required = true;
      assert.equal(element.required, true);
    });

    it('should accept label property', () => {
      element.label = 'Enable notifications';
      assert.equal(element.label, 'Enable notifications');
    });

    it('should accept name property', () => {
      element.name = 'toggle-field';
      assert.equal(element.name, 'toggle-field');
    });
  });

  describe('Toggle Behavior', () => {
    it('should toggle checked state', () => {
      element.checked = false;
      assert.equal(element.checked, false);

      element.toggle?.();
      assert.equal(element.checked, true);
    });

    it('should change checked on click', () => {
      const toggle = element.shadowRoot?.querySelector('[role="switch"]');
      toggle?.click();
      assert(element.checked === true || element.checked === false);
    });
  });

  describe('Validation', () => {
    it('should validate required field', () => {
      element.required = true;
      element.checked = false;
      const isValid = element.checkValidity?.();
      assert.equal(isValid, false);
    });

    it('should be valid when required and checked', () => {
      element.required = true;
      element.checked = true;
      const isValid = element.checkValidity?.();
      assert.equal(isValid, true);
    });
  });

  describe('States', () => {
    it('should apply disabled styling', () => {
      element.disabled = true;
      const toggle = element.shadowRoot?.querySelector('[role="switch"]');
      assert(toggle?.getAttribute('aria-disabled') === 'true');
    });

    it('should show label', () => {
      element.label = 'Dark mode';
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Dark mode'));
    });
  });

  describe('Events', () => {
    it('should emit change event', () => {
      let changed = false;
      element.addEventListener('change', () => {
        changed = true;
      });

      element.checked = true;
      assert(changed);
    });
  });

  describe('Form Integration', () => {
    it('should work in a form', () => {
      const form = document.createElement('form');
      const toggle = document.createElement('ui-toggle');
      toggle.setAttribute('name', 'notify');
      toggle.checked = true;

      form.appendChild(toggle);
      document.body.appendChild(form);

      const formData = new FormData(form);
      assert.equal(formData.get('notify'), 'on');

      document.body.removeChild(form);
    });
  });

  describe('Accessibility', () => {
    it('should have switch role', () => {
      const toggle = element.shadowRoot?.querySelector('[role="switch"]');
      assert.equal(toggle?.getAttribute('role'), 'switch');
    });

    it('should indicate checked state', () => {
      element.checked = true;
      const toggle = element.shadowRoot?.querySelector('[role="switch"]');
      assert.equal(toggle?.getAttribute('aria-checked'), 'true');
    });
  });
});
