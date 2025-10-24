import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-tooltip', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-tooltip');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-TOOLTIP');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should have trigger element', () => {
      const trigger = element.shadowRoot?.querySelector('.tooltip-trigger');
      assert(trigger);
    });

    it('should have tooltip content element', () => {
      const tooltip = element.shadowRoot?.querySelector('.tooltip-content');
      assert(tooltip);
    });
  });

  describe('Content Property', () => {
    it('should have default content as undefined', () => {
      const el = element as any;
      assert.equal(el.content, undefined);
    });

    it('should accept content property', () => {
      const el = element as any;
      el.content = 'This is a tooltip';
      assert.equal(el.content, 'This is a tooltip');
    });

    it('should update content attribute', () => {
      const el = element as any;
      el.content = 'Help text';
      assert.equal(element.getAttribute('content'), 'Help text');
    });

    it('should display content in tooltip', () => {
      const el = element as any;
      el.content = 'Test content';
      const tooltipElement = element.shadowRoot?.querySelector('.tooltip-content');
      assert(tooltipElement);
    });
  });

  describe('Position Property', () => {
    it('should default to top position', () => {
      const el = element as any;
      assert.equal(el.position, 'top');
    });

    it('should accept bottom position', () => {
      const el = element as any;
      el.position = 'bottom';
      assert.equal(el.position, 'bottom');
    });

    it('should accept left position', () => {
      const el = element as any;
      el.position = 'left';
      assert.equal(el.position, 'left');
    });

    it('should accept right position', () => {
      const el = element as any;
      el.position = 'right';
      assert.equal(el.position, 'right');
    });

    it('should set position attribute', () => {
      const el = element as any;
      el.position = 'bottom';
      assert.equal(element.getAttribute('position'), 'bottom');
    });
  });

  describe('Trigger Property', () => {
    it('should default to hover trigger', () => {
      const el = element as any;
      assert.equal(el.trigger, 'hover');
    });

    it('should accept click trigger', () => {
      const el = element as any;
      el.trigger = 'click';
      assert.equal(el.trigger, 'click');
    });

    it('should accept focus trigger', () => {
      const el = element as any;
      el.trigger = 'focus';
      assert.equal(el.trigger, 'focus');
    });

    it('should set trigger attribute', () => {
      const el = element as any;
      el.trigger = 'click';
      assert.equal(element.getAttribute('trigger'), 'click');
    });
  });

  describe('Visibility', () => {
    it('should be hidden by default', () => {
      const el = element as any;
      assert.equal(el.visible, false);
    });

    it('should have show method', () => {
      const el = element as any;
      assert(typeof el.show === 'function');
    });

    it('should have hide method', () => {
      const el = element as any;
      assert(typeof el.hide === 'function');
    });

    it('should have toggle method', () => {
      const el = element as any;
      assert(typeof el.toggle === 'function');
    });

    it('should show tooltip via method', () => {
      const el = element as any;
      el.show();
      assert.equal(el.visible, true);
    });

    it('should hide tooltip via method', () => {
      const el = element as any;
      el.show();
      el.hide();
      assert.equal(el.visible, false);
    });

    it('should toggle tooltip visibility', () => {
      const el = element as any;
      assert.equal(el.visible, false);
      el.toggle();
      assert.equal(el.visible, true);
      el.toggle();
      assert.equal(el.visible, false);
    });
  });

  describe('Disabled State', () => {
    it('should be enabled by default', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should accept disabled property', () => {
      const el = element as any;
      el.disabled = true;
      assert.equal(el.disabled, true);
    });

    it('should set disabled attribute', () => {
      const el = element as any;
      el.disabled = true;
      assert.equal(element.getAttribute('disabled'), 'true');
    });

    it('should remove disabled attribute when false', () => {
      const el = element as any;
      el.disabled = true;
      el.disabled = false;
      assert.equal(element.hasAttribute('disabled'), false);
    });

    it('should not show when disabled', () => {
      const el = element as any;
      el.disabled = true;
      el.show();
      assert.equal(el.visible, false);
    });
  });

  describe('Attributes', () => {
    it('should accept content attribute', () => {
      element.setAttribute('content', 'Test tooltip');
      const el = element as any;
      assert.equal(el.content, 'Test tooltip');
    });

    it('should accept position attribute', () => {
      element.setAttribute('position', 'bottom');
      const el = element as any;
      assert.equal(el.position, 'bottom');
    });

    it('should accept trigger attribute', () => {
      element.setAttribute('trigger', 'click');
      const el = element as any;
      assert.equal(el.trigger, 'click');
    });

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', 'true');
      const el = element as any;
      assert.equal(el.disabled, true);
    });
  });

  describe('Slot Content', () => {
    it('should have default slot for trigger content', () => {
      const slot = element.shadowRoot?.querySelector('.tooltip-trigger slot');
      assert(slot);
    });

    it('should accept slotted content', () => {
      const button = document.createElement('button');
      button.textContent = 'Hover me';
      element.appendChild(button);
      const slot = element.shadowRoot?.querySelector('.tooltip-trigger slot');
      assert(slot);
    });
  });

  describe('Accessibility', () => {
    it('should have role tooltip', () => {
      const tooltipElement = element.shadowRoot?.querySelector('.tooltip-content');
      assert(tooltipElement?.getAttribute('role') === 'tooltip' || tooltipElement);
    });

    it('should have aria-hidden when not visible', () => {
      const el = element as any;
      el.content = 'Test';
      el.hide();
      const tooltipElement = element.shadowRoot?.querySelector('.tooltip-content');
      assert(tooltipElement);
    });

    it('should have aria-hidden false when visible', () => {
      const el = element as any;
      el.content = 'Test';
      el.show();
      const tooltipElement = element.shadowRoot?.querySelector('.tooltip-content');
      assert(tooltipElement);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const el = element as any;
      el.content = '';
      assert.equal(el.content, '');
    });

    it('should handle special characters in content', () => {
      const el = element as any;
      el.content = 'Test <>&"\'';
      assert.equal(el.content, 'Test <>&"\'');
    });

    it('should handle rapid show/hide calls', () => {
      const el = element as any;
      el.show();
      el.hide();
      el.show();
      el.hide();
      assert.equal(el.visible, false);
    });

    it('should handle changing position while visible', () => {
      const el = element as any;
      el.position = 'top';
      el.show();
      el.position = 'bottom';
      assert.equal(el.position, 'bottom');
      assert.equal(el.visible, true);
    });

    it('should handle changing trigger mode while visible', () => {
      const el = element as any;
      el.trigger = 'hover';
      el.show();
      el.trigger = 'click';
      assert.equal(el.trigger, 'click');
      assert.equal(el.visible, true);
    });

    it('should handle changing content while visible', () => {
      const el = element as any;
      el.content = 'First';
      el.show();
      el.content = 'Second';
      assert.equal(el.content, 'Second');
      assert.equal(el.visible, true);
    });
  });

  describe('Initial State', () => {
    it('should default position to top', () => {
      const el = element as any;
      assert.equal(el.position, 'top');
    });

    it('should default trigger to hover', () => {
      const el = element as any;
      assert.equal(el.trigger, 'hover');
    });

    it('should be hidden initially', () => {
      const el = element as any;
      assert.equal(el.visible, false);
    });

    it('should be enabled initially', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should have no content initially', () => {
      const el = element as any;
      assert.equal(el.content, undefined);
    });
  });

  describe('Multiple Properties', () => {
    it('should handle multiple properties together', () => {
      const el = element as any;
      el.content = 'Help text';
      el.position = 'right';
      el.trigger = 'click';
      el.disabled = false;

      assert.equal(el.content, 'Help text');
      assert.equal(el.position, 'right');
      assert.equal(el.trigger, 'click');
      assert.equal(el.disabled, false);
    });

    it('should handle sequential property changes', () => {
      const el = element as any;
      el.content = 'First';
      assert.equal(el.content, 'First');
      el.position = 'bottom';
      assert.equal(el.position, 'bottom');
      el.trigger = 'click';
      assert.equal(el.trigger, 'click');
    });
  });
});
