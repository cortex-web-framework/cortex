import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-chip', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-chip');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-CHIP');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render chip container', () => {
      const chip = element.shadowRoot?.querySelector('.chip');
      assert(chip);
    });
  });

  describe('Label', () => {
    it('should accept label property', () => {
      const el = element as any;
      el.label = 'Tag';
      assert.equal(el.label, 'Tag');
    });

    it('should display label', () => {
      const el = element as any;
      el.label = 'React';
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('React'));
    });
  });

  describe('Variants', () => {
    it('should default to default variant', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should accept outlined variant', () => {
      const el = element as any;
      el.variant = 'outlined';
      assert.equal(el.variant, 'outlined');
    });

    it('should accept filled variant', () => {
      const el = element as any;
      el.variant = 'filled';
      assert.equal(el.variant, 'filled');
    });
  });

  describe('Removable', () => {
    it('should not be removable by default', () => {
      const el = element as any;
      assert.equal(el.removable, false);
    });

    it('should accept removable property', () => {
      const el = element as any;
      el.removable = true;
      assert.equal(el.removable, true);
    });

    it('should show remove button when removable', () => {
      const el = element as any;
      el.removable = true;
      const removeBtn = element.shadowRoot?.querySelector('.chip-remove');
      assert(removeBtn);
    });
  });

  describe('Selected State', () => {
    it('should not be selected by default', () => {
      const el = element as any;
      assert.equal(el.selected, false);
    });

    it('should accept selected property', () => {
      const el = element as any;
      el.selected = true;
      assert.equal(el.selected, true);
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
  });

  describe('Attributes', () => {
    it('should accept label attribute', () => {
      element.setAttribute('label', 'Test');
      const el = element as any;
      assert.equal(el.label, 'Test');
    });

    it('should accept variant attribute', () => {
      element.setAttribute('variant', 'outlined');
      const el = element as any;
      assert.equal(el.variant, 'outlined');
    });

    it('should accept removable attribute', () => {
      element.setAttribute('removable', '');
      const el = element as any;
      assert.equal(el.removable, true);
    });

    it('should accept selected attribute', () => {
      element.setAttribute('selected', '');
      const el = element as any;
      assert.equal(el.selected, true);
    });

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', '');
      const el = element as any;
      assert.equal(el.disabled, true);
    });
  });

  describe('Accessibility', () => {
    it('should have role=button', () => {
      const el = element as any;
      el.label = 'Test';
      const chip = element.shadowRoot?.querySelector('[role="button"]');
      assert(chip);
    });

    it('should have aria-disabled when disabled', () => {
      const el = element as any;
      el.disabled = true;
      el.label = 'Test';
      const chip = element.shadowRoot?.querySelector('[role="button"]');
      assert.equal(chip?.getAttribute('aria-disabled'), 'true');
    });
  });

  describe('Events', () => {
    it('should emit remove event when remove clicked', () => {
      let removed = false;
      element.addEventListener('remove', () => {
        removed = true;
      });

      const el = element as any;
      el.removable = true;
      el.label = 'Tag';
      const removeBtn = element.shadowRoot?.querySelector('.chip-remove') as HTMLElement;
      removeBtn?.click();
      assert(removed);
    });

    it('should emit click event', () => {
      let clicked = false;
      element.addEventListener('click', () => {
        clicked = true;
      });

      const el = element as any;
      el.label = 'Clickable';
      const chip = element.shadowRoot?.querySelector('.chip') as HTMLElement;
      chip?.click();
      assert(clicked);
    });
  });

  describe('Edge Cases', () => {
    it('should handle long labels', () => {
      const el = element as any;
      el.label = 'A'.repeat(100);
      assert.equal(el.label.length, 100);
    });

    it('should handle changing variants', () => {
      const el = element as any;
      el.variant = 'outlined';
      el.variant = 'filled';
      assert.equal(el.variant, 'filled');
    });

    it('should handle toggling removable', () => {
      const el = element as any;
      el.removable = true;
      el.removable = false;
      assert.equal(el.removable, false);
    });

    it('should handle toggling selected', () => {
      const el = element as any;
      el.selected = true;
      el.selected = false;
      assert.equal(el.selected, false);
    });
  });

  describe('Initial State', () => {
    it('should start without label', () => {
      const el = element as any;
      assert.equal(el.label, '');
    });

    it('should default variant to default', () => {
      const el = element as any;
      assert.equal(el.variant, 'default');
    });

    it('should not be removable initially', () => {
      const el = element as any;
      assert.equal(el.removable, false);
    });

    it('should not be selected initially', () => {
      const el = element as any;
      assert.equal(el.selected, false);
    });

    it('should not be disabled initially', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });
  });
});
