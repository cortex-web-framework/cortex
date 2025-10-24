import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

/**
 * Test suite for ui-text-input component.
 * Tests define the expected API and behavior.
 */
describe('ui-text-input', () => {
  let element: any;

  beforeEach(() => {
    // Create the custom element
    element = document.createElement('ui-text-input');
    document.body.appendChild(element);
  });

  afterEach(() => {
    // Cleanup
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-TEXT-INPUT');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot, 'should have a shadow root');
    });

    it('should render an input element internally', () => {
      const input = element.shadowRoot?.querySelector('input');
      assert(input, 'should contain an input element');
    });

    it('should render a label element internally', () => {
      const label = element.shadowRoot?.querySelector('label');
      assert(label, 'should contain a label element');
    });
  });

  describe('Properties & Attributes', () => {
    it('should accept value property', () => {
      element.value = 'test value';
      assert.equal(element.value, 'test value');
    });

    it('should reflect value in internal input', () => {
      element.value = 'hello';
      const input = element.shadowRoot?.querySelector('input');
      assert.equal(input?.value, 'hello');
    });

    it('should accept placeholder property', () => {
      element.placeholder = 'Enter text...';
      assert.equal(element.placeholder, 'Enter text...');
    });

    it('should reflect placeholder in internal input', () => {
      element.placeholder = 'Type here';
      const input = element.shadowRoot?.querySelector('input');
      assert.equal(input?.placeholder, 'Type here');
    });

    it('should accept type property', () => {
      element.type = 'email';
      assert.equal(element.type, 'email');
    });

    it('should support type variations', () => {
      const types = ['text', 'email', 'password', 'number', 'url', 'tel', 'date'];
      for (const type of types) {
        element.type = type;
        assert.equal(element.type, type);
      }
    });

    it('should accept disabled property', () => {
      element.disabled = true;
      assert.equal(element.disabled, true);
    });

    it('should reflect disabled on internal input', () => {
      element.disabled = true;
      const input = element.shadowRoot?.querySelector('input');
      assert.equal(input?.disabled, true);
    });

    it('should accept readonly property', () => {
      element.readonly = true;
      assert.equal(element.readonly, true);
    });

    it('should accept required property', () => {
      element.required = true;
      assert.equal(element.required, true);
    });

    it('should accept maxLength property', () => {
      element.maxLength = 50;
      assert.equal(element.maxLength, 50);
    });

    it('should reflect maxLength on internal input', () => {
      element.maxLength = 30;
      const input = element.shadowRoot?.querySelector('input');
      assert.equal(input?.maxLength, 30);
    });

    it('should accept pattern property for validation', () => {
      element.pattern = '^[a-zA-Z]+$';
      assert.equal(element.pattern, '^[a-zA-Z]+$');
    });

    it('should accept label property', () => {
      element.label = 'Email Address';
      assert.equal(element.label, 'Email Address');
    });

    it('should render label text', () => {
      element.label = 'Username';
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Username'));
    });
  });

  describe('Attributes', () => {
    it('should sync value attribute to property', () => {
      element.setAttribute('value', 'test');
      assert.equal(element.value, 'test');
    });

    it('should sync placeholder attribute to property', () => {
      element.setAttribute('placeholder', 'hint');
      assert.equal(element.placeholder, 'hint');
    });

    it('should recognize disabled attribute', () => {
      element.setAttribute('disabled', '');
      assert.equal(element.disabled, true);
    });

    it('should recognize readonly attribute', () => {
      element.setAttribute('readonly', '');
      assert.equal(element.readonly, true);
    });

    it('should recognize required attribute', () => {
      element.setAttribute('required', '');
      assert.equal(element.required, true);
    });
  });

  describe('Events', () => {
    it('should emit input event when value changes', () => {
      let eventFired = false;
      element.addEventListener('input', () => {
        eventFired = true;
      });

      const input = element.shadowRoot?.querySelector('input');
      input?.dispatchEvent(new Event('input', { bubbles: true }));

      assert.equal(eventFired, true);
    });

    it('should emit change event when input loses focus', () => {
      let eventFired = false;
      element.addEventListener('change', () => {
        eventFired = true;
      });

      const input = element.shadowRoot?.querySelector('input');
      input?.dispatchEvent(new Event('change', { bubbles: true }));

      assert.equal(eventFired, true);
    });

    it('should emit focus event when input gains focus', () => {
      let eventFired = false;
      element.addEventListener('focus', () => {
        eventFired = true;
      });

      const input = element.shadowRoot?.querySelector('input');
      input?.dispatchEvent(new Event('focus', { bubbles: true }));

      assert.equal(eventFired, true);
    });

    it('should emit blur event when input loses focus', () => {
      let eventFired = false;
      element.addEventListener('blur', () => {
        eventFired = true;
      });

      const input = element.shadowRoot?.querySelector('input');
      input?.dispatchEvent(new Event('blur', { bubbles: true }));

      assert.equal(eventFired, true);
    });
  });

  describe('Validation', () => {
    it('should validate required field', () => {
      element.required = true;
      element.value = '';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, false);
    });

    it('should be valid when required field has value', () => {
      element.required = true;
      element.value = 'something';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, true);
    });

    it('should validate email type', () => {
      element.type = 'email';
      element.value = 'invalid-email';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, false);
    });

    it('should validate valid email', () => {
      element.type = 'email';
      element.value = 'test@example.com';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, true);
    });

    it('should validate pattern', () => {
      element.pattern = '^[0-9]+$'; // numbers only
      element.value = 'abc';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, false);
    });

    it('should validate matching pattern', () => {
      element.pattern = '^[0-9]+$';
      element.value = '12345';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, true);
    });

    it('should report validation error message', () => {
      element.required = true;
      element.value = '';
      const message = element.validationMessage?.();
      assert(message, 'should have validation message');
    });
  });

  describe('Methods', () => {
    it('should have focus method', () => {
      assert.equal(typeof element.focus, 'function');
    });

    it('should focus internal input', () => {
      const input = element.shadowRoot?.querySelector('input');
      let focused = false;

      input?.addEventListener('focus', () => {
        focused = true;
      });

      element.focus?.();
      assert.equal(focused, true);
    });

    it('should have blur method', () => {
      assert.equal(typeof element.blur, 'function');
    });

    it('should blur internal input', () => {
      const input = element.shadowRoot?.querySelector('input');
      element.focus?.();

      let blurred = false;
      input?.addEventListener('blur', () => {
        blurred = true;
      });

      element.blur?.();
      assert.equal(blurred, true);
    });

    it('should have select method', () => {
      assert.equal(typeof element.select, 'function');
    });

    it('should select text in internal input', () => {
      element.value = 'test text';
      element.select?.();

      const input = element.shadowRoot?.querySelector('input');
      assert.equal(input?.selectionStart, 0);
      assert.equal(input?.selectionEnd, 'test text'.length);
    });

    it('should have checkValidity method', () => {
      assert.equal(typeof element.checkValidity, 'function');
    });

    it('should have validationMessage getter', () => {
      element.required = true;
      element.value = '';
      const message = element.validationMessage;
      assert(message, 'should have validation message');
    });
  });

  describe('Styling & States', () => {
    it('should apply disabled styles when disabled', () => {
      element.disabled = true;
      const input = element.shadowRoot?.querySelector('input');
      // Disabled state should exist and be marked as disabled
      assert.equal(input?.disabled, true);
    });

    it('should apply error state when validation fails', () => {
      element.required = true;
      element.value = '';
      const hasErrorClass = element.classList?.contains('error');
      // Should either have error class or aria-invalid attribute
      assert(hasErrorClass || element.getAttribute('aria-invalid') === 'true');
    });

    it('should support CSS custom properties for theming', () => {
      // This will be verified through visual inspection, but we can check the structure
      const input = element.shadowRoot?.querySelector('input');
      // Should be able to use CSS variables
      assert(input, 'input should exist for styling');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      element.label = 'Username';
      element.required = true;

      const input = element.shadowRoot?.querySelector('input');
      assert(input?.getAttribute('aria-required') === 'true');
    });

    it('should connect label to input via aria-labelledby', () => {
      element.label = 'Email';
      const label = element.shadowRoot?.querySelector('label');
      const input = element.shadowRoot?.querySelector('input');

      const labelId = label?.id;
      const ariaLabelledBy = input?.getAttribute('aria-labelledby');
      assert.equal(ariaLabelledBy, labelId);
    });

    it('should support aria-invalid for validation errors', () => {
      element.required = true;
      element.value = '';
      element.checkValidity?.();

      const input = element.shadowRoot?.querySelector('input');
      assert.equal(input?.getAttribute('aria-invalid'), 'true');
    });

    it('should support aria-describedby for error messages', () => {
      element.required = true;
      element.value = '';
      element.checkValidity?.();

      const input = element.shadowRoot?.querySelector('input');
      const ariaDescribedBy = input?.getAttribute('aria-describedby');
      assert(ariaDescribedBy, 'should have aria-describedby for error messages');
    });

    it('should support keyboard navigation', () => {
      const input = element.shadowRoot?.querySelector('input');
      assert(input?.tabIndex >= 0 || input?.tabIndex === -1);
    });
  });

  describe('Form Integration', () => {
    it('should work in a form', () => {
      const form = document.createElement('form');
      const input = document.createElement('ui-text-input');
      input.setAttribute('name', 'username');
      input.setAttribute('value', 'testuser');

      form.appendChild(input);
      document.body.appendChild(form);

      const formData = new FormData(form);
      assert.equal(formData.get('username'), 'testuser');

      document.body.removeChild(form);
    });

    it('should support name attribute for form submission', () => {
      element.setAttribute('name', 'email');
      element.value = 'test@example.com';

      assert.equal(element.getAttribute('name'), 'email');
    });
  });
});
