import '../../../../browser-env.js';
import { describe, test } from '../../../../tests/test-runner.js';
import { customFixture, customExpect } from '../../../../tests/custom-test-utils.js';
import './ui-text-input.js'; // Import the component to be tested

describe('ui-text-input', () => {
  let element: HTMLElement;

  describe('rendering', () => {
    test('should render a text input component', () => {
      element = customFixture('ui-text-input');
      customExpect(element).toExist();
      customExpect(element.shadowRoot).toExist();
      const input = element.shadowRoot!.querySelector('input');
      customExpect(input).toExist();
      customExpect(input!.type).toEqual('text');
    });

    test('should render with a label if provided', () => {
      element = customFixture('ui-text-input', { label: "Username" });
      const label = element.shadowRoot!.querySelector('label');
      customExpect(label).toExist();
      customExpect(label!.textContent).toEqual('Username');
      const input = element.shadowRoot!.querySelector('input');
      customExpect(input!.id).toEqual(label!.htmlFor);
    });
  });

  describe('properties', () => {
    test('should set the value property', () => {
      element = customFixture('ui-text-input', { value: "test" });
      const input = element.shadowRoot!.querySelector('input');
      customExpect(input!.value).toEqual('test');
      customExpect((element as any).value).toEqual('test');
    });

    test('should set the placeholder property', () => {
      element = customFixture('ui-text-input', { placeholder: "Enter text" });
      const input = element.shadowRoot!.querySelector('input');
      customExpect(input!.placeholder).toEqual('Enter text');
      customExpect((element as any).placeholder).toEqual('Enter text');
    });

    test('should set the disabled property', () => {
      element = customFixture('ui-text-input', { disabled: "" }); // Attributes are strings
      const input = element.shadowRoot!.querySelector('input');
      customExpect(input!.disabled).toBeTrue();
      customExpect((element as any).disabled).toBeTrue();
    });

    test('should set the readonly property', () => {
      element = customFixture('ui-text-input', { readonly: "" }); // Attributes are strings
      const input = element.shadowRoot!.querySelector('input');
      customExpect(input!.readOnly).toBeTrue();
      customExpect((element as any).readOnly).toBeTrue();
    });

    test('should set the type property', () => {
      element = customFixture('ui-text-input', { type: "password" });
      const input = element.shadowRoot!.querySelector('input');
      customExpect(input!.type).toEqual('password');
      customExpect((element as any).type).toEqual('password');
    });

    test('should set the name property', () => {
      element = customFixture('ui-text-input', { name: "my-input" });
      const input = element.shadowRoot!.querySelector('input');
      customExpect(input!.name).toEqual('my-input');
      customExpect((element as any).name).toEqual('my-input');
    });
  });

  describe('accessibility', () => {
    test('should associate label with input using id and htmlFor', () => {
      element = customFixture('ui-text-input', { label: "Email", id: "email-input" });
      const label = element.shadowRoot!.querySelector('label');
      const input = element.shadowRoot!.querySelector('input');

      customExpect(label).toExist();
      customExpect(input).toExist();
      customExpect(label!.htmlFor).toEqual('email-input');
      customExpect(input!.id).toEqual('email-input');
    });

    test('should generate a unique id if not provided', () => {
      element = customFixture('ui-text-input', { label: "Search" });
      const label = element.shadowRoot!.querySelector('label');
      const input = element.shadowRoot!.querySelector('input');

      customExpect(label).toExist();
      customExpect(input).toExist();
      customExpect(label!.htmlFor).toNotBeEmpty(); // Need to implement toNotBeEmpty
      customExpect(input!.id).toNotBeEmpty(); // Need to implement toNotBeEmpty
      customExpect(label!.htmlFor).toEqual(input!.id);
    });
  });

  describe('strict TypeScript', () => {
    test('should have correct type definitions for properties', () => {
      // This is a compile-time check, but we can simulate a runtime check
      // by ensuring properties are defined with expected types.
      const instance = document.createElement('ui-text-input');
      customExpect(typeof (instance as any).value).toEqual('string');
      customExpect(typeof (instance as any).placeholder).toEqual('string');
      customExpect(typeof (instance as any).disabled).toEqual('boolean');
      customExpect(typeof (instance as any).readOnly).toEqual('boolean');
      customExpect(typeof (instance as any).type).toEqual('string');
      customExpect(typeof (instance as any).name).toEqual('string');
      customExpect(typeof (instance as any).label).toEqual('string');
    });
  });
});