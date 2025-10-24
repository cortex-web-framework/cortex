import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { ComponentRegistry } from './metadata.js';
import { generateComponentHTML, generateIndexHTML } from './doc-generator.js';

describe('Doc Generator', () => {
  describe('generateComponentHTML', () => {
    it('should generate HTML for a component', () => {
      const registry = new ComponentRegistry();
      registry.register({
        tag: 'ui-button',
        name: 'Button',
        description: 'A customizable button',
        props: [
          {
            name: 'variant',
            type: 'string',
            description: 'Visual style',
            default: '"primary"',
          },
        ],
        events: [
          {
            name: 'click',
            detail: 'MouseEvent',
            description: 'When clicked',
          },
        ],
      });

      const html = generateComponentHTML(registry.get('ui-button')!);
      assert(html.includes('ui-button'));
      assert(html.includes('Button'));
      assert(html.includes('A customizable button'));
      assert(html.includes('variant'));
      assert(html.includes('click'));
    });

    it('should handle components with examples', () => {
      const registry = new ComponentRegistry();
      registry.register({
        tag: 'ui-input',
        name: 'Input',
        description: 'Text input field',
        examples: [
          {
            title: 'Basic Input',
            code: '<ui-input></ui-input>',
          },
        ],
        props: [],
        events: [],
      });

      const html = generateComponentHTML(registry.get('ui-input')!);
      assert(html.includes('Basic Input'));
      assert(html.includes('ui-input'));
    });

    it('should handle optional fields', () => {
      const registry = new ComponentRegistry();
      registry.register({
        tag: 'ui-test',
        name: 'Test',
        description: 'Test component',
        props: [],
        events: [],
      });

      const html = generateComponentHTML(registry.get('ui-test')!);
      assert(html.includes('Test'));
      assert.doesNotThrow(() => generateComponentHTML(registry.get('ui-test')!));
    });
  });

  describe('generateIndexHTML', () => {
    it('should generate index HTML with all components', () => {
      const registry = new ComponentRegistry();
      registry.register({
        tag: 'ui-button',
        name: 'Button',
        category: 'Buttons & Actions',
        description: 'A customizable button',
        props: [],
        events: [],
      });
      registry.register({
        tag: 'ui-input',
        name: 'Input',
        category: 'Basic Input Controls',
        description: 'Text input field',
        props: [],
        events: [],
      });

      const html = generateIndexHTML(registry);
      assert(html.includes('Cortex UI Component Library'));
      assert(html.includes('Button'));
      assert(html.includes('Input'));
      assert(html.includes('Buttons & Actions'));
      assert(html.includes('Basic Input Controls'));
    });

    it('should organize components by category', () => {
      const registry = new ComponentRegistry();
      registry.register({
        tag: 'ui-button',
        name: 'Button',
        category: 'Buttons & Actions',
        description: 'A customizable button',
        props: [],
        events: [],
      });
      registry.register({
        tag: 'ui-fab',
        name: 'Floating Action Button',
        category: 'Buttons & Actions',
        description: 'A floating action button',
        props: [],
        events: [],
      });

      const html = generateIndexHTML(registry);
      const buttonIndex = html.indexOf('ui-button');
      const fabIndex = html.indexOf('ui-fab');
      assert(buttonIndex > -1);
      assert(fabIndex > -1);
    });

    it('should include basic HTML structure', () => {
      const registry = new ComponentRegistry();
      registry.register({
        tag: 'ui-button',
        name: 'Button',
        description: 'A button',
        props: [],
        events: [],
      });

      const html = generateIndexHTML(registry);
      assert(html.includes('<!DOCTYPE html>'));
      assert(html.includes('<html'));
      assert(html.includes('<head>'));
      assert(html.includes('<body>'));
      assert(html.includes('</html>'));
    });

    it('should include component count in title', () => {
      const registry = new ComponentRegistry();
      registry.register({
        tag: 'ui-button',
        name: 'Button',
        description: 'A button',
        props: [],
        events: [],
      });
      registry.register({
        tag: 'ui-input',
        name: 'Input',
        description: 'An input',
        props: [],
        events: [],
      });

      const html = generateIndexHTML(registry);
      assert(html.includes('2'));
    });
  });
});
