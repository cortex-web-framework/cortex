import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

/**
 * Test suite for ui-checkbox component.
 * Tests define the expected API and behavior.
 */
describe('ui-checkbox', () => {
  let element: any;

  beforeEach(() => {
    element = document.createElement('ui-checkbox');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-CHECKBOX');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot, 'should have a shadow root');
    });

    it('should render an input[type=checkbox] internally', () => {
      const input = element.shadowRoot?.querySelector('input[type="checkbox"]');
      assert(input, 'should contain a checkbox input');
    });

    it('should render a label element internally', () => {
      const label = element.shadowRoot?.querySelector('label');
      assert(label, 'should contain a label element');
    });
  });

  describe('Properties & Attributes', () => {
    it('should accept checked property', () => {
      element.checked = true;
      assert.equal(element.checked, true);
    });

    it('should reflect checked in internal input', () => {
      element.checked = true;
      const input = element.shadowRoot?.querySelector('input');
      assert.equal(input?.checked, true);
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

    it('should accept label property', () => {
      element.label = 'Accept Terms';
      assert.equal(element.label, 'Accept Terms');
    });

    it('should render label text', () => {
      element.label = 'Remember me';
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Remember me'));
    });

    it('should accept value property', () => {
      element.value = 'checkbox-value';
      assert.equal(element.value, 'checkbox-value');
    });

    it('should accept required property', () => {
      element.required = true;
      assert.equal(element.required, true);
    });

    it('should accept indeterminate property for tri-state', () => {
      element.indeterminate = true;
      assert.equal(element.indeterminate, true);
    });

    it('should accept name property for form submission', () => {
      element.name = 'agree';
      assert.equal(element.name, 'agree');
    });
  });

  describe('Attributes', () => {
    it('should sync checked attribute to property', () => {
      element.setAttribute('checked', '');
      assert.equal(element.checked, true);
    });

    it('should sync disabled attribute to property', () => {
      element.setAttribute('disabled', '');
      assert.equal(element.disabled, true);
    });

    it('should recognize required attribute', () => {
      element.setAttribute('required', '');
      assert.equal(element.required, true);
    });

    it('should sync label attribute', () => {
      element.setAttribute('label', 'Agree to terms');
      assert.equal(element.label, 'Agree to terms');
    });
  });

  describe('Events', () => {
    it('should emit change event when checkbox is toggled', () => {
      let changeCount = 0;
      element.addEventListener('change', () => {
        changeCount++;
      });

      const input = element.shadowRoot?.querySelector('input');
      input?.click();

      assert.equal(changeCount, 1);
    });

    it('should include checked state in change event detail', () => {
      let eventDetail: any = null;
      element.addEventListener('change', (e: any) => {
        eventDetail = e.detail;
      });

      element.checked = true;
      const input = element.shadowRoot?.querySelector('input');
      input?.dispatchEvent(new Event('change', { bubbles: true }));

      assert(eventDetail, 'should have event detail');
      assert.equal(eventDetail.checked, true);
    });

    it('should emit focus event when checkbox gains focus', () => {
      let focusCount = 0;
      element.addEventListener('focus', () => {
        focusCount++;
      });

      const input = element.shadowRoot?.querySelector('input');
      input?.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

      assert.equal(focusCount, 1);
    });

    it('should emit blur event when checkbox loses focus', () => {
      let blurCount = 0;
      element.addEventListener('blur', () => {
        blurCount++;
      });

      const input = element.shadowRoot?.querySelector('input');
      input?.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

      assert.equal(blurCount, 1);
    });
  });

  describe('Methods', () => {
    it('should have focus method', () => {
      assert.equal(typeof element.focus, 'function');
    });

    it('should focus internal checkbox', () => {
      const input = element.shadowRoot?.querySelector('input');
      element.focus?.();
      assert.equal(document.activeElement?.shadowRoot?.activeElement, input);
    });

    it('should have blur method', () => {
      assert.equal(typeof element.blur, 'function');
    });

    it('should have toggle method', () => {
      assert.equal(typeof element.toggle, 'function');
    });

    it('should toggle checked state', () => {
      element.checked = false;
      element.toggle?.();
      assert.equal(element.checked, true);

      element.toggle?.();
      assert.equal(element.checked, false);
    });

    it('should have checkValidity method', () => {
      assert.equal(typeof element.checkValidity, 'function');
    });

    it('should validate required checkbox', () => {
      element.required = true;
      element.checked = false;
      const valid = element.checkValidity?.();
      assert.equal(valid, false);
    });

    it('should be valid when required and checked', () => {
      element.required = true;
      element.checked = true;
      const valid = element.checkValidity?.();
      assert.equal(valid, true);
    });
  });

  describe('Indeterminate State', () => {
    it('should support indeterminate state', () => {
      element.indeterminate = true;
      assert.equal(element.indeterminate, true);
    });

    it('should reflect indeterminate in internal input', () => {
      element.indeterminate = true;
      const input = element.shadowRoot?.querySelector('input');
      assert.equal(input?.indeterminate, true);
    });

    it('should clear indeterminate on user interaction', () => {
      element.indeterminate = true;
      element.checked = true;
      assert.equal(element.indeterminate, false);
    });
  });

  describe('Styling & States', () => {
    it('should apply disabled styles when disabled', () => {
      element.disabled = true;
      const input = element.shadowRoot?.querySelector('input');
      assert.equal(input?.disabled, true);
    });

    it('should apply checked visual state', () => {
      element.checked = true;
      const wrapper = element.shadowRoot?.querySelector('.checkbox-wrapper');
      const checkedClass = wrapper?.classList.contains('checked');
      assert(checkedClass || element.classList.contains('checked'));
    });

    it('should apply indeterminate visual state', () => {
      element.indeterminate = true;
      const wrapper = element.shadowRoot?.querySelector('.checkbox-wrapper');
      const indeterminateClass = wrapper?.classList.contains('indeterminate');
      assert(indeterminateClass || element.classList.contains('indeterminate'));
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      element.label = 'Accept';
      element.required = true;

      const input = element.shadowRoot?.querySelector('input');
      assert.equal(input?.getAttribute('aria-required'), 'true');
    });

    it('should connect label to input', () => {
      element.label = 'Subscribe';
      const label = element.shadowRoot?.querySelector('label');
      const input = element.shadowRoot?.querySelector('input');

      const labelId = label?.id;
      const ariaLabelledBy = input?.getAttribute('aria-labelledby');
      assert.equal(ariaLabelledBy, labelId);
    });

    it('should support keyboard interaction', () => {
      const input = element.shadowRoot?.querySelector('input');
      assert(input?.tabIndex >= -1);
    });

    it('should be keyboard navigable', () => {
      element.focus?.();
      const input = element.shadowRoot?.querySelector('input');
      // Should be able to toggle with Space key
      assert(input);
    });
  });

  describe('Form Integration', () => {
    it('should work in a form', () => {
      const form = document.createElement('form');
      const checkbox = document.createElement('ui-checkbox');
      checkbox.setAttribute('name', 'subscribe');
      checkbox.checked = true;

      form.appendChild(checkbox);
      document.body.appendChild(form);

      const formData = new FormData(form);
      // Only checked checkboxes should be in FormData
      const value = formData.get('subscribe');
      assert(value !== null);

      document.body.removeChild(form);
    });

    it('should have a name attribute for form submission', () => {
      element.setAttribute('name', 'terms');
      assert.equal(element.getAttribute('name'), 'terms');
    });

    it('should have a value attribute', () => {
      element.value = 'agree';
      assert.equal(element.value, 'agree');
    });
  });

  describe('Toggle Behavior', () => {
    it('should toggle on click', () => {
      element.checked = false;
      const input = element.shadowRoot?.querySelector('input');

      input?.click();

      // After click, checkbox should be toggled
      assert(element.checked !== false);
    });

    it('should not toggle when disabled', () => {
      element.disabled = true;
      element.checked = false;

      const input = element.shadowRoot?.querySelector('input');
      input?.click();

      // Should remain unchecked
      assert.equal(element.checked, false);
    });
  });
});
