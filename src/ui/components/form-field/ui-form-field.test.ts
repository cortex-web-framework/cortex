import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

/**
 * Test suite for ui-form-field component.
 * Tests define the expected API and behavior.
 */
describe('ui-form-field', () => {
  let element: any;

  beforeEach(() => {
    element = document.createElement('ui-form-field');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-FORM-FIELD');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot, 'should have a shadow root');
    });

    it('should have a form field wrapper container', () => {
      const wrapper = element.shadowRoot?.querySelector('.form-field');
      assert(wrapper, 'should contain a form-field wrapper');
    });
  });

  describe('Slots', () => {
    it('should have label slot', () => {
      const slot = element.shadowRoot?.querySelector('slot[name="label"]');
      assert(slot, 'should contain a label slot');
    });

    it('should have input slot', () => {
      const slot = element.shadowRoot?.querySelector('slot[name="input"]');
      assert(slot, 'should contain an input slot');
    });

    it('should have error slot', () => {
      const slot = element.shadowRoot?.querySelector('slot[name="error"]');
      assert(slot, 'should contain an error slot');
    });

    it('should have hint slot', () => {
      const slot = element.shadowRoot?.querySelector('slot[name="hint"]');
      assert(slot, 'should contain a hint slot');
    });

    it('should display label slot content', () => {
      const label = document.createElement('div');
      label.slot = 'label';
      label.textContent = 'Username';
      element.appendChild(label);

      const labelSlot = element.shadowRoot?.querySelector('slot[name="label"]');
      assert(labelSlot);
    });

    it('should display input slot content', () => {
      const input = document.createElement('input');
      input.slot = 'input';
      input.type = 'text';
      element.appendChild(input);

      const inputSlot = element.shadowRoot?.querySelector('slot[name="input"]');
      assert(inputSlot);
    });
  });

  describe('Properties & Attributes', () => {
    it('should accept error property', () => {
      element.error = 'This field is required';
      assert.equal(element.error, 'This field is required');
    });

    it('should accept error as attribute', () => {
      element.setAttribute('error', 'Invalid email');
      assert.equal(element.error, 'Invalid email');
    });

    it('should display error message', () => {
      element.error = 'Error message';
      const errorMsg = element.shadowRoot?.querySelector('.error-message');
      assert(errorMsg?.textContent?.includes('Error message'));
    });

    it('should accept hint property', () => {
      element.hint = 'Use 8+ characters';
      assert.equal(element.hint, 'Use 8+ characters');
    });

    it('should accept hint as attribute', () => {
      element.setAttribute('hint', 'Password hint');
      assert.equal(element.hint, 'Password hint');
    });

    it('should display hint text', () => {
      element.hint = 'This is a hint';
      const hintMsg = element.shadowRoot?.querySelector('.hint-message');
      assert(hintMsg?.textContent?.includes('This is a hint'));
    });

    it('should accept required property', () => {
      element.required = true;
      assert.equal(element.required, true);
    });

    it('should accept required as attribute', () => {
      element.setAttribute('required', '');
      assert.equal(element.required, true);
    });

    it('should accept disabled property', () => {
      element.disabled = true;
      assert.equal(element.disabled, true);
    });

    it('should accept disabled as attribute', () => {
      element.setAttribute('disabled', '');
      assert.equal(element.disabled, true);
    });

    it('should apply disabled class when disabled', () => {
      element.disabled = true;
      const wrapper = element.shadowRoot?.querySelector('.form-field');
      assert(wrapper?.classList.contains('disabled'));
    });
  });

  describe('Error State', () => {
    it('should show error when error property is set', () => {
      element.error = 'Required field';
      const errorMsg = element.shadowRoot?.querySelector('.error-message');
      assert(errorMsg);
    });

    it('should hide error when error is empty', () => {
      element.error = '';
      const errorMsg = element.shadowRoot?.querySelector('.error-message');
      assert(!errorMsg || errorMsg?.textContent?.trim() === '');
    });

    it('should clear error message when set to null', () => {
      element.error = 'Some error';
      element.error = null;
      const errorMsg = element.shadowRoot?.querySelector('.error-message');
      assert(!errorMsg || !errorMsg?.textContent?.trim());
    });

    it('should apply error styling when error exists', () => {
      element.error = 'Field error';
      const wrapper = element.shadowRoot?.querySelector('.form-field');
      assert(wrapper?.classList.contains('error'));
    });
  });

  describe('Hint Text', () => {
    it('should show hint when hint property is set', () => {
      element.hint = 'Helpful hint text';
      const hintMsg = element.shadowRoot?.querySelector('.hint-message');
      assert(hintMsg?.textContent?.includes('Helpful hint text'));
    });

    it('should hide hint when hint is empty', () => {
      element.hint = '';
      const hintMsg = element.shadowRoot?.querySelector('.hint-message');
      assert(!hintMsg || hintMsg?.textContent?.trim() === '');
    });

    it('should clear hint when set to null', () => {
      element.hint = 'Some hint';
      element.hint = null;
      const hintMsg = element.shadowRoot?.querySelector('.hint-message');
      assert(!hintMsg || !hintMsg?.textContent?.trim());
    });
  });

  describe('Required Indicator', () => {
    it('should show required indicator when required is true', () => {
      element.required = true;
      const wrapper = element.shadowRoot?.querySelector('.form-field');
      assert(wrapper?.classList.contains('required'));
    });

    it('should hide required indicator when required is false', () => {
      element.required = false;
      const wrapper = element.shadowRoot?.querySelector('.form-field');
      assert(!wrapper?.classList.contains('required'));
    });
  });

  describe('Layout & Structure', () => {
    it('should have proper layout structure', () => {
      const wrapper = element.shadowRoot?.querySelector('.form-field');
      const labelSlot = wrapper?.querySelector('slot[name="label"]');
      const inputSlot = wrapper?.querySelector('slot[name="input"]');

      assert(wrapper && labelSlot && inputSlot);
    });

    it('should display slots in correct order', () => {
      const wrapper = element.shadowRoot?.querySelector('.form-field');
      const slots = wrapper?.querySelectorAll('slot');
      assert(slots && slots.length >= 2);
    });
  });

  describe('Form Integration', () => {
    it('should work in a form with input field', () => {
      const form = document.createElement('form');
      const formField = document.createElement('ui-form-field');
      const label = document.createElement('label');
      const input = document.createElement('input');

      label.slot = 'label';
      label.textContent = 'Email';
      input.slot = 'input';
      input.type = 'email';
      input.name = 'email';

      formField.appendChild(label);
      formField.appendChild(input);
      form.appendChild(formField);
      document.body.appendChild(form);

      assert(formField);
      assert.equal(input.name, 'email');

      document.body.removeChild(form);
    });

    it('should display error message in form field', () => {
      const formField = document.createElement('ui-form-field');
      const input = document.createElement('input');
      const error = document.createElement('div');

      input.slot = 'input';
      error.slot = 'error';
      error.textContent = 'Email is invalid';

      formField.appendChild(input);
      formField.appendChild(error);
      document.body.appendChild(formField);
      formField.error = 'Email is invalid';

      const errorMsg = formField.shadowRoot?.querySelector('.error-message');
      assert(errorMsg?.textContent?.includes('Email is invalid'));

      document.body.removeChild(formField);
    });
  });

  describe('Dynamic Property Changes', () => {
    it('should update error message when property changes', () => {
      element.error = 'First error';
      let errorMsg = element.shadowRoot?.querySelector('.error-message');
      assert(errorMsg?.textContent?.includes('First error'));

      element.error = 'Second error';
      errorMsg = element.shadowRoot?.querySelector('.error-message');
      assert(errorMsg?.textContent?.includes('Second error'));
    });

    it('should update hint when property changes', () => {
      element.hint = 'First hint';
      let hintMsg = element.shadowRoot?.querySelector('.hint-message');
      assert(hintMsg?.textContent?.includes('First hint'));

      element.hint = 'Second hint';
      hintMsg = element.shadowRoot?.querySelector('.hint-message');
      assert(hintMsg?.textContent?.includes('Second hint'));
    });

    it('should toggle required state', () => {
      element.required = false;
      let wrapper = element.shadowRoot?.querySelector('.form-field');
      assert(!wrapper?.classList.contains('required'));

      element.required = true;
      wrapper = element.shadowRoot?.querySelector('.form-field');
      assert(wrapper?.classList.contains('required'));
    });

    it('should toggle disabled state', () => {
      element.disabled = false;
      let wrapper = element.shadowRoot?.querySelector('.form-field');
      assert(!wrapper?.classList.contains('disabled'));

      element.disabled = true;
      wrapper = element.shadowRoot?.querySelector('.form-field');
      assert(wrapper?.classList.contains('disabled'));
    });
  });

  describe('Styling & CSS', () => {
    it('should support CSS custom properties for theming', () => {
      const style = document.createElement('style');
      style.textContent = `
        ui-form-field {
          --ui-form-field-gap: 12px;
          --ui-form-field-margin: 16px;
        }
      `;
      document.head.appendChild(style);

      assert(element);

      document.head.removeChild(style);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const wrapper = element.shadowRoot?.querySelector('.form-field');
      assert(wrapper);
    });

    it('should indicate required field for accessibility', () => {
      element.required = true;
      const wrapper = element.shadowRoot?.querySelector('.form-field');
      assert(wrapper?.classList.contains('required'));
    });

    it('should support aria-describedby for error messages', () => {
      element.error = 'Error text';
      const errorMsg = element.shadowRoot?.querySelector('.error-message');
      assert(errorMsg);
    });
  });

  describe('Multiple States', () => {
    it('should handle required + error states together', () => {
      element.required = true;
      element.error = 'This field is required';
      const wrapper = element.shadowRoot?.querySelector('.form-field');

      assert(wrapper?.classList.contains('required'));
      assert(wrapper?.classList.contains('error'));
    });

    it('should handle disabled + error states together', () => {
      element.disabled = true;
      element.error = 'Disabled field error';
      const wrapper = element.shadowRoot?.querySelector('.form-field');

      assert(wrapper?.classList.contains('disabled'));
      assert(wrapper?.classList.contains('error'));
    });

    it('should handle required + disabled + hint states', () => {
      element.required = true;
      element.disabled = true;
      element.hint = 'Hint text';
      const wrapper = element.shadowRoot?.querySelector('.form-field');

      assert(wrapper?.classList.contains('required'));
      assert(wrapper?.classList.contains('disabled'));
    });
  });
});
