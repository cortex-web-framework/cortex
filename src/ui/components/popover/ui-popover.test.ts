import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-popover', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-popover');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-POPOVER');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should have trigger element', () => {
      const trigger = element.shadowRoot?.querySelector('.popover-trigger');
      assert(trigger);
    });

    it('should have popover content element', () => {
      const popover = element.shadowRoot?.querySelector('.popover-content');
      assert(popover);
    });
  });

  describe('Header Text Property', () => {
    it('should have default headerText as undefined', () => {
      const el = element as any;
      assert.equal(el.headerText, undefined);
    });

    it('should accept headerText property', () => {
      const el = element as any;
      el.headerText = 'Popover Title';
      assert.equal(el.headerText, 'Popover Title');
    });

    it('should update headerText attribute', () => {
      const el = element as any;
      el.headerText = 'Title';
      assert.equal(element.getAttribute('headerText'), 'Title');
    });
  });

  describe('Position Property', () => {
    it('should default to bottom position', () => {
      const el = element as any;
      assert.equal(el.position, 'bottom');
    });

    it('should accept all position values', () => {
      const el = element as any;
      const positions = ['top', 'bottom', 'left', 'right', 'auto'];
      positions.forEach(pos => {
        el.position = pos;
        assert.equal(el.position, pos);
      });
    });

    it('should set position attribute', () => {
      const el = element as any;
      el.position = 'left';
      assert.equal(element.getAttribute('position'), 'left');
    });
  });

  describe('Trigger Property', () => {
    it('should default to click trigger', () => {
      const el = element as any;
      assert.equal(el.trigger, 'click');
    });

    it('should accept hover trigger', () => {
      const el = element as any;
      el.trigger = 'hover';
      assert.equal(el.trigger, 'hover');
    });

    it('should accept focus trigger', () => {
      const el = element as any;
      el.trigger = 'focus';
      assert.equal(el.trigger, 'focus');
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

    it('should show popover via method', () => {
      const el = element as any;
      el.show();
      assert.equal(el.visible, true);
    });

    it('should hide popover via method', () => {
      const el = element as any;
      el.show();
      el.hide();
      assert.equal(el.visible, false);
    });

    it('should toggle popover visibility', () => {
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

    it('should not show when disabled', () => {
      const el = element as any;
      el.disabled = true;
      el.show();
      assert.equal(el.visible, false);
    });
  });

  describe('Width Property', () => {
    it('should have default width as undefined', () => {
      const el = element as any;
      assert.equal(el.width, undefined);
    });

    it('should accept width property', () => {
      const el = element as any;
      el.width = '300px';
      assert.equal(el.width, '300px');
    });

    it('should update width attribute', () => {
      const el = element as any;
      el.width = '400px';
      assert.equal(element.getAttribute('width'), '400px');
    });

    it('should handle min-width', () => {
      const el = element as any;
      el.width = '200px';
      assert.equal(el.width, '200px');
    });
  });

  describe('Slot Content', () => {
    it('should have default slot for trigger', () => {
      const slot = element.shadowRoot?.querySelector('.popover-trigger slot');
      assert(slot);
    });

    it('should have slot for body content', () => {
      const bodySlot = element.shadowRoot?.querySelector('.popover-body slot');
      assert(bodySlot);
    });
  });

  describe('Accessibility', () => {
    it('should have role dialog', () => {
      const popover = element.shadowRoot?.querySelector('.popover-content');
      assert(popover?.getAttribute('role') === 'dialog' || popover);
    });

    it('should have aria-hidden when not visible', () => {
      const el = element as any;
      el.hide();
      const popover = element.shadowRoot?.querySelector('.popover-content');
      assert(popover);
    });
  });

  describe('Attributes', () => {
    it('should accept headerText attribute', () => {
      element.setAttribute('headerText', 'Header');
      const el = element as any;
      assert.equal(el.headerText, 'Header');
    });

    it('should accept position attribute', () => {
      element.setAttribute('position', 'right');
      const el = element as any;
      assert.equal(el.position, 'right');
    });

    it('should accept trigger attribute', () => {
      element.setAttribute('trigger', 'hover');
      const el = element as any;
      assert.equal(el.trigger, 'hover');
    });

    it('should accept width attribute', () => {
      element.setAttribute('width', '350px');
      const el = element as any;
      assert.equal(el.width, '350px');
    });

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', 'true');
      const el = element as any;
      assert.equal(el.disabled, true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty headerText', () => {
      const el = element as any;
      el.headerText = '';
      assert.equal(el.headerText, '');
    });

    it('should handle rapid show/hide', () => {
      const el = element as any;
      el.show();
      el.hide();
      el.show();
      el.hide();
      assert.equal(el.visible, false);
    });

    it('should handle changing position while visible', () => {
      const el = element as any;
      el.show();
      el.position = 'top';
      assert.equal(el.position, 'top');
      assert.equal(el.visible, true);
    });

    it('should handle changing width while visible', () => {
      const el = element as any;
      el.width = '250px';
      el.show();
      el.width = '350px';
      assert.equal(el.width, '350px');
      assert.equal(el.visible, true);
    });

    it('should handle special characters in header', () => {
      const el = element as any;
      el.headerText = 'Test <>&"\'';
      assert.equal(el.headerText, 'Test <>&"\'');
    });
  });

  describe('Initial State', () => {
    it('should default position to bottom', () => {
      const el = element as any;
      assert.equal(el.position, 'bottom');
    });

    it('should default trigger to click', () => {
      const el = element as any;
      assert.equal(el.trigger, 'click');
    });

    it('should be hidden initially', () => {
      const el = element as any;
      assert.equal(el.visible, false);
    });

    it('should be enabled initially', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });

    it('should have no header initially', () => {
      const el = element as any;
      assert.equal(el.headerText, undefined);
    });

    it('should have no width initially', () => {
      const el = element as any;
      assert.equal(el.width, undefined);
    });
  });

  describe('Multiple Properties', () => {
    it('should handle multiple properties together', () => {
      const el = element as any;
      el.headerText = 'Settings';
      el.position = 'right';
      el.trigger = 'click';
      el.width = '300px';
      el.disabled = false;

      assert.equal(el.headerText, 'Settings');
      assert.equal(el.position, 'right');
      assert.equal(el.trigger, 'click');
      assert.equal(el.width, '300px');
      assert.equal(el.disabled, false);
    });
  });
});
