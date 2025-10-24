import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  ComponentMetadata,
  ComponentRegistry,
  PropSchema,
  EventSchema,
} from './metadata.js';

describe('ComponentMetadata', () => {
  describe('PropSchema validation', () => {
    it('should require name and type properties', () => {
      const validProp: PropSchema = {
        name: 'variant',
        type: 'string',
        description: 'Button variant',
      };
      assert.equal(validProp.name, 'variant');
      assert.equal(validProp.type, 'string');
    });

    it('should support union types as string literal', () => {
      const unionProp: PropSchema = {
        name: 'variant',
        type: '"primary" | "secondary" | "ghost"',
        description: 'Button variant',
      };
      assert.equal(unionProp.type, '"primary" | "secondary" | "ghost"');
    });

    it('should support optional default value', () => {
      const propWithDefault: PropSchema = {
        name: 'disabled',
        type: 'boolean',
        default: false,
        description: 'Is button disabled',
      };
      assert.equal(propWithDefault.default, false);
    });

    it('should support optional required flag', () => {
      const requiredProp: PropSchema = {
        name: 'onClick',
        type: '(event: Event) => void',
        required: true,
      };
      assert.equal(requiredProp.required, true);
    });
  });

  describe('EventSchema validation', () => {
    it('should require name and detail type', () => {
      const event: EventSchema = {
        name: 'click',
        detail: 'CustomEvent<void>',
        description: 'Fired when button is clicked',
      };
      assert.equal(event.name, 'click');
      assert.equal(event.detail, 'CustomEvent<void>');
    });
  });

  describe('ComponentMetadata validation', () => {
    it('should require tag name and description', () => {
      const metadata: ComponentMetadata = {
        tag: 'ui-button',
        name: 'Button',
        description: 'A customizable button component',
        props: [],
        events: [],
      };
      assert.equal(metadata.tag, 'ui-button');
      assert.equal(metadata.name, 'Button');
    });

    it('should support optional category', () => {
      const metadata: ComponentMetadata = {
        tag: 'ui-button',
        name: 'Button',
        category: 'Buttons & Actions',
        description: 'A customizable button component',
        props: [],
        events: [],
      };
      assert.equal(metadata.category, 'Buttons & Actions');
    });

    it('should support optional examples', () => {
      const metadata: ComponentMetadata = {
        tag: 'ui-button',
        name: 'Button',
        description: 'A customizable button component',
        examples: [
          {
            title: 'Primary Button',
            code: '<ui-button variant="primary">Click me</ui-button>',
          },
        ],
        props: [],
        events: [],
      };
      assert.equal(metadata.examples?.length, 1);
      assert.equal(metadata.examples[0].title, 'Primary Button');
    });

    it('should support optional slots', () => {
      const metadata: ComponentMetadata = {
        tag: 'ui-button',
        name: 'Button',
        description: 'A customizable button component',
        slots: [
          {
            name: 'default',
            description: 'The button content',
          },
        ],
        props: [],
        events: [],
      };
      assert.equal(metadata.slots?.length, 1);
      assert.equal(metadata.slots[0].name, 'default');
    });

    it('should support optional CSS properties', () => {
      const metadata: ComponentMetadata = {
        tag: 'ui-button',
        name: 'Button',
        description: 'A customizable button component',
        cssProps: [
          {
            name: '--ui-button-background-color',
            description: 'Background color of the button',
            default: 'var(--ui-color-primary)',
          },
        ],
        props: [],
        events: [],
      };
      assert.equal(metadata.cssProps?.length, 1);
      assert.equal(metadata.cssProps[0].name, '--ui-button-background-color');
    });
  });

  describe('ComponentRegistry', () => {
    it('should register and retrieve metadata', () => {
      const registry = new ComponentRegistry();
      const metadata: ComponentMetadata = {
        tag: 'ui-button',
        name: 'Button',
        description: 'A customizable button component',
        props: [],
        events: [],
      };

      registry.register(metadata);
      const retrieved = registry.get('ui-button');

      assert.equal(retrieved?.tag, 'ui-button');
      assert.equal(retrieved?.name, 'Button');
    });

    it('should throw error when registering duplicate tag', () => {
      const registry = new ComponentRegistry();
      const metadata: ComponentMetadata = {
        tag: 'ui-button',
        name: 'Button',
        description: 'A customizable button component',
        props: [],
        events: [],
      };

      registry.register(metadata);
      assert.throws(
        () => registry.register(metadata),
        /already registered/i
      );
    });

    it('should list all registered components', () => {
      const registry = new ComponentRegistry();
      const button: ComponentMetadata = {
        tag: 'ui-button',
        name: 'Button',
        description: 'A customizable button component',
        props: [],
        events: [],
      };
      const input: ComponentMetadata = {
        tag: 'ui-input',
        name: 'Input',
        description: 'A text input component',
        props: [],
        events: [],
      };

      registry.register(button);
      registry.register(input);

      const all = registry.list();
      assert.equal(all.length, 2);
      assert.equal(all[0].tag, 'ui-button');
      assert.equal(all[1].tag, 'ui-input');
    });

    it('should list components by category', () => {
      const registry = new ComponentRegistry();
      const button: ComponentMetadata = {
        tag: 'ui-button',
        name: 'Button',
        category: 'Buttons & Actions',
        description: 'A customizable button component',
        props: [],
        events: [],
      };
      const fab: ComponentMetadata = {
        tag: 'ui-fab',
        name: 'Floating Action Button',
        category: 'Buttons & Actions',
        description: 'A floating action button',
        props: [],
        events: [],
      };
      const input: ComponentMetadata = {
        tag: 'ui-input',
        name: 'Input',
        category: 'Basic Input Controls',
        description: 'A text input component',
        props: [],
        events: [],
      };

      registry.register(button);
      registry.register(fab);
      registry.register(input);

      const buttonsCategory = registry.listByCategory('Buttons & Actions');
      assert.equal(buttonsCategory.length, 2);
      assert.equal(buttonsCategory[0].tag, 'ui-button');
      assert.equal(buttonsCategory[1].tag, 'ui-fab');

      const inputsCategory = registry.listByCategory('Basic Input Controls');
      assert.equal(inputsCategory.length, 1);
      assert.equal(inputsCategory[0].tag, 'ui-input');
    });

    it('should return empty array for non-existent category', () => {
      const registry = new ComponentRegistry();
      const empty = registry.listByCategory('Nonexistent');
      assert.equal(empty.length, 0);
    });

    it('should return all categories', () => {
      const registry = new ComponentRegistry();
      registry.register({
        tag: 'ui-button',
        name: 'Button',
        category: 'Buttons & Actions',
        description: 'A customizable button component',
        props: [],
        events: [],
      });
      registry.register({
        tag: 'ui-input',
        name: 'Input',
        category: 'Basic Input Controls',
        description: 'A text input component',
        props: [],
        events: [],
      });

      const categories = registry.getCategories();
      assert.equal(categories.length, 2);
      assert(categories.includes('Buttons & Actions'));
      assert(categories.includes('Basic Input Controls'));
    });
  });
});
