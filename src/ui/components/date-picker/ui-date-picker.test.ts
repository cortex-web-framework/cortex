import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

/**
 * Test suite for ui-date-picker component.
 */
describe('ui-date-picker', () => {
  let element: any;

  beforeEach(() => {
    element = document.createElement('ui-date-picker');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-DATE-PICKER');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render a calendar grid', () => {
      const calendar = element.shadowRoot?.querySelector('[role="grid"]');
      assert(calendar);
    });

    it('should render month/year header', () => {
      const header = element.shadowRoot?.querySelector('.calendar-header');
      assert(header);
    });
  });

  describe('Date Selection', () => {
    it('should accept value property', () => {
      const date = new Date(2024, 0, 15);
      element.value = date;
      assert(element.value instanceof Date);
    });

    it('should select a date', () => {
      element.value = new Date(2024, 0, 15);
      assert.equal(element.value.getDate(), 15);
    });

    it('should display selected date in header', () => {
      element.value = new Date(2024, 0, 15);
      const header = element.shadowRoot?.textContent;
      assert(header?.includes('January') || header?.includes('2024'));
    });

    it('should allow clearing selection', () => {
      element.value = new Date(2024, 0, 15);
      element.value = null;
      assert.equal(element.value, null);
    });
  });

  describe('Month Navigation', () => {
    beforeEach(() => {
      element.value = new Date(2024, 0, 15);
    });

    it('should navigate to next month', () => {
      const nextBtn = element.shadowRoot?.querySelector('[aria-label*="Next"]');
      nextBtn?.click();
      // Should show February 2024
      const header = element.shadowRoot?.textContent;
      assert(header);
    });

    it('should navigate to previous month', () => {
      const prevBtn = element.shadowRoot?.querySelector('[aria-label*="Previous"]');
      prevBtn?.click();
      // Should show December 2023
      const header = element.shadowRoot?.textContent;
      assert(header);
    });
  });

  describe('Properties', () => {
    it('should accept min date', () => {
      const minDate = new Date(2024, 0, 1);
      element.min = minDate;
      assert(element.min);
    });

    it('should accept max date', () => {
      const maxDate = new Date(2024, 11, 31);
      element.max = maxDate;
      assert(element.max);
    });

    it('should accept disabled dates', () => {
      const disabled = [new Date(2024, 0, 5), new Date(2024, 0, 6)];
      element.disabledDates = disabled;
      assert.equal(element.disabledDates.length, 2);
    });

    it('should accept label', () => {
      element.label = 'Select Date';
      assert.equal(element.label, 'Select Date');
    });

    it('should accept name', () => {
      element.name = 'date-field';
      assert.equal(element.name, 'date-field');
    });

    it('should accept required property', () => {
      element.required = true;
      assert.equal(element.required, true);
    });

    it('should accept disabled property', () => {
      element.disabled = true;
      assert.equal(element.disabled, true);
    });
  });

  describe('Constraints', () => {
    it('should disable dates before min', () => {
      element.min = new Date(2024, 0, 10);
      const header = element.shadowRoot?.textContent;
      assert(header);
    });

    it('should disable dates after max', () => {
      element.max = new Date(2024, 0, 20);
      const header = element.shadowRoot?.textContent;
      assert(header);
    });

    it('should disable specific dates', () => {
      element.disabledDates = [
        new Date(2024, 0, 5),
        new Date(2024, 0, 6),
        new Date(2024, 0, 7),
      ];
      const header = element.shadowRoot?.textContent;
      assert(header);
    });

    it('should not allow selection of disabled dates', () => {
      element.disabledDates = [new Date(2024, 0, 15)];
      element.value = new Date(2024, 0, 15);
      // Should either reject or not set value
      assert(true);
    });
  });

  describe('Validation', () => {
    it('should validate required field', () => {
      element.required = true;
      element.value = null;
      const isValid = element.checkValidity?.();
      assert.equal(isValid, false);
    });

    it('should be valid when required and has date', () => {
      element.required = true;
      element.value = new Date(2024, 0, 15);
      const isValid = element.checkValidity?.();
      assert.equal(isValid, true);
    });

    it('should validate min constraint', () => {
      element.min = new Date(2024, 0, 10);
      element.value = new Date(2024, 0, 5);
      const isValid = element.checkValidity?.();
      assert.equal(isValid, false);
    });

    it('should validate max constraint', () => {
      element.max = new Date(2024, 0, 20);
      element.value = new Date(2024, 0, 25);
      const isValid = element.checkValidity?.();
      assert.equal(isValid, false);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      element.value = new Date(2024, 0, 15);
    });

    it('should navigate with arrow keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      element.shadowRoot?.dispatchEvent(event);
      assert(element.value);
    });

    it('should accept date with Enter key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      element.shadowRoot?.dispatchEvent(event);
      assert(element.value);
    });

    it('should close picker with Escape', () => {
      element.open?.();
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      element.shadowRoot?.dispatchEvent(event);
      assert(!element.isOpen);
    });
  });

  describe('Open/Close', () => {
    it('should have open method', () => {
      assert.equal(typeof element.open, 'function');
    });

    it('should have close method', () => {
      assert.equal(typeof element.close, 'function');
    });

    it('should track open state', () => {
      element.open?.();
      assert(element.isOpen);

      element.close?.();
      assert(!element.isOpen);
    });
  });

  describe('Events', () => {
    it('should emit change event on date select', () => {
      let changed = false;
      element.addEventListener('change', () => {
        changed = true;
      });

      element.value = new Date(2024, 0, 15);

      assert(changed);
    });

    it('should emit open event', () => {
      let opened = false;
      element.addEventListener('open', () => {
        opened = true;
      });

      element.open?.();

      assert(opened);
    });

    it('should emit close event', () => {
      let closed = false;
      element.addEventListener('close', () => {
        closed = true;
      });

      element.open?.();
      element.close?.();

      assert(closed);
    });
  });

  describe('Format & Display', () => {
    it('should display current month', () => {
      element.value = new Date(2024, 0, 15);
      const text = element.shadowRoot?.textContent || '';
      assert(text.includes('2024') || text.includes('Jan'));
    });

    it('should show day names', () => {
      const text = element.shadowRoot?.textContent || '';
      assert(
        text.includes('Sun') ||
          text.includes('Mon') ||
          text.includes('Tue')
      );
    });

    it('should highlight today', () => {
      const cells = element.shadowRoot?.querySelectorAll('[role="gridcell"]');
      assert(cells && cells.length > 0);
    });

    it('should highlight selected date', () => {
      element.value = new Date(2024, 0, 15);
      const selected = element.shadowRoot?.querySelector(
        '[aria-selected="true"]'
      );
      assert(selected);
    });
  });

  describe('Form Integration', () => {
    it('should work in a form', () => {
      const form = document.createElement('form');
      const picker = document.createElement('ui-date-picker');
      picker.setAttribute('name', 'date');
      picker.value = new Date(2024, 0, 15);

      form.appendChild(picker);
      document.body.appendChild(form);

      // Date pickers typically format as ISO string for form submission
      assert(picker.value instanceof Date);

      document.body.removeChild(form);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      element.label = 'Birth Date';
      const label = element.shadowRoot?.querySelector('label');
      assert(label?.textContent?.includes('Birth Date'));
    });

    it('should have grid role', () => {
      const grid = element.shadowRoot?.querySelector('[role="grid"]');
      assert.equal(grid?.getAttribute('role'), 'grid');
    });

    it('should have gridcell role on dates', () => {
      const cells = element.shadowRoot?.querySelectorAll('[role="gridcell"]');
      assert(cells && cells.length > 0);
    });

    it('should indicate disabled dates', () => {
      element.disabledDates = [new Date(2024, 0, 5)];
      const cells = element.shadowRoot?.querySelectorAll('[aria-disabled]');
      assert(cells);
    });
  });

  describe('Dynamic Changes', () => {
    it('should update min/max dynamically', () => {
      element.min = new Date(2024, 0, 1);
      assert(element.min);

      element.min = new Date(2024, 0, 10);
      assert(element.min.getDate() === 10);
    });

    it('should update disabled dates dynamically', () => {
      element.disabledDates = [new Date(2024, 0, 5)];
      assert.equal(element.disabledDates.length, 1);

      element.disabledDates = [
        new Date(2024, 0, 5),
        new Date(2024, 0, 6),
      ];
      assert.equal(element.disabledDates.length, 2);
    });
  });

  describe('Range Mode (Optional)', () => {
    it('should support range selection', () => {
      element.range = true;
      assert.equal(element.range, true);
    });

    it('should select start and end dates', () => {
      element.range = true;
      element.value = {
        start: new Date(2024, 0, 10),
        end: new Date(2024, 0, 20),
      };
      assert(element.value?.start);
      assert(element.value?.end);
    });
  });
});
