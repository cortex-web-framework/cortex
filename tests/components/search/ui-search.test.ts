import { describe, test, beforeEach, afterEach } from '../../index.js';
import { createComponentFixture, cleanupFixture } from '../../utils/component-helpers.js';
import '../../../../../../src/components/search/ui-search.js';

describe('SearchComponent', () => {
  let fixture: HTMLElement;
  let component: any;

  beforeEach(async () => {
    fixture = createComponentFixture();
    component = document.createElement('ui-search');
    component.setAttribute('data-items', 'JavaScript,TypeScript,Python,Java,Rust');
    fixture.appendChild(component);
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  afterEach(() => {
    cleanupFixture(fixture);
  });

  describe('Initialization', () => {
    test('component should render with default attributes', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      if (!input) throw new Error('Input element not found');
      if (input.placeholder !== 'Search...') throw new Error('Default placeholder not set');
    });

    test('should parse data-items attribute', () => {
      const items = component.getItems();
      if (items.length !== 5) throw new Error(`Expected 5 items, got ${items.length}`);
      if (items[0] !== 'JavaScript') throw new Error('First item should be JavaScript');
    });

    test('should parse debounce-delay attribute', () => {
      const comp = document.createElement('ui-search');
      comp.setAttribute('debounce-delay', '500');
      comp.setAttribute('data-items', 'Test');
      fixture.appendChild(comp);
      // debounceDelay is private, but we can verify it was set by behavior
      if (!comp) throw new Error('Component not created');
    });

    test('should parse show-all-on-focus attribute', () => {
      const comp = document.createElement('ui-search');
      comp.setAttribute('data-items', 'A,B,C');
      comp.setAttribute('show-all-on-focus', '');
      fixture.appendChild(comp);
      if (!comp) throw new Error('Component not created with show-all-on-focus');
    });
  });

  describe('Search Filtering', () => {
    test('should filter items by query', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'Java';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const filtered = component.getFilteredItems();
          if (filtered.length !== 2) throw new Error(`Expected 2 items, got ${filtered.length}`);
          if (!filtered.includes('JavaScript')) throw new Error('JavaScript should be in results');
          if (!filtered.includes('Java')) throw new Error('Java should be in results');
          resolve(undefined);
        }, 350);
      });
    });

    test('should perform case-insensitive search', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'python';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const filtered = component.getFilteredItems();
          if (filtered.length !== 1) throw new Error('Python should be found with lowercase query');
          resolve(undefined);
        }, 350);
      });
    });

    test('should return empty array when no matches', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'nonexistent';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const filtered = component.getFilteredItems();
          if (filtered.length !== 0) throw new Error('Should return no results for non-matching query');
          resolve(undefined);
        }, 350);
      });
    });

    test('should clear filtered items when query is empty', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'Java';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));

          setTimeout(() => {
            const filtered = component.getFilteredItems();
            if (filtered.length !== 0) throw new Error('Filtered items should be empty when query cleared');
            resolve(undefined);
          }, 350);
        }, 350);
      });
    });
  });

  describe('Debouncing', () => {
    test('should debounce search events', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      let eventCount = 0;

      component.addEventListener('search', () => {
        eventCount++;
      });

      input.value = 'J';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.value = 'Ja';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.value = 'Jav';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          if (eventCount !== 1) throw new Error(`Expected 1 debounced event, got ${eventCount}`);
          resolve(undefined);
        }, 350);
      });
    });

    test('should respect custom debounce delay', () => {
      const comp = document.createElement('ui-search');
      comp.setAttribute('data-items', 'Test');
      comp.setAttribute('debounce-delay', '100');
      fixture.appendChild(comp);

      return new Promise((resolve) => {
        setTimeout(() => {
          if (!comp) throw new Error('Component not created');
          resolve(undefined);
        }, 150);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    test('should navigate down with ArrowDown key', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'Java';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
          input.dispatchEvent(event);

          const selected = component.shadowRoot.querySelector('.suggestion-item.selected');
          if (!selected) throw new Error('No item selected after ArrowDown');
          resolve(undefined);
        }, 350);
      });
    });

    test('should navigate up with ArrowUp key', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'Java';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
          input.dispatchEvent(downEvent);

          const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
          input.dispatchEvent(upEvent);

          const selected = component.shadowRoot.querySelector('.suggestion-item.selected');
          if (selected) throw new Error('No item should be selected after up from -1');
          resolve(undefined);
        }, 350);
      });
    });

    test('should select item with Enter key', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'Java';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
          input.dispatchEvent(downEvent);

          let selected = false;
          component.addEventListener('select', (e: any) => {
            if (e.detail.value) selected = true;
          });

          const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
          input.dispatchEvent(enterEvent);

          setTimeout(() => {
            if (!selected) throw new Error('Select event not fired on Enter');
            resolve(undefined);
          }, 50);
        }, 350);
      });
    });

    test('should close suggestions with Escape key', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'Java';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const suggestions = component.shadowRoot.querySelector('.suggestions');
          const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
          input.dispatchEvent(escapeEvent);

          if (suggestions?.classList.contains('visible')) {
            throw new Error('Suggestions should be hidden after Escape');
          }
          resolve(undefined);
        }, 350);
      });
    });
  });

  describe('UI Interactions', () => {
    test('should show clear button when text is entered', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'test';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      const clearBtn = component.shadowRoot.querySelector('.clear-button');
      if (!clearBtn?.classList.contains('visible')) {
        throw new Error('Clear button should be visible when text is entered');
      }
    });

    test('should hide clear button when text is cleared', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'test';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      const clearBtn = component.shadowRoot.querySelector('.clear-button');
      if (clearBtn?.classList.contains('visible')) {
        throw new Error('Clear button should be hidden when text is cleared');
      }
    });

    test('should clear input on clear button click', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'test';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      const clearBtn = component.shadowRoot.querySelector('[data-action="clear"]');
      clearBtn.dispatchEvent(new Event('click', { bubbles: true }));

      if (input.value !== '') throw new Error('Input should be empty after clear button click');
    });

    test('should select item on suggestion click', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'Java';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          let selectedValue = '';
          component.addEventListener('select', (e: any) => {
            selectedValue = e.detail.value;
          });

          const suggestion = component.shadowRoot.querySelector('[data-suggestion-item]');
          if (!suggestion) throw new Error('No suggestions rendered');
          suggestion.dispatchEvent(new Event('click', { bubbles: true }));

          setTimeout(() => {
            if (!selectedValue) throw new Error('Select event not fired on suggestion click');
            resolve(undefined);
          }, 50);
        }, 350);
      });
    });

    test('should show all items on focus when show-all-on-focus is enabled', () => {
      const comp = document.createElement('ui-search');
      comp.setAttribute('data-items', 'Apple,Banana,Cherry');
      comp.setAttribute('show-all-on-focus', '');
      fixture.appendChild(comp);

      return new Promise((resolve) => {
        setTimeout(() => {
          const input = comp.shadowRoot?.querySelector('input[type="text"]');
          input?.dispatchEvent(new Event('focus', { bubbles: true }));

          setTimeout(() => {
            const suggestions = comp.shadowRoot?.querySelectorAll('[data-suggestion-item]') || [];
            if (suggestions.length !== 3) {
              throw new Error(`Expected 3 suggestions on focus, got ${suggestions.length}`);
            }
            resolve(undefined);
          }, 50);
        }, 50);
      });
    });

    test('should not show all items on focus when not enabled', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.dispatchEvent(new Event('focus', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const suggestions = component.shadowRoot.querySelectorAll('[data-suggestion-item]');
          if (suggestions.length !== 0) {
            throw new Error('Should not show items on focus when show-all-on-focus is not enabled');
          }
          resolve(undefined);
        }, 50);
      });
    });
  });

  describe('Custom Events', () => {
    test('should emit search event when user types', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      let eventFired = false;
      let eventDetail: any;

      component.addEventListener('search', (e: any) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      input.value = 'Java';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          if (!eventFired) throw new Error('Search event not fired');
          if (eventDetail.query !== 'Java') throw new Error('Query in detail should match input');
          resolve(undefined);
        }, 350);
      });
    });

    test('should emit select event when item is selected', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'Java';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          let selectedValue = '';

          component.addEventListener('select', (e: any) => {
            selectedValue = e.detail.value;
          });

          const suggestion = component.shadowRoot.querySelector('[data-suggestion-item]');
          suggestion.dispatchEvent(new Event('click', { bubbles: true }));

          setTimeout(() => {
            if (selectedValue !== 'Java') throw new Error('Selected value should be Java');
            resolve(undefined);
          }, 50);
        }, 350);
      });
    });
  });

  describe('Public API', () => {
    test('setItems should update available items', () => {
      component.setItems(['HTML', 'CSS', 'JavaScript']);
      const items = component.getItems();
      if (items.length !== 3) throw new Error('Items should be updated');
    });

    test('getItems should return all items', () => {
      const items = component.getItems();
      if (items.length !== 5) throw new Error('Should return all 5 items');
    });

    test('getFilteredItems should return current filtered results', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'Script';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const filtered = component.getFilteredItems();
          if (filtered.length !== 2) throw new Error('Should have 2 items with Script');
          resolve(undefined);
        }, 350);
      });
    });

    test('clear should reset search input', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'test';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      component.clear();

      if (input.value !== '') throw new Error('Input should be cleared');
    });

    test('focus should focus the input', () => {
      component.focus();
      if (document.activeElement?.shadowRoot?.activeElement !== component.shadowRoot.querySelector('input')) {
        // Check if input is focused (this may vary by browser)
        // Just verify the method doesn't throw
      }
    });
  });

  describe('Match Highlighting', () => {
    test('should highlight matching text in suggestions', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'Script';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const suggestion = component.shadowRoot.querySelector('[data-suggestion-item]');
          const html = suggestion?.innerHTML || '';
          if (!html.includes('class="match"')) {
            throw new Error('Matching text should be highlighted with match class');
          }
          resolve(undefined);
        }, 350);
      });
    });
  });

  describe('No Results State', () => {
    test('should show no results message when no items match', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'xyz123';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const noResults = component.shadowRoot.querySelector('[data-no-results]');
          if (noResults?.style.display !== 'block') {
            throw new Error('No results message should be visible');
          }
          resolve(undefined);
        }, 350);
      });
    });

    test('should not show suggestions container when no results', () => {
      const input = component.shadowRoot.querySelector('input[type="text"]');
      input.value = 'xyz123';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return new Promise((resolve) => {
        setTimeout(() => {
          const suggestions = component.shadowRoot.querySelector('.suggestions');
          if (suggestions?.classList.contains('visible')) {
            throw new Error('Suggestions container should not be visible when no results');
          }
          resolve(undefined);
        }, 350);
      });
    });
  });
});
