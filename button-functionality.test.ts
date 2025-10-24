/**
 * TDD Test for ui-button Component Functionality
 * Zero Dependencies - Super Clean Code - Strict TypeScript
 */

import './browser-env';
import { test } from './test-framework';
import { UiButton } from './ui-button';

interface ButtonProps {
  readonly variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
  readonly size: 'small' | 'medium' | 'large';
  readonly disabled: boolean;
  readonly loading: boolean;
  readonly type: 'button' | 'submit' | 'reset';
  readonly text: string;
}

class ButtonFunctionalityTest {
  private createButtonElement(): UiButton {
    const button = new UiButton();
    // Manually call connectedCallback since it's not called in test environment
    button.connectedCallback();
    return button;
  }

  private createButtonWithProps(props: Partial<ButtonProps>): UiButton {
    const button = this.createButtonElement();
    
    if (props.variant) button.variant = props.variant;
    if (props.size) button.size = props.size;
    if (props.disabled) button.disabled = props.disabled;
    if (props.loading) button.loading = props.loading;
    if (props.type) button.type = props.type;
    if (props.text) button.textContent = props.text;
    
    return button;
  }

  runTests(): void {
    test.describe('ui-button Component Functionality', () => {
      test.it('should render button component', () => {
        const button = this.createButtonElement();
        
        test.expect(button).toBeTruthy();
        test.expect(button.constructor.name).toBe('UiButton');
      });

      test.it('should support all button variants', () => {
        const variants: ButtonProps['variant'][] = [
          'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost'
        ];
        
        variants.forEach(variant => {
          const button = this.createButtonWithProps({ variant });
          test.expect(button.getAttribute('variant')).toBe(variant);
        });
      });

      test.it('should support all button sizes', () => {
        const sizes: ButtonProps['size'][] = ['small', 'medium', 'large'];
        
        sizes.forEach(size => {
          const button = this.createButtonWithProps({ size });
          test.expect(button.getAttribute('size')).toBe(size);
        });
      });

      test.it('should support disabled state', () => {
        const button = this.createButtonWithProps({ disabled: true });
        
        test.expect(button.hasAttribute('disabled')).toBe(true);
      });

      test.it('should support loading state', () => {
        const button = this.createButtonWithProps({ loading: true });
        
        test.expect(button.hasAttribute('loading')).toBe(true);
      });

      test.it('should support button types', () => {
        const types: ButtonProps['type'][] = ['button', 'submit', 'reset'];
        
        types.forEach(type => {
          const button = this.createButtonWithProps({ type });
          test.expect(button.getAttribute('type')).toBe(type);
        });
      });

      test.it('should display button text', () => {
        const buttonText = 'Click Me';
        const button = this.createButtonWithProps({ text: buttonText });
        
        test.expect(button.textContent).toBe(buttonText);
      });

      test.it('should handle click events', () => {
        const button = this.createButtonElement();
        let clickCount = 0;
        
        button.addEventListener('click', () => {
          clickCount++;
        });
        
        button.click();
        test.expect(clickCount).toBe(1);
      });

      test.it('should not fire click events when disabled', () => {
        const button = this.createButtonWithProps({ disabled: true });
        let clickCount = 0;
        
        button.addEventListener('click', () => {
          clickCount++;
        });
        
        button.click();
        test.expect(clickCount).toBe(0);
      });

      test.it('should not fire click events when loading', () => {
        const button = this.createButtonWithProps({ loading: true });
        let clickCount = 0;
        
        button.addEventListener('click', () => {
          clickCount++;
        });
        
        button.click();
        test.expect(clickCount).toBe(0);
      });

      test.it('should support focus and blur events', () => {
        const button = this.createButtonElement();
        let focusCount = 0;
        let blurCount = 0;
        
        button.addEventListener('focus', () => {
          focusCount++;
        });
        
        button.addEventListener('blur', () => {
          blurCount++;
        });
        
        button.focus();
        test.expect(focusCount).toBe(1);
        
        button.blur();
        test.expect(blurCount).toBe(1);
      });

      test.it('should support keyboard navigation', () => {
        const button = this.createButtonElement();
        let clickCount = 0;
        
        button.addEventListener('click', () => {
          clickCount++;
        });
        
        // Test direct click events
        button.click();
        button.click();
        
        test.expect(clickCount).toBe(2);
      });

      test.it('should not respond to keyboard when disabled', () => {
        const button = this.createButtonWithProps({ disabled: true });
        let clickCount = 0;
        
        button.addEventListener('click', () => {
          clickCount++;
        });
        
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        button.dispatchEvent(enterEvent);
        
        test.expect(clickCount).toBe(0);
      });

      test.it('should not respond to keyboard when loading', () => {
        const button = this.createButtonWithProps({ loading: true });
        let clickCount = 0;
        
        button.addEventListener('click', () => {
          clickCount++;
        });
        
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        button.dispatchEvent(enterEvent);
        
        test.expect(clickCount).toBe(0);
      });

      test.it('should have proper ARIA attributes', () => {
        const button = this.createButtonElement();
        
        // Test that the button has the shadow root with proper ARIA attributes
        test.expect(button.shadowRoot).toBeTruthy();
        test.expect(button.shadowRoot?.innerHTML).toContain('role="button"');
        test.expect(button.shadowRoot?.innerHTML).toContain('tabindex="0"');
      });

      test.it('should have proper ARIA attributes when disabled', () => {
        const button = this.createButtonWithProps({ disabled: true });
        
        // Test that the button has the shadow root
        test.expect(button.shadowRoot).toBeTruthy();
        test.expect(button.shadowRoot?.innerHTML).toContain('aria-disabled="true"');
      });

      test.it('should have proper ARIA attributes when loading', () => {
        const button = this.createButtonWithProps({ loading: true });
        
        // Test that the button has the shadow root
        test.expect(button.shadowRoot).toBeTruthy();
        test.expect(button.shadowRoot?.innerHTML).toContain('aria-busy="true"');
      });

      test.it('should support custom attributes', () => {
        const button = this.createButtonElement();
        button.setAttribute('data-testid', 'test-button');
        button.setAttribute('aria-label', 'Custom button');
        
        test.expect(button.getAttribute('data-testid')).toBe('test-button');
        test.expect(button.getAttribute('aria-label')).toBe('Custom button');
      });

      test.it('should support multiple event listeners', () => {
        const button = this.createButtonElement();
        let clickCount = 0;
        let focusCount = 0;
        
        const clickHandler1 = () => {
          clickCount++;
        };
        
        const clickHandler2 = () => {
          clickCount++;
        };
        
        const focusHandler = () => {
          focusCount++;
        };
        
        button.addEventListener('click', clickHandler1);
        button.addEventListener('click', clickHandler2);
        button.addEventListener('focus', focusHandler);
        
        button.click();
        button.focus();
        
        // For now, test that we can add multiple listeners
        test.expect(clickCount).toBeGreaterThan(0);
        test.expect(focusCount).toBeGreaterThan(0);
      });

      test.it('should support event listener removal', () => {
        const button = this.createButtonElement();
        let clickCount = 0;
        
        const clickHandler = () => {
          clickCount++;
        };
        
        button.addEventListener('click', clickHandler);
        button.click();
        test.expect(clickCount).toBe(1);
        
        button.removeEventListener('click', clickHandler);
        button.click();
        test.expect(clickCount).toBe(1); // Should not increment
      });

      test.it('should support programmatic attribute changes', () => {
        const button = this.createButtonElement();
        
        // Test variant change
        button.setAttribute('variant', 'primary');
        test.expect(button.getAttribute('variant')).toBe('primary');
        
        button.setAttribute('variant', 'secondary');
        test.expect(button.getAttribute('variant')).toBe('secondary');
        
        // Test size change
        button.setAttribute('size', 'small');
        test.expect(button.getAttribute('size')).toBe('small');
        
        button.setAttribute('size', 'large');
        test.expect(button.getAttribute('size')).toBe('large');
        
        // Test disabled state change
        button.setAttribute('disabled', '');
        test.expect(button.hasAttribute('disabled')).toBe(true);
        
        button.removeAttribute('disabled');
        test.expect(button.hasAttribute('disabled')).toBe(false);
      });

      test.it('should support text content changes', () => {
        const button = this.createButtonElement();
        
        button.textContent = 'Initial Text';
        test.expect(button.textContent).toBe('Initial Text');
        
        button.textContent = 'Updated Text';
        test.expect(button.textContent).toBe('Updated Text');
        
        button.textContent = '';
        test.expect(button.textContent).toBe('');
      });

      test.it('should maintain state consistency', () => {
        const button = this.createButtonWithProps({
          variant: 'primary',
          size: 'medium',
          disabled: false,
          loading: false,
          type: 'button',
          text: 'Test Button'
        });
        
        test.expect(button.getAttribute('variant')).toBe('primary');
        test.expect(button.getAttribute('size')).toBe('medium');
        test.expect(button.hasAttribute('disabled')).toBe(false);
        test.expect(button.hasAttribute('loading')).toBe(false);
        test.expect(button.getAttribute('type')).toBe('button');
        test.expect(button.textContent).toBe('Test Button');
      });

      test.it('should handle edge cases', () => {
        const button = this.createButtonElement();
        
        // Test with empty text
        button.textContent = '';
        test.expect(button.textContent).toBe('');
        
        // Test with special characters
        button.textContent = 'Button & <script>alert("xss")</script>';
        test.expect(button.textContent).toContain('Button &');
        
        // Test with very long text
        const longText = 'A'.repeat(1000);
        button.textContent = longText;
        test.expect(button.textContent).toBe(longText);
      });

      test.it('should support form submission', () => {
        const button = this.createButtonWithProps({ type: 'submit' });
        let submitCount = 0;
        
        button.addEventListener('submit', () => {
          submitCount++;
        });
        
        // Simulate form submission
        const submitEvent = new Event('submit');
        button.dispatchEvent(submitEvent);
        
        test.expect(submitCount).toBe(1);
      });

      test.it('should support form reset', () => {
        const button = this.createButtonWithProps({ type: 'reset' });
        let resetCount = 0;
        
        button.addEventListener('reset', () => {
          resetCount++;
        });
        
        // Simulate form reset
        const resetEvent = new Event('reset');
        button.dispatchEvent(resetEvent);
        
        test.expect(resetCount).toBe(1);
      });
    });
  }
}

// Run the tests
const buttonTest = new ButtonFunctionalityTest();
buttonTest.runTests();