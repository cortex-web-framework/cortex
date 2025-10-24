import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-empty-state', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-empty-state');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-EMPTY-STATE');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should have container', () => {
      const container = element.shadowRoot?.querySelector('.empty-state-container');
      assert(container);
    });
  });

  describe('Heading Text Property', () => {
    it('should have default headingText as undefined', () => {
      const el = element as any;
      assert.equal(el.headingText, undefined);
    });

    it('should accept headingText property', () => {
      const el = element as any;
      el.headingText = 'No Data';
      assert.equal(el.headingText, 'No Data');
    });

    it('should update headingText attribute', () => {
      const el = element as any;
      el.headingText = 'Empty';
      assert.equal(element.getAttribute('headingText'), 'Empty');
    });
  });

  describe('Description Property', () => {
    it('should have default description as undefined', () => {
      const el = element as any;
      assert.equal(el.description, undefined);
    });

    it('should accept description property', () => {
      const el = element as any;
      el.description = 'Try searching again';
      assert.equal(el.description, 'Try searching again');
    });

    it('should update description attribute', () => {
      const el = element as any;
      el.description = 'Start adding items';
      assert.equal(element.getAttribute('description'), 'Start adding items');
    });
  });

  describe('Icon Property', () => {
    it('should have default icon as undefined', () => {
      const el = element as any;
      assert.equal(el.icon, undefined);
    });

    it('should accept icon property', () => {
      const el = element as any;
      el.icon = '📭';
      assert.equal(el.icon, '📭');
    });

    it('should update icon attribute', () => {
      const el = element as any;
      el.icon = '🔍';
      assert.equal(element.getAttribute('icon'), '🔍');
    });
  });

  describe('Attributes', () => {
    it('should accept headingText attribute', () => {
      element.setAttribute('headingText', 'No Results');
      const el = element as any;
      assert.equal(el.headingText, 'No Results');
    });

    it('should accept description attribute', () => {
      element.setAttribute('description', 'Try modifying your search');
      const el = element as any;
      assert.equal(el.description, 'Try modifying your search');
    });

    it('should accept icon attribute', () => {
      element.setAttribute('icon', '❌');
      const el = element as any;
      assert.equal(el.icon, '❌');
    });
  });

  describe('Slot Content', () => {
    it('should have default slot', () => {
      const slot = element.shadowRoot?.querySelector('slot');
      assert(slot);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const el = element as any;
      el.headingText = '';
      el.description = '';
      assert.equal(el.headingText, '');
      assert.equal(el.description, '');
    });

    it('should handle special characters', () => {
      const el = element as any;
      el.headingText = 'No data found!';
      el.description = 'Please try again...';
      assert.equal(el.headingText, 'No data found!');
      assert.equal(el.description, 'Please try again...');
    });

    it('should handle all properties together', () => {
      const el = element as any;
      el.headingText = 'Not Found';
      el.description = 'No items to display';
      el.icon = '🔎';
      assert.equal(el.headingText, 'Not Found');
      assert.equal(el.description, 'No items to display');
      assert.equal(el.icon, '🔎');
    });
  });

  describe('Initial State', () => {
    it('should have no heading text initially', () => {
      const el = element as any;
      assert.equal(el.headingText, undefined);
    });

    it('should have no description initially', () => {
      const el = element as any;
      assert.equal(el.description, undefined);
    });

    it('should have no icon initially', () => {
      const el = element as any;
      assert.equal(el.icon, undefined);
    });
  });
});
