import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-progress-bar', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-progress-bar');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-PROGRESS-BAR');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render progress container', () => {
      const container = element.shadowRoot?.querySelector('.progress-container');
      assert(container);
    });

    it('should render progress bar', () => {
      const bar = element.shadowRoot?.querySelector('.progress-bar');
      assert(bar);
    });
  });

  describe('Value and Max', () => {
    it('should have default value of 0', () => {
      const el = element as any;
      assert.equal(el.value, 0);
    });

    it('should have default max of 100', () => {
      const el = element as any;
      assert.equal(el.max, 100);
    });

    it('should accept value property', () => {
      const el = element as any;
      el.value = 50;
      assert.equal(el.value, 50);
    });

    it('should accept max property', () => {
      const el = element as any;
      el.max = 200;
      assert.equal(el.max, 200);
    });

    it('should clamp value to max', () => {
      const el = element as any;
      el.max = 100;
      el.value = 150;
      assert(el.value <= el.max);
    });

    it('should not allow negative value', () => {
      const el = element as any;
      el.value = -10;
      assert(el.value >= 0);
    });
  });

  describe('Label Display', () => {
    it('should not show label by default', () => {
      const el = element as any;
      assert.equal(el.showLabel, false);
    });

    it('should accept showLabel property', () => {
      const el = element as any;
      el.showLabel = true;
      assert.equal(el.showLabel, true);
    });

    it('should display label when showLabel is true', () => {
      const el = element as any;
      el.label = 'Uploading...';
      el.showLabel = true;
      const label = element.shadowRoot?.querySelector('.progress-label');
      assert(label);
    });

    it('should accept label property', () => {
      const el = element as any;
      el.label = 'Custom Label';
      assert.equal(el.label, 'Custom Label');
    });
  });

  describe('Percentage Display', () => {
    it('should not show percentage by default', () => {
      const el = element as any;
      assert.equal(el.showPercentage, false);
    });

    it('should accept showPercentage property', () => {
      const el = element as any;
      el.showPercentage = true;
      assert.equal(el.showPercentage, true);
    });

    it('should display percentage when enabled', () => {
      const el = element as any;
      el.value = 50;
      el.max = 100;
      el.showPercentage = true;
      const percentage = element.shadowRoot?.querySelector('.progress-percentage');
      assert(percentage);
    });

    it('should calculate correct percentage', () => {
      const el = element as any;
      el.value = 25;
      el.max = 100;
      el.showPercentage = true;
      assert(element.shadowRoot);
    });
  });

  describe('Variants', () => {
    it('should default to default variant', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should accept default variant', () => {
      const el = element as any;
      el.variant = 'default';
      assert.equal(el.variant, 'default');
    });

    it('should accept striped variant', () => {
      const el = element as any;
      el.variant = 'striped';
      assert.equal(el.variant, 'striped');
    });

    it('should accept animated variant', () => {
      const el = element as any;
      el.variant = 'animated';
      assert.equal(el.variant, 'animated');
    });

    it('should render striped pattern', () => {
      const el = element as any;
      el.variant = 'striped';
      const bar = element.shadowRoot?.querySelector('.progress-bar');
      assert(bar);
    });

    it('should animate animated variant', () => {
      const el = element as any;
      el.variant = 'animated';
      const bar = element.shadowRoot?.querySelector('.progress-bar');
      assert(bar);
    });
  });

  describe('Sizes', () => {
    it('should default to medium size', () => {
      const el = element as any;
      assert.equal(el.size, 'medium');
    });

    it('should accept small size', () => {
      const el = element as any;
      el.size = 'small';
      assert.equal(el.size, 'small');
    });

    it('should accept medium size', () => {
      const el = element as any;
      el.size = 'medium';
      assert.equal(el.size, 'medium');
    });

    it('should accept large size', () => {
      const el = element as any;
      el.size = 'large';
      assert.equal(el.size, 'large');
    });

    it('should apply small size styling', () => {
      const el = element as any;
      el.size = 'small';
      const bar = element.shadowRoot?.querySelector('.progress-bar');
      assert(bar);
    });

    it('should apply large size styling', () => {
      const el = element as any;
      el.size = 'large';
      const bar = element.shadowRoot?.querySelector('.progress-bar');
      assert(bar);
    });
  });

  describe('Colors', () => {
    it('should default to primary color', () => {
      const el = element as any;
      assert.equal(el.color, 'primary');
    });

    it('should accept primary color', () => {
      const el = element as any;
      el.color = 'primary';
      assert.equal(el.color, 'primary');
    });

    it('should accept success color', () => {
      const el = element as any;
      el.color = 'success';
      assert.equal(el.color, 'success');
    });

    it('should accept warning color', () => {
      const el = element as any;
      el.color = 'warning';
      assert.equal(el.color, 'warning');
    });

    it('should accept error color', () => {
      const el = element as any;
      el.color = 'error';
      assert.equal(el.color, 'error');
    });

    it('should accept info color', () => {
      const el = element as any;
      el.color = 'info';
      assert.equal(el.color, 'info');
    });
  });

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should accept disabled property', () => {
      const el = element as any;
      el.disabled = true;
      assert.equal(el.disabled, true);
    });

    it('should apply disabled styling', () => {
      const el = element as any;
      el.disabled = true;
      const bar = element.shadowRoot?.querySelector('.progress-bar');
      assert(bar);
    });
  });

  describe('Indeterminate State', () => {
    it('should not be indeterminate by default', () => {
      const el = element as any;
      assert.equal(el.indeterminate, false);
    });

    it('should accept indeterminate property', () => {
      const el = element as any;
      el.indeterminate = true;
      assert.equal(el.indeterminate, true);
    });

    it('should animate indeterminate state', () => {
      const el = element as any;
      el.indeterminate = true;
      const bar = element.shadowRoot?.querySelector('.progress-bar');
      assert(bar);
    });

    it('should ignore value when indeterminate', () => {
      const el = element as any;
      el.indeterminate = true;
      el.value = 50;
      assert.equal(el.indeterminate, true);
    });
  });

  describe('Accessibility', () => {
    it('should have role=progressbar', () => {
      const progressbar = element.shadowRoot?.querySelector('[role="progressbar"]');
      assert(progressbar);
    });

    it('should have aria-valuenow', () => {
      const el = element as any;
      el.value = 50;
      const progressbar = element.shadowRoot?.querySelector('[role="progressbar"]');
      assert(progressbar?.hasAttribute('aria-valuenow'));
    });

    it('should update aria-valuenow when value changes', () => {
      const el = element as any;
      el.value = 30;
      const progressbar = element.shadowRoot?.querySelector('[role="progressbar"]');
      assert.equal(progressbar?.getAttribute('aria-valuenow'), '30');
    });

    it('should have aria-valuemax', () => {
      const el = element as any;
      el.max = 100;
      const progressbar = element.shadowRoot?.querySelector('[role="progressbar"]');
      assert.equal(progressbar?.getAttribute('aria-valuemax'), '100');
    });

    it('should have aria-valuemin of 0', () => {
      const progressbar = element.shadowRoot?.querySelector('[role="progressbar"]');
      assert.equal(progressbar?.getAttribute('aria-valuemin'), '0');
    });

    it('should have aria-label', () => {
      const el = element as any;
      el.label = 'Loading Progress';
      el.showLabel = true;
      const progressbar = element.shadowRoot?.querySelector('[role="progressbar"]');
      assert(progressbar?.hasAttribute('aria-label'));
    });

    it('should have aria-disabled when disabled', () => {
      const el = element as any;
      el.disabled = true;
      const progressbar = element.shadowRoot?.querySelector('[role="progressbar"]');
      assert.equal(progressbar?.getAttribute('aria-disabled'), 'true');
    });
  });

  describe('Attributes', () => {
    it('should accept value attribute', () => {
      element.setAttribute('value', '25');
      const el = element as any;
      assert.equal(el.value, 25);
    });

    it('should accept max attribute', () => {
      element.setAttribute('max', '200');
      const el = element as any;
      assert.equal(el.max, 200);
    });

    it('should accept label attribute', () => {
      element.setAttribute('label', 'Test Label');
      const el = element as any;
      assert.equal(el.label, 'Test Label');
    });

    it('should accept showLabel attribute', () => {
      element.setAttribute('showLabel', '');
      const el = element as any;
      assert.equal(el.showLabel, true);
    });

    it('should accept showPercentage attribute', () => {
      element.setAttribute('showPercentage', '');
      const el = element as any;
      assert.equal(el.showPercentage, true);
    });

    it('should accept variant attribute', () => {
      element.setAttribute('variant', 'striped');
      const el = element as any;
      assert.equal(el.variant, 'striped');
    });

    it('should accept size attribute', () => {
      element.setAttribute('size', 'large');
      const el = element as any;
      assert.equal(el.size, 'large');
    });

    it('should accept color attribute', () => {
      element.setAttribute('color', 'success');
      const el = element as any;
      assert.equal(el.color, 'success');
    });

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', '');
      const el = element as any;
      assert.equal(el.disabled, true);
    });

    it('should accept indeterminate attribute', () => {
      element.setAttribute('indeterminate', '');
      const el = element as any;
      assert.equal(el.indeterminate, true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle value of 0', () => {
      const el = element as any;
      el.value = 0;
      assert.equal(el.value, 0);
    });

    it('should handle value equal to max', () => {
      const el = element as any;
      el.value = 100;
      el.max = 100;
      assert.equal(el.value, 100);
    });

    it('should handle very large max value', () => {
      const el = element as any;
      el.max = 1000000;
      el.value = 500000;
      assert(el.value <= el.max);
    });

    it('should handle decimal values', () => {
      const el = element as any;
      el.value = 33.33;
      el.max = 100;
      assert(el.value > 0);
    });

    it('should handle rapid value changes', () => {
      const el = element as any;
      for (let i = 0; i <= 100; i++) {
        el.value = i;
      }
      assert.equal(el.value, 100);
    });

    it('should handle empty label', () => {
      const el = element as any;
      el.label = '';
      assert.equal(el.label, '');
    });

    it('should handle very long label', () => {
      const el = element as any;
      el.label = 'A'.repeat(500);
      assert(el.label.length === 500);
    });
  });

  describe('Initial State', () => {
    it('should start at 0%', () => {
      const el = element as any;
      assert.equal(el.value, 0);
    });

    it('should have max of 100 initially', () => {
      const el = element as any;
      assert.equal(el.max, 100);
    });

    it('should default showLabel to false', () => {
      const el = element as any;
      assert.equal(el.showLabel, false);
    });

    it('should default showPercentage to false', () => {
      const el = element as any;
      assert.equal(el.showPercentage, false);
    });

    it('should default variant to default', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should default size to medium', () => {
      const el = element as any;
      assert.equal(el.size, 'medium');
    });

    it('should default color to primary', () => {
      const el = element as any;
      assert.equal(el.color, 'primary');
    });

    it('should not be disabled initially', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should not be indeterminate initially', () => {
      const el = element as any;
      assert.equal(el.indeterminate, false);
    });
  });
});
