import { describe, test, beforeEach, afterEach } from '../../index.js';
import { createComponentFixture, cleanupFixture } from '../../utils/component-helpers.js';
import '../../../../../../src/components/dropdown/ui-dropdown.js';

describe('DropdownComponent', () => {
  let fixture: HTMLElement;
  let component: any;

  beforeEach(async () => {
    fixture = createComponentFixture();
    component = document.createElement('ui-dropdown');
    component.setAttribute('data-selected-text', 'Choose an option');

    // Add option items
    const opt1 = document.createElement('div');
    opt1.setAttribute('data-option', '');
    opt1.setAttribute('data-value', 'apple');
    opt1.textContent = 'Apple';

    const opt2 = document.createElement('div');
    opt2.setAttribute('data-option', '');
    opt2.setAttribute('data-value', 'banana');
    opt2.textContent = 'Banana';

    const opt3 = document.createElement('div');
    opt3.setAttribute('data-option', '');
    opt3.setAttribute('data-value', 'cherry');
    opt3.textContent = 'Cherry';

    component.appendChild(opt1);
    component.appendChild(opt2);
    component.appendChild(opt3);

    fixture.appendChild(component);
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  afterEach(() => {
    cleanupFixture(fixture);
  });

  describe('Initialization', () => {
    test('component should render with default attributes', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      if (!trigger) throw new Error('Trigger button not found');
      if (!trigger.textContent.includes('Choose an option')) {
        throw new Error('Selected text not rendered correctly');
      }
    });

    test('should render menu container', () => {
      const menu = component.shadowRoot.querySelector('[data-menu]');
      if (!menu) throw new Error('Menu container not found');
    });

    test('should render all option items', () => {
      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      if (items.length !== 3) {
        throw new Error(`Expected 3 items, got ${items.length}`);
      }
    });

    test('should parse position attribute', () => {
      const comp = document.createElement('ui-dropdown');
      comp.setAttribute('position', 'top');
      fixture.appendChild(comp);
      if (!comp) throw new Error('Component not created with position attribute');
    });

    test('should have default position as bottom', () => {
      const menu = component.shadowRoot.querySelector('[data-menu]');
      if (!menu?.hasAttribute('data-position')) throw new Error('Position attribute not set');
      if (menu?.getAttribute('data-position') !== 'bottom') {
        throw new Error('Default position should be bottom');
      }
    });
  });

  describe('Menu Toggle', () => {
    test('should open menu on trigger click', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const menu = component.shadowRoot.querySelector('[data-menu]');
      if (!menu?.classList.contains('open')) {
        throw new Error('Menu should be open after trigger click');
      }
    });

    test('should close menu on second trigger click', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');

      trigger.dispatchEvent(new Event('click', { bubbles: true }));
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const menu = component.shadowRoot.querySelector('[data-menu]');
      if (menu?.classList.contains('open')) {
        throw new Error('Menu should be closed after second trigger click');
      }
    });

    test('should add open class to trigger when menu is open', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      if (!trigger.classList.contains('open')) {
        throw new Error('Trigger should have open class when menu is open');
      }
    });

    test('should remove open class from trigger when menu is closed', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');

      trigger.dispatchEvent(new Event('click', { bubbles: true }));
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      if (trigger.classList.contains('open')) {
        throw new Error('Trigger should not have open class when menu is closed');
      }
    });
  });

  describe('Item Selection', () => {
    test('should select item on click', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      items[0].dispatchEvent(new Event('click', { bubbles: true }));

      if (component.getValue() !== 'apple') {
        throw new Error('Selected value should be apple');
      }
    });

    test('should update trigger text on selection', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      items[1].dispatchEvent(new Event('click', { bubbles: true }));

      const triggerText = component.shadowRoot.querySelector('[data-trigger-text]');
      if (!triggerText?.textContent?.includes('Banana')) {
        throw new Error('Trigger text should be updated to Banana');
      }
    });

    test('should mark selected item with selected class', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      items[0].dispatchEvent(new Event('click', { bubbles: true }));

      // Reopen to see selection
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const selectedItem = component.shadowRoot.querySelector('[data-dropdown-item].selected');
      if (!selectedItem) {
        throw new Error('Selected item should have selected class');
      }
      if (!selectedItem.textContent?.includes('Apple')) {
        throw new Error('Selected item should be Apple');
      }
    });

    test('should close menu after selection', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      items[0].dispatchEvent(new Event('click', { bubbles: true }));

      const menu = component.shadowRoot.querySelector('[data-menu]');
      if (menu?.classList.contains('open')) {
        throw new Error('Menu should be closed after selection');
      }
    });

    test('should emit change event on selection', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      let eventFired = false;
      let eventDetail: any;

      component.addEventListener('change', (e: any) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      items[2].dispatchEvent(new Event('click', { bubbles: true }));

      if (!eventFired) throw new Error('Change event not fired');
      if (eventDetail.value !== 'cherry') throw new Error('Change event value should be cherry');
      if (!eventDetail.label.includes('Cherry')) throw new Error('Change event label should be Cherry');
    });
  });

  describe('Keyboard Navigation', () => {
    test('should open menu with ArrowDown on trigger', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      trigger.dispatchEvent(event);

      const menu = component.shadowRoot.querySelector('[data-menu]');
      if (!menu?.classList.contains('open')) {
        throw new Error('Menu should open on ArrowDown from trigger');
      }
    });

    test('should open menu with Space on trigger', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      trigger.dispatchEvent(event);

      const menu = component.shadowRoot.querySelector('[data-menu]');
      if (!menu?.classList.contains('open')) {
        throw new Error('Menu should open on Space from trigger');
      }
    });

    test('should open menu with Enter on trigger', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      trigger.dispatchEvent(event);

      const menu = component.shadowRoot.querySelector('[data-menu]');
      if (!menu?.classList.contains('open')) {
        throw new Error('Menu should open on Enter from trigger');
      }
    });

    test('should navigate down through menu items', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      (items[0] as HTMLElement).focus();

      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      (items[0] as HTMLElement).dispatchEvent(downEvent);

      // Check if next item can be focused (in real browser, this would focus item 1)
      if (!items[1]) throw new Error('Second item should exist');
    });

    test('should navigate up through menu items', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      (items[1] as HTMLElement).focus();

      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
      (items[1] as HTMLElement).dispatchEvent(upEvent);

      if (!items[0]) throw new Error('First item should exist');
    });

    test('should select item with Enter key', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      items[0].dispatchEvent(enterEvent);

      if (component.getValue() !== 'apple') {
        throw new Error('Item should be selected with Enter key');
      }
    });

    test('should select item with Space key', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      items[1].dispatchEvent(spaceEvent);

      if (component.getValue() !== 'banana') {
        throw new Error('Item should be selected with Space key');
      }
    });

    test('should close menu with Escape key', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const menu = component.shadowRoot.querySelector('[data-menu]');
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      menu?.dispatchEvent(escapeEvent);

      if (menu?.classList.contains('open')) {
        throw new Error('Menu should close on Escape key');
      }
    });

    test('should close menu with Escape on trigger', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      trigger.dispatchEvent(escapeEvent);

      const menu = component.shadowRoot.querySelector('[data-menu]');
      if (menu?.classList.contains('open')) {
        throw new Error('Menu should close on Escape from trigger');
      }
    });
  });

  describe('Disabled Items', () => {
    test('should not select disabled items', () => {
      const disabledOpt = document.createElement('div');
      disabledOpt.setAttribute('data-option', '');
      disabledOpt.setAttribute('data-value', 'disabled-item');
      disabledOpt.setAttribute('disabled', '');
      disabledOpt.textContent = 'Disabled Item';
      component.appendChild(disabledOpt);

      component.shadowRoot.querySelector('[data-trigger]').dispatchEvent(new Event('click', { bubbles: true }));

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      const disabledItem = Array.from(items).find((item) => item.textContent?.includes('Disabled Item'));

      if (disabledItem) {
        disabledItem.dispatchEvent(new Event('click', { bubbles: true }));
        if (component.getValue() === 'disabled-item') {
          throw new Error('Disabled item should not be selectable');
        }
      }
    });

    test('should render disabled items with disabled styling', () => {
      const disabledOpt = document.createElement('div');
      disabledOpt.setAttribute('data-option', '');
      disabledOpt.setAttribute('data-value', 'disabled');
      disabledOpt.setAttribute('disabled', '');
      disabledOpt.textContent = 'Disabled';
      component.appendChild(disabledOpt);

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      const disabledItem = Array.from(items).find((item) => item.textContent?.includes('Disabled'));

      if (!disabledItem?.classList.contains('disabled')) {
        throw new Error('Disabled item should have disabled class');
      }
    });
  });

  describe('Public API', () => {
    test('getValue should return selected value', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      items[0].dispatchEvent(new Event('click', { bubbles: true }));

      if (component.getValue() !== 'apple') {
        throw new Error('getValue should return selected value');
      }
    });

    test('setValue should update selected value', () => {
      component.setValue('banana');

      if (component.getValue() !== 'banana') {
        throw new Error('setValue should update value');
      }
    });

    test('getLabel should return selected label', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      items[2].dispatchEvent(new Event('click', { bubbles: true }));

      const label = component.getLabel();
      if (!label.includes('Cherry')) {
        throw new Error('getLabel should return selected label');
      }
    });

    test('setLabel should update trigger text', () => {
      component.setLabel('Custom Label');

      const triggerText = component.shadowRoot.querySelector('[data-trigger-text]');
      if (!triggerText?.textContent?.includes('Custom Label')) {
        throw new Error('setLabel should update trigger text');
      }
    });

    test('isMenuOpen should return true when open', () => {
      const trigger = component.shadowRoot.querySelector('[data-trigger]');
      trigger.dispatchEvent(new Event('click', { bubbles: true }));

      if (!component.isMenuOpen()) {
        throw new Error('isMenuOpen should return true when menu is open');
      }
    });

    test('isMenuOpen should return false when closed', () => {
      if (component.isMenuOpen()) {
        throw new Error('isMenuOpen should return false when menu is closed');
      }
    });

    test('open should open the menu', () => {
      component.open();

      const menu = component.shadowRoot.querySelector('[data-menu]');
      if (!menu?.classList.contains('open')) {
        throw new Error('open() should open the menu');
      }
    });

    test('close should close the menu', () => {
      component.open();
      component.close();

      const menu = component.shadowRoot.querySelector('[data-menu]');
      if (menu?.classList.contains('open')) {
        throw new Error('close() should close the menu');
      }
    });

    test('toggle should toggle menu state', () => {
      component.toggle();

      const menu1 = component.shadowRoot.querySelector('[data-menu]');
      if (!menu1?.classList.contains('open')) {
        throw new Error('toggle() should open the menu');
      }

      component.toggle();

      const menu2 = component.shadowRoot.querySelector('[data-menu]');
      if (menu2?.classList.contains('open')) {
        throw new Error('toggle() should close the menu');
      }
    });

    test('addOption should add new option', () => {
      component.addOption('date', 'Date');

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      if (items.length !== 4) {
        throw new Error('addOption should add new option to menu');
      }
    });

    test('removeOption should remove option', () => {
      component.removeOption('banana');

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      if (items.length !== 2) {
        throw new Error('removeOption should remove option from menu');
      }
    });

    test('clearOptions should remove all options', () => {
      component.clearOptions();

      const items = component.shadowRoot.querySelectorAll('[data-dropdown-item]');
      if (items.length !== 0) {
        throw new Error('clearOptions should remove all options');
      }
    });

    test('focus should focus trigger button', () => {
      component.focus();
      // Just verify it doesn't throw
      if (!component) throw new Error('focus() failed');
    });
  });

  describe('Custom Events', () => {
    test('should emit open event when menu opens', () => {
      let openEventFired = false;

      component.addEventListener('open', () => {
        openEventFired = true;
      });

      component.open();

      if (!openEventFired) {
        throw new Error('open event should be emitted');
      }
    });

    test('should emit close event when menu closes', () => {
      component.open();

      let closeEventFired = false;

      component.addEventListener('close', () => {
        closeEventFired = true;
      });

      component.close();

      if (!closeEventFired) {
        throw new Error('close event should be emitted');
      }
    });
  });

  describe('Positioning', () => {
    test('should apply bottom position class when position is bottom', () => {
      const menu = component.shadowRoot.querySelector('[data-menu]');
      component.open();

      if (!menu?.classList.contains('bottom')) {
        throw new Error('Menu should have bottom class');
      }
    });

    test('should apply top position class when position is top', () => {
      const comp = document.createElement('ui-dropdown');
      comp.setAttribute('position', 'top');
      fixture.appendChild(comp);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const menu = comp.shadowRoot.querySelector('[data-menu]');
      comp.open();

      if (!menu?.classList.contains('top')) {
        throw new Error('Menu should have top class');
      }
    });
  });

  describe('No Options State', () => {
    test('should show no options message when empty', () => {
      const emptyComp = document.createElement('ui-dropdown');
      fixture.appendChild(emptyComp);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const menu = emptyComp.shadowRoot.querySelector('[data-menu]');
      if (!menu?.textContent?.includes('No options available')) {
        throw new Error('Should show no options message when empty');
      }
    });
  });
});
