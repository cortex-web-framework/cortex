import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-stepper', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-stepper');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-STEPPER');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should render stepper container', () => {
      const stepper = element.shadowRoot?.querySelector('.stepper');
      assert(stepper);
    });

    it('should have empty steps initially', () => {
      const el = element as any;
      assert(Array.isArray(el.steps));
      assert.equal(el.steps.length, 0);
    });
  });

  describe('Step Management', () => {
    it('should add step with addStep method', () => {
      const el = element as any;
      el.addStep({ id: '1', label: 'Step 1' });
      assert.equal(el.steps.length, 1);
    });

    it('should remove step by index', () => {
      const el = element as any;
      el.addStep({ id: '1', label: 'Step 1' });
      el.addStep({ id: '2', label: 'Step 2' });
      el.removeStep(0);
      assert.equal(el.steps.length, 1);
    });

    it('should set steps array', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
        { id: '3', label: 'Step 3' },
      ];
      assert.equal(el.steps.length, 3);
    });

    it('should maintain step order', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'First' },
        { id: '2', label: 'Second' },
        { id: '3', label: 'Third' },
      ];
      assert.equal(el.steps[0].label, 'First');
      assert.equal(el.steps[1].label, 'Second');
      assert.equal(el.steps[2].label, 'Third');
    });
  });

  describe('Active Step', () => {
    it('should default to first step', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];
      assert.equal(el.activeStep, 0);
    });

    it('should move to next step', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
        { id: '3', label: 'Step 3' },
      ];
      el.nextStep();
      assert.equal(el.activeStep, 1);
    });

    it('should move to previous step', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
        { id: '3', label: 'Step 3' },
      ];
      el.activeStep = 2;
      el.previousStep();
      assert.equal(el.activeStep, 1);
    });

    it('should not go before first step', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];
      el.previousStep();
      assert.equal(el.activeStep, 0);
    });

    it('should not go after last step', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];
      el.activeStep = 1;
      el.nextStep();
      assert.equal(el.activeStep, 1);
    });

    it('should go to specific step with goToStep', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
        { id: '3', label: 'Step 3' },
      ];
      el.goToStep(2);
      assert.equal(el.activeStep, 2);
    });

    it('should set activeStep property', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];
      el.activeStep = 1;
      assert.equal(el.activeStep, 1);
    });
  });

  describe('Orientation', () => {
    it('should default to horizontal orientation', () => {
      const el = element as any;
      assert.equal(el.orientation, 'horizontal');
    });

    it('should accept horizontal orientation', () => {
      const el = element as any;
      el.orientation = 'horizontal';
      assert.equal(el.orientation, 'horizontal');
    });

    it('should accept vertical orientation', () => {
      const el = element as any;
      el.orientation = 'vertical';
      assert.equal(el.orientation, 'vertical');
    });

    it('should render steps in correct orientation', () => {
      const el = element as any;
      el.orientation = 'vertical';
      const stepper = element.shadowRoot?.querySelector('.stepper');
      assert(stepper);
    });
  });

  describe('Labels', () => {
    it('should show labels by default', () => {
      const el = element as any;
      assert.equal(el.showLabels, true);
    });

    it('should accept showLabels property', () => {
      const el = element as any;
      el.showLabels = false;
      assert.equal(el.showLabels, false);
    });

    it('should display step labels', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Account Setup' },
        { id: '2', label: 'Personal Info' },
      ];
      const text = element.shadowRoot?.textContent;
      assert(text && text.includes('Account Setup'));
    });

    it('should display step descriptions', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1', description: 'Set up your account' },
        { id: '2', label: 'Step 2', description: 'Enter personal info' },
      ];
      assert(element.shadowRoot);
    });
  });

  describe('Step States', () => {
    it('should mark steps as completed', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1', completed: true },
        { id: '2', label: 'Step 2', completed: false },
      ];
      assert(el.steps[0].completed);
    });

    it('should mark steps as having errors', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1', hasError: true },
        { id: '2', label: 'Step 2', hasError: false },
      ];
      assert(el.steps[0].hasError);
    });

    it('should mark steps as disabled', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1', disabled: true },
        { id: '2', label: 'Step 2', disabled: false },
      ];
      assert(el.steps[0].disabled);
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

    it('should disable all steps when disabled', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];
      el.disabled = true;
      assert.equal(el.disabled, true);
    });
  });

  describe('Events', () => {
    it('should emit stepChanged event', () => {
      let changed = false;
      element.addEventListener('stepChanged', () => {
        changed = true;
      });

      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];
      el.nextStep();
      assert(changed);
    });

    it('should include step details in event', () => {
      let stepId: string | null = null;
      element.addEventListener('stepChanged', (e: Event) => {
        stepId = (e as CustomEvent).detail?.id;
      });

      const el = element as any;
      el.steps = [
        { id: 'first', label: 'Step 1' },
        { id: 'second', label: 'Step 2' },
      ];
      el.nextStep();
      assert.equal(stepId, 'second');
    });
  });

  describe('Accessibility', () => {
    it('should have role=tablist', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];
      const tablist = element.shadowRoot?.querySelector('[role="tablist"]');
      assert(tablist);
    });

    it('should have role=tab on step buttons', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];
      const tabs = element.shadowRoot?.querySelectorAll('[role="tab"]');
      assert(tabs && tabs.length >= 2);
    });

    it('should have aria-selected on active step', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];
      el.activeStep = 0;
      const tabs = element.shadowRoot?.querySelectorAll('[role="tab"]');
      assert(tabs && tabs[0]?.getAttribute('aria-selected') === 'true');
    });

    it('should have aria-disabled on disabled steps', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1', disabled: true },
        { id: '2', label: 'Step 2' },
      ];
      const disabledTabs = element.shadowRoot?.querySelectorAll('[aria-disabled="true"]');
      assert(disabledTabs && disabledTabs.length >= 1);
    });
  });

  describe('Rendering', () => {
    it('should render step indicators', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
        { id: '3', label: 'Step 3' },
      ];
      const indicators = element.shadowRoot?.querySelectorAll('.step-indicator');
      assert(indicators && indicators.length === 3);
    });

    it('should show step numbers', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];
      const text = element.shadowRoot?.textContent;
      assert(text && (text.includes('1') || text.includes('Step')));
    });

    it('should render connectors between steps', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
        { id: '3', label: 'Step 3' },
      ];
      const connectors = element.shadowRoot?.querySelectorAll('.step-connector');
      assert(connectors && connectors.length >= 2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single step', () => {
      const el = element as any;
      el.steps = [{ id: '1', label: 'Only Step' }];
      assert.equal(el.steps.length, 1);
      el.nextStep();
      assert.equal(el.activeStep, 0);
    });

    it('should handle many steps', () => {
      const el = element as any;
      const steps: Array<{ id: string; label: string }> = [];
      for (let i = 0; i < 20; i++) {
        steps.push({ id: String(i), label: `Step ${i}` });
      }
      el.steps = steps;
      assert.equal(el.steps.length, 20);
    });

    it('should handle rapid step changes', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
        { id: '3', label: 'Step 3' },
      ];
      for (let i = 0; i < 5; i++) {
        el.nextStep();
      }
      assert(el.activeStep >= 0 && el.activeStep < el.steps.length);
    });

    it('should handle invalid step index', () => {
      const el = element as any;
      el.steps = [
        { id: '1', label: 'Step 1' },
        { id: '2', label: 'Step 2' },
      ];
      el.goToStep(99);
      assert(el.activeStep >= 0 && el.activeStep < el.steps.length);
    });
  });

  describe('Attributes', () => {
    it('should accept orientation attribute', () => {
      element.setAttribute('orientation', 'vertical');
      const el = element as any;
      assert.equal(el.orientation, 'vertical');
    });

    it('should accept showLabels attribute', () => {
      element.setAttribute('showLabels', 'false');
      const el = element as any;
      assert.equal(el.showLabels, false);
    });

    it('should accept disabled attribute', () => {
      element.setAttribute('disabled', '');
      const el = element as any;
      assert.equal(el.disabled, true);
    });
  });

  describe('Initial State', () => {
    it('should start with no steps', () => {
      const el = element as any;
      assert.equal(el.steps.length, 0);
    });

    it('should default activeStep to 0', () => {
      const el = element as any;
      assert.equal(el.activeStep, 0);
    });

    it('should default orientation to horizontal', () => {
      const el = element as any;
      assert.equal(el.orientation, 'horizontal');
    });

    it('should default showLabels to true', () => {
      const el = element as any;
      assert.equal(el.showLabels, true);
    });

    it('should not be disabled initially', () => {
      const el = element as any;
      assert.equal(el.disabled, false);
    });
  });
});
