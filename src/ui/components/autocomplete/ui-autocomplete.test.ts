import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-autocomplete', () => {
  let element: any;

  beforeEach(() => {
    element = document.createElement('ui-autocomplete');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-AUTOCOMPLETE');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render an input element', () => {
      const input = element.shadowRoot?.querySelector('input');
      assert(input);
    });

    it('should render a suggestions list', () => {
      const list = element.shadowRoot?.querySelector('[role="listbox"]');
      assert(list);
    });
  });

  describe('Options', () => {
    it('should accept options property', () => {
      const options = [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
      ];
      element.options = options;
      assert.deepEqual(element.options, options);
    });

    it('should filter options on search', () => {
      element.options = [
        { label: 'Apple', value: 'apple' },
        { label: 'Apricot', value: 'apricot' },
        { label: 'Banana', value: 'banana' },
      ];

      element.search('app');
      assert.equal(element.filteredOptions?.length, 2);
    });

    it('should be case-insensitive', () => {
      element.options = [
        { label: 'Apple', value: 'apple' },
        { label: 'Apricot', value: 'apricot' },
      ];

      element.search('APP');
      assert(element.filteredOptions?.length >= 1);
    });
  });

  describe('Selection', () => {
    beforeEach(() => {
      element.options = [
        { label: 'JavaScript', value: 'js' },
        { label: 'TypeScript', value: 'ts' },
        { label: 'Python', value: 'py' },
      ];
    });

    it('should accept value property', () => {
      element.value = 'js';
      assert.equal(element.value, 'js');
    });

    it('should display selected value in input', () => {
      element.value = 'ts';
      const input = element.shadowRoot?.querySelector('input');
      assert(input?.value);
    });

    it('should clear selection', () => {
      element.value = 'js';
      element.value = null;
      assert.equal(element.value, null);
    });
  });

  describe('Properties', () => {
    it('should accept placeholder', () => {
      element.placeholder = 'Search...';
      assert.equal(element.placeholder, 'Search...');
    });

    it('should accept label', () => {
      element.label = 'Select Language';
      assert.equal(element.label, 'Select Language');
    });

    it('should accept name', () => {
      element.name = 'language';
      assert.equal(element.name, 'language');
    });

    it('should accept required', () => {
      element.required = true;
      assert.equal(element.required, true);
    });

    it('should accept disabled', () => {
      element.disabled = true;
      assert.equal(element.disabled, true);
    });

    it('should accept minChars', () => {
      element.minChars = 3;
      assert.equal(element.minChars, 3);
    });

    it('should accept maxResults', () => {
      element.maxResults = 5;
      assert.equal(element.maxResults, 5);
    });
  });

  describe('Search Behavior', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Red', value: 'red' },
        { label: 'Green', value: 'green' },
        { label: 'Blue', value: 'blue' },
        { label: 'Redwood', value: 'redwood' },
      ];
    });

    it('should trigger search on input', () => {
      element.search('red');
      const filtered = element.filteredOptions;
      assert(filtered && filtered.length >= 2);
    });

    it('should respect minChars setting', () => {
      element.minChars = 3;
      element.search('re');
      // With minChars=3, 're' should not trigger search
      const filtered = element.filteredOptions;
      assert(filtered?.length === 0 || element.searchQuery.length >= element.minChars);
    });

    it('should respect maxResults setting', () => {
      element.maxResults = 2;
      element.search('a');
      assert(element.filteredOptions.length <= 2);
    });

    it('should clear search on empty input', () => {
      element.search('red');
      assert(element.filteredOptions.length > 0);

      element.search('');
      assert(element.filteredOptions.length === 0);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
        { label: 'Option 3', value: '3' },
      ];
    });

    it('should navigate with arrow keys', () => {
      element.search('option');
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      element.shadowRoot?.dispatchEvent(event);
      assert(element.highlightedIndex >= 0);
    });

    it('should select with Enter key', () => {
      element.search('option');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      element.shadowRoot?.dispatchEvent(enterEvent);
      assert(element.value !== null);
    });

    it('should close with Escape', () => {
      element.search('option');
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      element.shadowRoot?.dispatchEvent(escapeEvent);
      assert(!element.isOpen);
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Valid', value: 'valid' },
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
      element.value = 'valid';
      const isValid = element.checkValidity?.();
      assert.equal(isValid, true);
    });
  });

  describe('States', () => {
    it('should apply disabled styling', () => {
      element.disabled = true;
      const input = element.shadowRoot?.querySelector('input');
      assert(input?.disabled);
    });

    it('should show label', () => {
      element.label = 'Choose';
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Choose'));
    });

    it('should open/close dropdown', () => {
      element.options = [{ label: 'A', value: 'a' }];
      const input = element.shadowRoot?.querySelector('input');

      input?.click();
      assert(element.isOpen);

      input?.click();
      assert(!element.isOpen);
    });
  });

  describe('Events', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Test', value: 'test' },
      ];
    });

    it('should emit change event on selection', () => {
      let changed = false;
      element.addEventListener('change', () => {
        changed = true;
      });

      element.value = 'test';
      assert(changed);
    });

    it('should emit input event on text input', () => {
      let inputFired = false;
      element.addEventListener('input', () => {
        inputFired = true;
      });

      const input = element.shadowRoot?.querySelector('input');
      input?.dispatchEvent(new Event('input'));

      assert(inputFired);
    });
  });

  describe('Form Integration', () => {
    it('should work in a form', () => {
      const form = document.createElement('form');
      const autocomplete = document.createElement('ui-autocomplete');
      autocomplete.setAttribute('name', 'choice');
      autocomplete.options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ];
      autocomplete.value = 'a';

      form.appendChild(autocomplete);
      document.body.appendChild(form);

      assert(autocomplete.value === 'a');

      document.body.removeChild(form);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      element.label = 'Search';
      const label = element.shadowRoot?.querySelector('label');
      assert(label);
    });

    it('should have listbox role', () => {
      const listbox = element.shadowRoot?.querySelector('[role="listbox"]');
      assert.equal(listbox?.getAttribute('role'), 'listbox');
    });

    it('should have option role on items', () => {
      element.options = [{ label: 'Test', value: 'test' }];
      element.search('test');
      const options = element.shadowRoot?.querySelectorAll('[role="option"]');
      assert(options && options.length > 0);
    });
  });
});
