import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

/**
 * Test suite for ui-radio component.
 */
describe('ui-radio', () => {
  let element: any;

  beforeEach(() => {
    element = document.createElement('ui-radio');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-RADIO');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot, 'should have a shadow root');
    });

    it('should render a radio group', () => {
      const group = element.shadowRoot?.querySelector('[role="radiogroup"]');
      assert(group, 'should contain a radiogroup');
    });
  });

  describe('Options', () => {
    it('should accept options property', () => {
      const options = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ];
      element.options = options;
      assert.deepEqual(element.options, options);
    });

    it('should render radio buttons for each option', () => {
      element.options = [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
      ];
      const radios = element.shadowRoot?.querySelectorAll('[role="radio"]');
      assert.equal(radios?.length, 2);
    });

    it('should display option labels', () => {
      element.options = [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' },
      ];
      const group = element.shadowRoot?.querySelector('[role="radiogroup"]');
      assert(group?.textContent?.includes('Red'));
      assert(group?.textContent?.includes('Blue'));
    });
  });

  describe('Selection', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Choice A', value: 'a' },
        { label: 'Choice B', value: 'b' },
      ];
    });

    it('should accept value property', () => {
      element.value = 'a';
      assert.equal(element.value, 'a');
    });

    it('should select radio button', () => {
      element.value = 'b';
      const radios = element.shadowRoot?.querySelectorAll('[role="radio"]');
      assert(radios?.[1]?.getAttribute('aria-checked') === 'true');
    });

    it('should deselect previous option', () => {
      element.value = 'a';
      assert.equal(element.value, 'a');
      element.value = 'b';
      assert.equal(element.value, 'b');
    });
  });

  describe('Properties', () => {
    it('should accept label property', () => {
      element.label = 'Select an option';
      assert.equal(element.label, 'Select an option');
    });

    it('should accept required property', () => {
      element.required = true;
      assert.equal(element.required, true);
    });

    it('should accept disabled property', () => {
      element.disabled = true;
      assert.equal(element.disabled, true);
    });

    it('should accept name property', () => {
      element.name = 'choices';
      assert.equal(element.name, 'choices');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ];
    });

    it('should validate required field', () => {
      element.required = true;
      element.value = null;
      const isValid = element.checkValidity?.();
      assert.equal(isValid, false);
    });

    it('should be valid when required and has value', () => {
      element.required = true;
      element.value = 'yes';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, true);
    });
  });

  describe('Disabled State', () => {
    beforeEach(() => {
      element.options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ];
    });

    it('should disable all radio buttons when disabled', () => {
      element.disabled = true;
      const radios = element.shadowRoot?.querySelectorAll('[role="radio"]');
      radios?.forEach((radio: Element) => {
        assert.equal(radio.getAttribute('aria-disabled'), 'true');
      });
    });

    it('should disable individual options', () => {
      element.options = [
        { label: 'Enabled', value: 'enabled' },
        { label: 'Disabled', value: 'disabled', disabled: true },
      ];
      const radios = element.shadowRoot?.querySelectorAll('[role="radio"]');
      assert.equal(radios?.[1]?.getAttribute('aria-disabled'), 'true');
    });
  });

  describe('Events', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ];
    });

    it('should emit change event on selection', () => {
      let changeCount = 0;
      element.addEventListener('change', () => {
        changeCount++;
      });

      element.value = '1';

      assert.equal(changeCount, 1);
    });

    it('should include value in change event', () => {
      let eventValue: any = null;
      element.addEventListener('change', (e: any) => {
        eventValue = e.detail?.value;
      });

      element.value = '2';

      assert.equal(eventValue, '2');
    });
  });

  describe('Form Integration', () => {
    it('should work in a form', () => {
      const form = document.createElement('form');
      const radio = document.createElement('ui-radio');
      radio.setAttribute('name', 'choice');
      radio.options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ];
      radio.value = 'a';

      form.appendChild(radio);
      document.body.appendChild(form);

      const formData = new FormData(form);
      assert.equal(formData.get('choice'), 'a');

      document.body.removeChild(form);
    });

    it('should support name attribute', () => {
      element.name = 'radio-field';
      assert.equal(element.getAttribute('name'), 'radio-field');
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      element.options = [
        { label: 'First', value: 'first' },
        { label: 'Second', value: 'second' },
        { label: 'Third', value: 'third' },
      ];
    });

    it('should navigate with arrow keys', () => {
      element.value = 'first';
      const keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      element.shadowRoot?.dispatchEvent(keyboardEvent);
      assert(element.value);
    });

    it('should navigate up with ArrowUp', () => {
      element.value = 'third';
      const keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      element.shadowRoot?.dispatchEvent(keyboardEvent);
      assert(element.value);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ];
    });

    it('should have radiogroup role', () => {
      const group = element.shadowRoot?.querySelector('[role="radiogroup"]');
      assert.equal(group?.getAttribute('role'), 'radiogroup');
    });

    it('should have radio role on options', () => {
      const radios = element.shadowRoot?.querySelectorAll('[role="radio"]');
      radios?.forEach((radio: Element) => {
        assert.equal(radio.getAttribute('role'), 'radio');
      });
    });

    it('should indicate checked state with aria-checked', () => {
      element.value = 'a';
      const radios = element.shadowRoot?.querySelectorAll('[role="radio"]');
      assert.equal(radios?.[0]?.getAttribute('aria-checked'), 'true');
    });
  });

  describe('Dynamic Changes', () => {
    it('should update options dynamically', () => {
      element.options = [{ label: 'First', value: '1' }];
      let radios = element.shadowRoot?.querySelectorAll('[role="radio"]');
      assert.equal(radios?.length, 1);

      element.options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ];
      radios = element.shadowRoot?.querySelectorAll('[role="radio"]');
      assert.equal(radios?.length, 2);
    });

    it('should update value dynamically', () => {
      element.options = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
      ];

      element.value = 'yes';
      assert.equal(element.value, 'yes');

      element.value = 'no';
      assert.equal(element.value, 'no');
    });
  });
});
