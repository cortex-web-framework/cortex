import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

/**
 * Test suite for ui-select component.
 * Tests define the expected API and behavior.
 */
describe('ui-select', () => {
  let element: any;

  beforeEach(() => {
    element = document.createElement('ui-select');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-SELECT');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot, 'should have a shadow root');
    });

    it('should render a button trigger', () => {
      const button = element.shadowRoot?.querySelector('button');
      assert(button, 'should contain a button trigger');
    });

    it('should render a listbox for options', () => {
      const listbox = element.shadowRoot?.querySelector('[role="listbox"]');
      assert(listbox, 'should contain a listbox');
    });
  });

  describe('Options Management', () => {
    it('should accept options as property', () => {
      const options = [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
      ];
      element.options = options;
      assert.deepEqual(element.options, options);
    });

    it('should accept options via attribute (JSON)', () => {
      const json = JSON.stringify([
        { label: 'Opt A', value: 'a' },
        { label: 'Opt B', value: 'b' },
      ]);
      element.setAttribute('options', json);
      assert.equal(element.options.length, 2);
      assert.equal(element.options[0].label, 'Opt A');
    });

    it('should render option elements', () => {
      element.options = [
        { label: 'First', value: '1' },
        { label: 'Second', value: '2' },
      ];

      const options = element.shadowRoot?.querySelectorAll('[role="option"]');
      assert.equal(options?.length, 2);
    });

    it('should display option labels in listbox', () => {
      element.options = [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ];

      const listbox = element.shadowRoot?.querySelector('[role="listbox"]');
      assert(listbox?.textContent?.includes('Option A'));
      assert(listbox?.textContent?.includes('Option B'));
    });
  });

  describe('Properties & Attributes', () => {
    it('should accept value property', () => {
      element.options = [
        { label: 'One', value: 'uno' },
        { label: 'Two', value: 'dos' },
      ];
      element.value = 'uno';
      assert.equal(element.value, 'uno');
    });

    it('should accept placeholder property', () => {
      element.placeholder = 'Select an option...';
      assert.equal(element.placeholder, 'Select an option...');
    });

    it('should show placeholder when no value selected', () => {
      element.placeholder = 'Choose one';
      element.options = [{ label: 'Item', value: 'item' }];

      const button = element.shadowRoot?.querySelector('button');
      assert(button?.textContent?.includes('Choose one'));
    });

    it('should accept disabled property', () => {
      element.disabled = true;
      assert.equal(element.disabled, true);
    });

    it('should accept label property', () => {
      element.label = 'Select Country';
      assert.equal(element.label, 'Select Country');
    });

    it('should accept multiple property', () => {
      element.multiple = true;
      assert.equal(element.multiple, true);
    });

    it('should accept required property', () => {
      element.required = true;
      assert.equal(element.required, true);
    });

    it('should accept searchable property', () => {
      element.searchable = true;
      assert.equal(element.searchable, true);
    });

    it('should accept name property', () => {
      element.name = 'country';
      assert.equal(element.name, 'country');
    });
  });

  describe('Single Selection Mode', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Red', value: 'red' },
        { label: 'Green', value: 'green' },
        { label: 'Blue', value: 'blue' },
      ];
      element.multiple = false;
    });

    it('should select single option', () => {
      element.value = 'red';
      assert.equal(element.value, 'red');
    });

    it('should update button text on selection', () => {
      element.value = 'green';
      const button = element.shadowRoot?.querySelector('button');
      assert(button?.textContent?.includes('Green'));
    });

    it('should deselect previous option on new selection', () => {
      element.value = 'red';
      assert.equal(element.value, 'red');

      element.value = 'blue';
      assert.equal(element.value, 'blue');
    });
  });

  describe('Multiple Selection Mode', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Apple', value: 'apple' },
        { label: 'Banana', value: 'banana' },
        { label: 'Cherry', value: 'cherry' },
      ];
      element.multiple = true;
    });

    it('should support multiple values as array', () => {
      element.value = ['apple', 'banana'];
      assert.deepEqual(element.value, ['apple', 'banana']);
    });

    it('should allow toggling selections', () => {
      element.value = ['apple'];
      element.toggleOption('banana');

      assert(Array.isArray(element.value));
      assert.equal(element.value.length, 2);
    });

    it('should remove option from selection', () => {
      element.value = ['apple', 'banana', 'cherry'];
      element.toggleOption('banana');

      assert.equal(element.value.length, 2);
      assert(!element.value.includes('banana'));
    });

    it('should display multiple selections in button', () => {
      element.value = ['apple', 'banana'];
      const button = element.shadowRoot?.querySelector('button');
      const text = button?.textContent || '';

      assert(text.includes('2') || text.includes('selected'));
    });
  });

  describe('Open/Close Behavior', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
      ];
    });

    it('should start closed', () => {
      assert.equal(element.isOpen, false);
    });

    it('should open on button click', () => {
      const button = element.shadowRoot?.querySelector('button');
      button?.click();

      assert.equal(element.isOpen, true);
    });

    it('should close on second button click', () => {
      element.open();
      assert.equal(element.isOpen, true);

      const button = element.shadowRoot?.querySelector('button');
      button?.click();

      assert.equal(element.isOpen, false);
    });

    it('should close on option selection', () => {
      element.open();
      assert.equal(element.isOpen, true);

      const firstOption = element.shadowRoot?.querySelector('[role="option"]');
      firstOption?.click();

      assert.equal(element.isOpen, false);
    });

    it('should close on Escape key', () => {
      element.open();
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      element.shadowRoot?.dispatchEvent(event);

      assert.equal(element.isOpen, false);
    });
  });

  describe('Events', () => {
    beforeEach(() => {
      element.options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ];
    });

    it('should emit change event on selection', () => {
      let changeCount = 0;
      element.addEventListener('change', () => {
        changeCount++;
      });

      element.value = 'a';

      assert.equal(changeCount, 1);
    });

    it('should include value in change event', () => {
      let eventValue: any = null;
      element.addEventListener('change', (e: any) => {
        eventValue = e.detail?.value;
      });

      element.value = 'b';

      assert.equal(eventValue, 'b');
    });

    it('should emit open event', () => {
      let openCount = 0;
      element.addEventListener('open', () => {
        openCount++;
      });

      element.open();

      assert.equal(openCount, 1);
    });

    it('should emit close event', () => {
      let closeCount = 0;
      element.addEventListener('close', () => {
        closeCount++;
      });

      element.open();
      element.close();

      assert.equal(closeCount, 1);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Apple', value: 'apple' },
        { label: 'Apricot', value: 'apricot' },
        { label: 'Banana', value: 'banana' },
      ];
      element.searchable = true;
      element.open();
    });

    it('should filter options by search input', () => {
      element.search('app');

      const visibleOptions = element.shadowRoot?.querySelectorAll('[role="option"]:not(.hidden)');
      assert.equal(visibleOptions?.length, 2);
    });

    it('should be case-insensitive', () => {
      element.search('APP');

      const visibleOptions = element.shadowRoot?.querySelectorAll('[role="option"]:not(.hidden)');
      assert(visibleOptions && visibleOptions.length >= 1);
    });

    it('should clear filter on empty search', () => {
      element.search('app');
      element.search('');

      const allOptions = element.shadowRoot?.querySelectorAll('[role="option"]');
      assert.equal(allOptions?.length, 3);
    });

    it('should navigate with arrow keys in search', () => {
      element.search('a');

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      element.shadowRoot?.dispatchEvent(event);

      assert(element.highlightedIndex >= 0);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      element.options = [
        { label: 'One', value: '1' },
        { label: 'Two', value: '2' },
      ];
    });

    it('should have open method', () => {
      assert.equal(typeof element.open, 'function');
    });

    it('should have close method', () => {
      assert.equal(typeof element.close, 'function');
    });

    it('should have toggle method', () => {
      assert.equal(typeof element.toggle, 'function');
    });

    it('should toggle open/closed state', () => {
      assert.equal(element.isOpen, false);
      element.toggle();
      assert.equal(element.isOpen, true);
      element.toggle();
      assert.equal(element.isOpen, false);
    });

    it('should have focus method', () => {
      assert.equal(typeof element.focus, 'function');
    });

    it('should have clearSelection method', () => {
      assert.equal(typeof element.clearSelection, 'function');
    });

    it('should clear value with clearSelection', () => {
      element.value = '1';
      element.clearSelection();
      assert(element.value === null || element.value === '' || element.value.length === 0);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      element.options = [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
      ];
      element.label = 'Choose';
    });

    it('should have aria-labelledby on listbox', () => {
      const listbox = element.shadowRoot?.querySelector('[role="listbox"]');
      assert(listbox?.getAttribute('aria-labelledby'));
    });

    it('should have aria-expanded on button', () => {
      const button = element.shadowRoot?.querySelector('button');
      assert(
        button?.getAttribute('aria-expanded') === 'true' ||
          button?.getAttribute('aria-expanded') === 'false'
      );
    });

    it('should support keyboard navigation with arrows', () => {
      element.open();

      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      element.shadowRoot?.dispatchEvent(downEvent);

      assert(element.highlightedIndex >= 0);
    });

    it('should select with Enter key', () => {
      element.open();
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      element.shadowRoot?.dispatchEvent(enterEvent);

      // Should have selected the highlighted option
      assert(element.value !== null && element.value !== '');
    });
  });

  describe('Form Integration', () => {
    it('should work in a form', () => {
      const form = document.createElement('form');
      const select = document.createElement('ui-select');
      select.setAttribute('name', 'category');
      select.options = [
        { label: 'Cat A', value: 'a' },
        { label: 'Cat B', value: 'b' },
      ];
      select.value = 'a';

      form.appendChild(select);
      document.body.appendChild(form);

      const formData = new FormData(form);
      assert.equal(formData.get('category'), 'a');

      document.body.removeChild(form);
    });

    it('should support name attribute', () => {
      element.name = 'colors';
      assert.equal(element.getAttribute('name'), 'colors');
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
});
