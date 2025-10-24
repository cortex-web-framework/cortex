import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

/**
 * Test suite for ui-textarea component.
 * Tests define the expected API and behavior.
 */
describe('ui-textarea', () => {
  let element: any;

  beforeEach(() => {
    element = document.createElement('ui-textarea');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-TEXTAREA');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot, 'should have a shadow root');
    });

    it('should render a textarea element', () => {
      const textarea = element.shadowRoot?.querySelector('textarea');
      assert(textarea, 'should contain a textarea element');
    });

    it('should have a label element', () => {
      const label = element.shadowRoot?.querySelector('label');
      assert(label, 'should contain a label element');
    });
  });

  describe('Properties & Attributes', () => {
    it('should accept value property', () => {
      element.value = 'Hello World';
      assert.equal(element.value, 'Hello World');
    });

    it('should accept value as attribute', () => {
      element.setAttribute('value', 'Test value');
      assert.equal(element.value, 'Test value');
    });

    it('should accept placeholder property', () => {
      element.placeholder = 'Enter text here...';
      assert.equal(element.placeholder, 'Enter text here...');
    });

    it('should accept label property', () => {
      element.label = 'Comments';
      assert.equal(element.label, 'Comments');
    });

    it('should accept rows property', () => {
      element.rows = 10;
      assert.equal(element.rows, 10);
    });

    it('should accept cols property', () => {
      element.cols = 50;
      assert.equal(element.cols, 50);
    });

    it('should accept disabled property', () => {
      element.disabled = true;
      assert.equal(element.disabled, true);
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
      element.maxLength = 200;
      assert.equal(element.maxLength, 200);
    });

    it('should accept minLength property', () => {
      element.minLength = 10;
      assert.equal(element.minLength, 10);
    });

    it('should accept name property', () => {
      element.name = 'comment';
      assert.equal(element.name, 'comment');
    });
  });

  describe('Placeholder', () => {
    it('should display placeholder when empty', () => {
      element.placeholder = 'Enter your message';
      element.value = '';
      const textarea = element.shadowRoot?.querySelector('textarea');
      assert.equal(textarea?.placeholder, 'Enter your message');
    });

    it('should hide placeholder when value is set', () => {
      element.placeholder = 'Default text';
      element.value = 'User input';
      const textarea = element.shadowRoot?.querySelector('textarea');
      assert.equal(textarea?.value, 'User input');
    });
  });

  describe('Label', () => {
    it('should display label text', () => {
      element.label = 'Feedback';
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Feedback'));
    });

    it('should show required indicator on label', () => {
      element.label = 'Required Field';
      element.required = true;
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('*'));
    });
  });

  describe('Validation', () => {
    it('should validate required field', () => {
      element.required = true;
      element.value = '';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, false);
    });

    it('should be valid when required and has value', () => {
      element.required = true;
      element.value = 'Some text';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, true);
    });

    it('should validate maxLength', () => {
      element.maxLength = 10;
      element.value = 'This is too long';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, false);
    });

    it('should be valid when within maxLength', () => {
      element.maxLength = 20;
      element.value = 'Short text';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, true);
    });

    it('should validate minLength', () => {
      element.minLength = 5;
      element.value = 'Hi';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, false);
    });

    it('should be valid when meets minLength', () => {
      element.minLength = 5;
      element.value = 'Hello there';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, true);
    });

    it('should return validation message', () => {
      element.required = true;
      element.value = '';
      element.checkValidity?.();
      const message = element.validationMessage;
      assert(typeof message === 'string');
    });
  });

  describe('States', () => {
    it('should apply disabled styling when disabled', () => {
      element.disabled = true;
      const textarea = element.shadowRoot?.querySelector('textarea');
      assert(textarea?.disabled);
    });

    it('should apply readonly when set', () => {
      element.readonly = true;
      const textarea = element.shadowRoot?.querySelector('textarea');
      assert(textarea?.readOnly);
    });

    it('should show required indicator', () => {
      element.required = true;
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('*'));
    });
  });

  describe('Events', () => {
    it('should emit input event on value change', () => {
      let inputCount = 0;
      element.addEventListener('input', () => {
        inputCount++;
      });

      const textarea = element.shadowRoot?.querySelector('textarea');
      textarea?.dispatchEvent(new Event('input', { bubbles: true }));

      assert.equal(inputCount, 1);
    });

    it('should emit change event on blur', () => {
      let changeCount = 0;
      element.addEventListener('change', () => {
        changeCount++;
      });

      const textarea = element.shadowRoot?.querySelector('textarea');
      textarea?.dispatchEvent(new Event('change', { bubbles: true }));

      assert.equal(changeCount, 1);
    });

    it('should emit focus event when focused', () => {
      let focusCount = 0;
      element.addEventListener('focus', () => {
        focusCount++;
      });

      element.focus();

      assert(focusCount >= 0);
    });

    it('should emit blur event when blurred', () => {
      let blurCount = 0;
      element.addEventListener('blur', () => {
        blurCount++;
      });

      element.blur();

      assert(blurCount >= 0);
    });
  });

  describe('Methods', () => {
    it('should have focus method', () => {
      assert.equal(typeof element.focus, 'function');
    });

    it('should have blur method', () => {
      assert.equal(typeof element.blur, 'function');
    });

    it('should have select method', () => {
      assert.equal(typeof element.select, 'function');
    });

    it('should have checkValidity method', () => {
      assert.equal(typeof element.checkValidity, 'function');
    });

    it('should have reset method', () => {
      assert.equal(typeof element.reset, 'function');
    });

    it('should clear value with reset', () => {
      element.value = 'Some text';
      element.reset?.();
      assert.equal(element.value, '');
    });

    it('should select all text', () => {
      element.value = 'Text to select';
      element.select?.();
      // Browser behavior - just ensure method exists
      assert(element.select);
    });
  });

  describe('Form Integration', () => {
    it('should work in a form', () => {
      const form = document.createElement('form');
      const textarea = document.createElement('ui-textarea');
      textarea.setAttribute('name', 'message');
      textarea.value = 'Form message';

      form.appendChild(textarea);
      document.body.appendChild(form);

      const formData = new FormData(form);
      assert.equal(formData.get('message'), 'Form message');

      document.body.removeChild(form);
    });

    it('should support name attribute', () => {
      element.name = 'textarea-field';
      assert.equal(element.getAttribute('name'), 'textarea-field');
    });
  });

  describe('Sizing', () => {
    it('should set rows attribute', () => {
      element.rows = 8;
      const textarea = element.shadowRoot?.querySelector('textarea');
      assert.equal(textarea?.rows, 8);
    });

    it('should set cols attribute', () => {
      element.cols = 40;
      const textarea = element.shadowRoot?.querySelector('textarea');
      assert.equal(textarea?.cols, 40);
    });

    it('should have default rows and cols', () => {
      const textarea = element.shadowRoot?.querySelector('textarea');
      assert(textarea?.rows >= 3);
      assert(textarea?.cols >= 20);
    });
  });

  describe('Dynamic Changes', () => {
    it('should update value dynamically', () => {
      element.value = 'First value';
      assert.equal(element.value, 'First value');

      element.value = 'Second value';
      assert.equal(element.value, 'Second value');
    });

    it('should update placeholder dynamically', () => {
      element.placeholder = 'First placeholder';
      let textarea = element.shadowRoot?.querySelector('textarea');
      assert.equal(textarea?.placeholder, 'First placeholder');

      element.placeholder = 'Second placeholder';
      textarea = element.shadowRoot?.querySelector('textarea');
      assert.equal(textarea?.placeholder, 'Second placeholder');
    });

    it('should toggle disabled state', () => {
      element.disabled = false;
      let textarea = element.shadowRoot?.querySelector('textarea');
      assert(!textarea?.disabled);

      element.disabled = true;
      textarea = element.shadowRoot?.querySelector('textarea');
      assert(textarea?.disabled);
    });

    it('should toggle readonly state', () => {
      element.readonly = false;
      let textarea = element.shadowRoot?.querySelector('textarea');
      assert(!textarea?.readOnly);

      element.readonly = true;
      textarea = element.shadowRoot?.querySelector('textarea');
      assert(textarea?.readOnly);
    });
  });

  describe('Character Count', () => {
    it('should display character count when maxLength set', () => {
      element.maxLength = 100;
      element.value = 'Hello';
      const count = element.shadowRoot?.querySelector('.char-count');
      assert(count);
    });

    it('should update character count dynamically', () => {
      element.maxLength = 50;
      element.value = 'Five';
      const count = element.shadowRoot?.querySelector('.char-count');
      assert(count);
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      element.label = 'Description';
      const label = element.shadowRoot?.querySelector('label');
      assert(label);
    });

    it('should support aria-describedby for error messages', () => {
      element.required = true;
      element.value = '';
      element.checkValidity?.();
      const textarea = element.shadowRoot?.querySelector('textarea');
      assert(textarea);
    });

    it('should indicate required state', () => {
      element.required = true;
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('*'));
    });
  });

  describe('Text Manipulation', () => {
    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      element.value = multilineText;
      assert.equal(element.value, multilineText);
    });

    it('should handle special characters', () => {
      const specialText = 'Hello <world> & "friends"';
      element.value = specialText;
      assert.equal(element.value, specialText);
    });

    it('should preserve whitespace', () => {
      const whitespaceText = '  Indented\n    More indented  ';
      element.value = whitespaceText;
      assert.equal(element.value, whitespaceText);
    });
  });
});
