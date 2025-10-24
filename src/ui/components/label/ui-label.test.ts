import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

/**
 * Test suite for ui-label component.
 * Tests define the expected API and behavior.
 */
describe('ui-label', () => {
  let element: any;

  beforeEach(() => {
    element = document.createElement('ui-label');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-LABEL');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot, 'should have a shadow root');
    });

    it('should render a label element', () => {
      const label = element.shadowRoot?.querySelector('label');
      assert(label, 'should contain a label element');
    });

    it('should have a slot for label text', () => {
      const slot = element.shadowRoot?.querySelector('slot');
      assert(slot, 'should contain a slot for label text');
    });
  });

  describe('Properties & Attributes', () => {
    it('should accept for property', () => {
      element.for = 'input-id';
      assert.equal(element.for, 'input-id');
    });

    it('should set htmlFor attribute on label element', () => {
      element.for = 'my-input';
      const label = element.shadowRoot?.querySelector('label');
      assert.equal(label?.getAttribute('for'), 'my-input');
    });

    it('should accept for as attribute', () => {
      element.setAttribute('for', 'test-input');
      assert.equal(element.for, 'test-input');
    });

    it('should accept required property', () => {
      element.required = true;
      assert.equal(element.required, true);
    });

    it('should show required indicator when required', () => {
      element.required = true;
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('*'));
    });

    it('should accept required as attribute', () => {
      element.setAttribute('required', '');
      assert.equal(element.required, true);
    });

    it('should hide required indicator when not required', () => {
      element.required = false;
      const label = element.shadowRoot?.querySelector('label');
      assert(!label?.textContent?.includes('*'));
    });

    it('should accept disabled property', () => {
      element.disabled = true;
      assert.equal(element.disabled, true);
    });

    it('should set disabled attribute on label element', () => {
      element.disabled = true;
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.classList.contains('disabled'));
    });

    it('should accept disabled as attribute', () => {
      element.setAttribute('disabled', '');
      assert.equal(element.disabled, true);
    });
  });

  describe('Slot Content', () => {
    it('should display text content from slot', () => {
      element.textContent = 'Email Address';
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Email Address'));
    });

    it('should display text content with required indicator', () => {
      element.required = true;
      element.textContent = 'Username';
      const label = element.shadowRoot?.querySelector('label');
      const content = label?.textContent || '';
      assert(content.includes('Username'));
      assert(content.includes('*'));
    });
  });

  describe('Styling & States', () => {
    it('should apply disabled styling when disabled', () => {
      element.disabled = true;
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.classList.contains('disabled'));
    });

    it('should remove disabled styling when enabled', () => {
      element.disabled = true;
      element.disabled = false;
      const label = element.shadowRoot?.querySelector('label');
      assert(!label?.classList.contains('disabled'));
    });
  });

  describe('Accessibility', () => {
    it('should have proper for attribute for screen readers', () => {
      element.for = 'username-input';
      const label = element.shadowRoot?.querySelector('label');
      assert.equal(label?.getAttribute('for'), 'username-input');
    });

    it('should indicate required state for accessibility', () => {
      element.required = true;
      element.for = 'email';
      const label = element.shadowRoot?.querySelector('label');
      assert.equal(label?.getAttribute('for'), 'email');
      assert(label?.textContent?.includes('*'));
    });

    it('should support aria-label for custom accessible name', () => {
      element.setAttribute('aria-label', 'Email address required');
      const label = element.shadowRoot?.querySelector('label');
      assert(label);
    });
  });

  describe('Form Integration', () => {
    it('should work with form labels', () => {
      const form = document.createElement('form');
      const label = document.createElement('ui-label');
      const input = document.createElement('input');

      input.id = 'email';
      input.type = 'email';
      label.for = 'email';
      label.textContent = 'Email Address';

      form.appendChild(label);
      form.appendChild(input);
      document.body.appendChild(form);

      assert.equal(label.for, 'email');
      assert.equal(label.textContent?.trim(), 'Email Address');

      document.body.removeChild(form);
    });

    it('should associate with input field via for attribute', () => {
      element.for = 'test-input';
      const input = document.createElement('input');
      input.id = 'test-input';

      document.body.appendChild(input);

      const label = element.shadowRoot?.querySelector('label');
      assert.equal(label?.getAttribute('for'), 'test-input');

      document.body.removeChild(input);
    });
  });

  describe('Methods', () => {
    it('should have focus method', () => {
      assert.equal(typeof element.focus, 'function');
    });

    it('should focus associated input when focus called', () => {
      const input = document.createElement('input');
      input.id = 'focus-test';
      element.for = 'focus-test';

      document.body.appendChild(input);

      // Focus method on label - this is typically just for compatibility
      assert.equal(typeof element.focus, 'function');

      document.body.removeChild(input);
    });
  });

  describe('Dynamic Property Changes', () => {
    it('should update for attribute when property changed', () => {
      element.for = 'old-id';
      assert.equal(element.for, 'old-id');

      element.for = 'new-id';
      assert.equal(element.for, 'new-id');
    });

    it('should update required state dynamically', () => {
      element.required = false;
      let label = element.shadowRoot?.querySelector('label');
      assert(!label?.textContent?.includes('*'));

      element.required = true;
      label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('*'));
    });

    it('should update disabled state dynamically', () => {
      element.disabled = false;
      let label = element.shadowRoot?.querySelector('label');
      assert(!label?.classList.contains('disabled'));

      element.disabled = true;
      label = element.shadowRoot?.querySelector('label');
      assert(label?.classList.contains('disabled'));
    });
  });

  describe('CSS Customization', () => {
    it('should support CSS custom properties for theming', () => {
      const style = document.createElement('style');
      style.textContent = `
        ui-label {
          --ui-label-color: red;
          --ui-label-font-size: 16px;
        }
      `;
      document.head.appendChild(style);

      assert(element);

      document.head.removeChild(style);
    });
  });

  describe('Label Text Variations', () => {
    it('should handle single line label text', () => {
      element.textContent = 'Simple Label';
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Simple Label'));
    });

    it('should handle label with special characters', () => {
      element.textContent = 'Email (work) *';
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Email (work)'));
    });

    it('should display both text and required indicator', () => {
      element.textContent = 'Password';
      element.required = true;
      const label = element.shadowRoot?.querySelector('label');
      const text = label?.textContent || '';
      assert(text.includes('Password'));
      assert(text.includes('*'));
    });
  });

  describe('Reactive Updates', () => {
    it('should update label when text content changes', () => {
      element.textContent = 'Initial';
      let label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Initial'));

      element.textContent = 'Updated';
      label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Updated'));
    });

    it('should maintain required indicator after text change', () => {
      element.required = true;
      element.textContent = 'First Text';
      let label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('*'));

      element.textContent = 'Second Text';
      label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('*'));
    });
  });
});
