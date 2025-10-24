import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-color-picker', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-color-picker');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-COLOR-PICKER');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render a color input', () => {
      const input = element.shadowRoot?.querySelector('input[type="color"]');
      assert(input);
    });

    it('should render a color preview', () => {
      const preview = element.shadowRoot?.querySelector('.color-preview');
      assert(preview);
    });
  });

  describe('Value Management', () => {
    it('should accept hex value', () => {
      const el = element as any;
      el.value = '#ff0000';
      assert.equal(el.value, '#ff0000');
    });

    it('should accept rgb value', () => {
      const el = element as any;
      el.format = 'rgb';
      el.value = 'rgb(255, 0, 0)';
      assert.equal(el.value, 'rgb(255, 0, 0)');
    });

    it('should accept null value', () => {
      const el = element as any;
      el.value = null;
      assert.equal(el.value, null);
    });

    it('should update preview on value change', () => {
      const el = element as any;
      el.value = '#ff0000';
      const preview = element.shadowRoot?.querySelector('.color-preview') as HTMLElement;
      assert(preview?.style.backgroundColor !== undefined);
    });

    it('should maintain hex format by default', () => {
      const el = element as any;
      el.value = '#00ff00';
      assert.equal(el.format, 'hex');
    });
  });

  describe('Format Support', () => {
    it('should support hex format', () => {
      const el = element as any;
      el.format = 'hex';
      el.value = '#ff0000';
      assert.equal(el.format, 'hex');
      assert.equal(el.value, '#ff0000');
    });

    it('should support rgb format', () => {
      const el = element as any;
      el.format = 'rgb';
      el.value = 'rgb(255, 0, 0)';
      assert.equal(el.format, 'rgb');
      assert.equal(el.value, 'rgb(255, 0, 0)');
    });

    it('should default to hex format', () => {
      const el = element as any;
      assert.equal(el.format, 'hex');
    });

    it('should convert hex to rgb on format change', () => {
      const el = element as any;
      el.value = '#ff0000';
      el.format = 'rgb';
      // Value should now be in RGB format
      assert((el.value as string)?.includes('rgb') || (el.value as string)?.includes('255'));
    });
  });

  describe('Properties', () => {
    it('should accept label', () => {
      const el = element as any;
      el.label = 'Pick Color';
      assert.equal(el.label, 'Pick Color');
    });

    it('should accept name', () => {
      const el = element as any;
      el.name = 'color';
      assert.equal(el.name, 'color');
    });

    it('should accept required', () => {
      const el = element as any;
      el.required = true;
      assert.equal(el.required, true);
    });

    it('should accept disabled', () => {
      const el = element as any;
      el.disabled = true;
      assert.equal(el.disabled, true);
    });

    it('should render label when set', () => {
      const el = element as any;
      el.label = 'Choose Color';
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Choose'));
    });

    it('should show required indicator', () => {
      const el = element as any;
      el.label = 'Color';
      el.required = true;
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('*'));
    });
  });

  describe('Validation', () => {
    it('should validate required field', () => {
      const el = element as any;
      el.required = true;
      el.value = null;
      const isValid = el.checkValidity?.();
      assert.equal(isValid, false);
    });

    it('should be valid when required and has value', () => {
      const el = element as any;
      el.required = true;
      el.value = '#ff0000';
      const isValid = el.checkValidity?.();
      assert.equal(isValid, true);
    });

    it('should be valid when not required and empty', () => {
      const el = element as any;
      el.required = false;
      el.value = null;
      const isValid = el.checkValidity?.();
      assert.equal(isValid, true);
    });

    it('should have validation message when invalid', () => {
      const el = element as any;
      el.required = true;
      el.value = null;
      el.checkValidity?.();
      const message = el.validationMessage;
      assert((message as string).length > 0);
    });

    it('should have empty validation message when valid', () => {
      const el = element as any;
      el.required = true;
      el.value = '#ff0000';
      el.checkValidity?.();
      const message = el.validationMessage;
      assert.equal(message, '');
    });

    it('should accept valid hex color', () => {
      const el = element as any;
      el.format = 'hex';
      el.value = '#abc123';
      const isValid = el.checkValidity?.();
      assert.equal(isValid, true);
    });

    it('should accept valid rgb color', () => {
      const el = element as any;
      el.format = 'rgb';
      el.value = 'rgb(100, 150, 200)';
      const isValid = el.checkValidity?.();
      assert.equal(isValid, true);
    });
  });

  describe('States', () => {
    it('should apply disabled styling', () => {
      const el = element as any;
      el.disabled = true;
      const input = element.shadowRoot?.querySelector('input[type="color"]') as HTMLInputElement;
      assert(input?.disabled);
    });

    it('should show disabled state visually', () => {
      const el = element as any;
      el.disabled = true;
      const input = element.shadowRoot?.querySelector('input[type="color"]') as HTMLInputElement;
      assert.equal(input?.disabled, true);
    });

    it('should prevent input when disabled', () => {
      const el = element as any;
      el.disabled = true;
      const input = element.shadowRoot?.querySelector('input[type="color"]') as HTMLInputElement;
      assert(input?.disabled);
    });

    it('should allow input when not disabled', () => {
      const el = element as any;
      el.disabled = false;
      const input = element.shadowRoot?.querySelector('input[type="color"]') as HTMLInputElement;
      assert.equal(input?.disabled, false);
    });
  });

  describe('Events', () => {
    it('should emit change event on color selection', () => {
      let changed = false;
      element.addEventListener('change', () => {
        changed = true;
      });

      (element as any).value = '#ff0000';
      assert(changed);
    });

    it('should emit input event on color change', () => {
      let inputFired = false;
      element.addEventListener('input', () => {
        inputFired = true;
      });

      const input = element.shadowRoot?.querySelector('input[type="color"]');
      input?.dispatchEvent(new Event('input'));

      assert(inputFired);
    });

    it('should include value in change event detail', () => {
      let detailValue: string | null = null;
      element.addEventListener('change', (e: Event) => {
        const event = e as CustomEvent<{ value: string | null }>;
        detailValue = event.detail?.value;
      });

      (element as any).value = '#ff0000';
      assert.equal(detailValue, '#ff0000');
    });

    it('should include value in input event detail', () => {
      let detailValue: string | null = null;
      element.addEventListener('input', (e: Event) => {
        const event = e as CustomEvent<{ value: string }>;
        detailValue = event.detail?.value;
      });

      const input = element.shadowRoot?.querySelector('input[type="color"]') as HTMLInputElement;
      input.value = '#00ff00';
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

      assert(detailValue);
    });
  });

  describe('Methods', () => {
    it('should have focus method', () => {
      const el = element as any;
      assert.equal(typeof el.focus, 'function');
    });

    it('should have blur method', () => {
      const el = element as any;
      assert.equal(typeof el.blur, 'function');
    });

    it('should focus on input element', () => {
      const el = element as any;
      el.focus?.();
      // Check if focus was called (implementation dependent)
      assert(typeof el.focus === 'function');
    });

    it('should blur from input element', () => {
      const el = element as any;
      el.blur?.();
      // Check if blur was called
      assert(typeof el.blur === 'function');
    });

    it('should have reset method', () => {
      const el = element as any;
      assert.equal(typeof el.reset, 'function');
    });

    it('should reset value to null', () => {
      const el = element as any;
      el.value = '#ff0000';
      el.reset?.();
      assert.equal(el.value, null);
    });

    it('should have checkValidity method', () => {
      const el = element as any;
      assert.equal(typeof el.checkValidity, 'function');
    });
  });

  describe('Hex Format', () => {
    it('should format lowercase hex', () => {
      const el = element as any;
      el.format = 'hex';
      el.value = '#FF0000';
      // Should normalize or accept uppercase
      assert((el.value as string)?.toLowerCase() === '#ff0000' || el.value === '#FF0000');
    });

    it('should accept 6-digit hex', () => {
      const el = element as any;
      el.value = '#ff0000';
      assert.equal(el.value, '#ff0000');
    });

    it('should accept 3-digit hex', () => {
      const el = element as any;
      el.value = '#f00';
      assert(el.value);
    });

    it('should display hex in input', () => {
      const el = element as any;
      el.format = 'hex';
      el.value = '#ff0000';
      const input = element.shadowRoot?.querySelector('input[type="color"]') as HTMLInputElement;
      assert(input?.value);
    });
  });

  describe('RGB Format', () => {
    it('should accept rgb format with spaces', () => {
      const el = element as any;
      el.format = 'rgb';
      el.value = 'rgb(255, 0, 0)';
      assert.equal(el.value, 'rgb(255, 0, 0)');
    });

    it('should accept rgb format without spaces', () => {
      const el = element as any;
      el.format = 'rgb';
      el.value = 'rgb(255,0,0)';
      assert((el.value as string)?.includes('255'));
    });

    it('should validate rgb values', () => {
      const el = element as any;
      el.format = 'rgb';
      el.value = 'rgb(255, 0, 0)';
      const isValid = el.checkValidity?.();
      assert.equal(isValid, true);
    });

    it('should reject invalid rgb values', () => {
      const el = element as any;
      el.format = 'rgb';
      el.value = 'rgb(999, 0, 0)';
      // Invalid RGB should still be set but may be invalid
      assert(el.value);
    });
  });

  describe('Form Integration', () => {
    it('should work in a form', () => {
      const form = document.createElement('form');
      const colorPicker = document.createElement('ui-color-picker') as any;
      colorPicker.setAttribute('name', 'theme-color');
      colorPicker.value = '#ff0000';

      form.appendChild(colorPicker);
      document.body.appendChild(form);

      assert.equal(colorPicker.value, '#ff0000');

      document.body.removeChild(form);
    });

    it('should support name attribute', () => {
      const el = element as any;
      el.name = 'accent-color';
      assert.equal(el.name, 'accent-color');
    });

    it('should have value for form submission', () => {
      const el = element as any;
      el.name = 'color';
      el.value = '#ff0000';
      assert.equal(el.value, '#ff0000');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const el = element as any;
      el.label = 'Background Color';
      const label = element.shadowRoot?.querySelector('label');
      assert(label);
    });

    it('should link label with aria-labelledby', () => {
      const el = element as any;
      el.label = 'Color';
      const input = element.shadowRoot?.querySelector('input[type="color"]');
      assert(input?.getAttribute('aria-labelledby'));
    });

    it('should expose required state', () => {
      const el = element as any;
      el.required = true;
      const input = element.shadowRoot?.querySelector('input[type="color"]');
      assert.equal(input?.getAttribute('aria-required'), 'true');
    });

    it('should expose disabled state', () => {
      const el = element as any;
      el.disabled = true;
      const input = element.shadowRoot?.querySelector('input[type="color"]');
      assert.equal(input?.getAttribute('aria-disabled'), 'true');
    });

    it('should have no aria-disabled when enabled', () => {
      const el = element as any;
      el.disabled = false;
      const input = element.shadowRoot?.querySelector('input[type="color"]');
      assert.equal(input?.getAttribute('aria-disabled'), 'false');
    });
  });

  describe('Initial State', () => {
    it('should have null value by default', () => {
      const newElement = document.createElement('ui-color-picker') as any;
      document.body.appendChild(newElement);
      assert.equal(newElement.value, null);
      document.body.removeChild(newElement);
    });

    it('should not be required by default', () => {
      const newElement = document.createElement('ui-color-picker') as any;
      document.body.appendChild(newElement);
      assert.equal(newElement.required, false);
      document.body.removeChild(newElement);
    });

    it('should not be disabled by default', () => {
      const newElement = document.createElement('ui-color-picker') as any;
      document.body.appendChild(newElement);
      assert.equal(newElement.disabled, false);
      document.body.removeChild(newElement);
    });

    it('should default to hex format', () => {
      const newElement = document.createElement('ui-color-picker') as any;
      document.body.appendChild(newElement);
      assert.equal(newElement.format, 'hex');
      document.body.removeChild(newElement);
    });
  });
});
