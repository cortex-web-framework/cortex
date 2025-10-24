/**
 * ui-stepper: A multi-step process indicator component.
 */

import { IStepperElement, StepperState, StepperStep } from './ui-stepper.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiStepper extends HTMLElement implements IStepperElement {
  private shadowRootInternal: ShadowRoot;

  private state: StepperState = {
    steps: [],
    activeStep: 0,
    orientation: 'horizontal',
    showLabels: true,
    disabled: false,
  };

  static get observedAttributes(): string[] {
    return ['orientation', 'showLabels', 'disabled'];
  }

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'orientation':
        if (['horizontal', 'vertical'].includes(newValue || '')) {
          this.state.orientation = newValue as 'horizontal' | 'vertical';
        }
        break;
      case 'showLabels':
        this.state.showLabels = newValue === null || newValue === '' || newValue === 'true';
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
    }

    this.render();
  }

  get steps(): StepperStep[] {
    return this.state.steps;
  }

  set steps(val: StepperStep[]) {
    this.state.steps = val;
    if (this.state.activeStep >= this.state.steps.length) {
      this.state.activeStep = Math.max(0, this.state.steps.length - 1);
    }
    this.render();
  }

  get activeStep(): number {
    return this.state.activeStep;
  }

  set activeStep(val: number) {
    if (val >= 0 && val < this.state.steps.length) {
      this.state.activeStep = val;
      this.emitStepChangeEvent();
      this.render();
    }
  }

  get orientation(): 'horizontal' | 'vertical' {
    return this.state.orientation;
  }

  set orientation(val: 'horizontal' | 'vertical') {
    this.state.orientation = val;
    this.setAttribute('orientation', val);
    this.render();
  }

  get showLabels(): boolean {
    return this.state.showLabels;
  }

  set showLabels(val: boolean) {
    this.state.showLabels = val;
    if (val) {
      this.setAttribute('showLabels', 'true');
    } else {
      this.removeAttribute('showLabels');
    }
    this.render();
  }

  get disabled(): boolean {
    return this.state.disabled;
  }

  set disabled(val: boolean) {
    this.state.disabled = val;
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
    this.render();
  }

  nextStep(): void {
    if (this.state.activeStep < this.state.steps.length - 1) {
      this.state.activeStep++;
      this.emitStepChangeEvent();
      this.render();
    }
  }

  previousStep(): void {
    if (this.state.activeStep > 0) {
      this.state.activeStep--;
      this.emitStepChangeEvent();
      this.render();
    }
  }

  goToStep(index: number): void {
    if (index >= 0 && index < this.state.steps.length) {
      this.state.activeStep = index;
      this.emitStepChangeEvent();
      this.render();
    }
  }

  addStep(step: StepperStep): void {
    this.state.steps.push(step);
    this.render();
  }

  removeStep(index: number): void {
    if (index >= 0 && index < this.state.steps.length) {
      this.state.steps.splice(index, 1);
      if (this.state.activeStep >= this.state.steps.length) {
        this.state.activeStep = Math.max(0, this.state.steps.length - 1);
      }
      this.render();
    }
  }

  private emitStepChangeEvent(): void {
    const step = this.state.steps[this.state.activeStep];
    this.dispatchEvent(
      new CustomEvent('stepChanged', {
        detail: {
          index: this.state.activeStep,
          id: step?.id,
          label: step?.label,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private getStyles(): string {
    const isVertical = this.state.orientation === 'vertical';

    return `
      :host {
        display: block;
      }

      .stepper {
        display: flex;
        flex-direction: ${isVertical ? 'column' : 'row'};
        gap: ${themeManager.getSpacing('MD')};
        align-items: ${isVertical ? 'flex-start' : 'center'};
      }

      .step {
        display: flex;
        flex-direction: ${isVertical ? 'row' : 'column'};
        align-items: ${isVertical ? 'flex-start' : 'center'};
        flex: ${isVertical ? '1' : '1'};
        position: relative;
      }

      .step-header {
        display: flex;
        align-items: center;
        gap: ${themeManager.getSpacing('SM')};
        flex: ${isVertical ? '0 0 auto' : '1'};
      }

      .step-indicator {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${themeManager.getColor('BORDER') || '#ddd'};
        color: ${themeManager.getColor('TEXT') || '#000'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 2px solid ${themeManager.getColor('BORDER') || '#ddd'};
        flex-shrink: 0;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .step[role="tab"][aria-selected="true"] .step-indicator {
        background: ${themeManager.getColor('PRIMARY') || '#007bff'};
        color: #fff;
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      .step[role="tab"][aria-disabled="true"] .step-indicator {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .step.completed .step-indicator {
        background: ${themeManager.getColor('SUCCESS') || '#28a745'};
        color: #fff;
        border-color: ${themeManager.getColor('SUCCESS') || '#28a745'};
      }

      .step.has-error .step-indicator {
        background: ${themeManager.getColor('ERROR') || '#dc3545'};
        color: #fff;
        border-color: ${themeManager.getColor('ERROR') || '#dc3545'};
      }

      .step-content {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('XS')};
        margin-left: ${isVertical ? '50px' : '0'};
        margin-top: ${isVertical ? '0' : themeManager.getSpacing('SM')};
        flex: 1;
      }

      .step-label {
        font-weight: 500;
        color: ${themeManager.getColor('TEXT') || '#000'};
        font-size: ${themeManager.getFontSize('SM')};
      }

      .step[role="tab"][aria-selected="true"] .step-label {
        color: ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      .step-description {
        font-size: ${themeManager.getFontSize('XS')};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
      }

      .step-connector {
        flex: 1;
        height: 2px;
        background: ${themeManager.getColor('BORDER') || '#ddd'};
        margin: 0 ${themeManager.getSpacing('SM')};
        position: relative;
        top: -20px;
      }

      .step-connector.completed {
        background: ${themeManager.getColor('SUCCESS') || '#28a745'};
      }

      .step-connector.active {
        background: ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      .stepper[data-orientation="vertical"] .step-connector {
        width: 2px;
        height: 30px;
        margin: ${themeManager.getSpacing('SM')} 0 ${themeManager.getSpacing('SM')} 18px;
        top: auto;
      }

      :host([disabled]) .step-indicator {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    let stepsHtml = '';

    this.state.steps.forEach((step: StepperStep, idx: number) => {
      const isActive = idx === this.state.activeStep;
      const isDisabled = step.disabled || this.state.disabled;
      const isCompleted = step.completed;
      const hasError = step.hasError;

      const stepClass = `step ${isCompleted ? 'completed' : ''} ${hasError ? 'has-error' : ''}`;

      stepsHtml += `
        <div
          class="${stepClass}"
          role="tab"
          aria-selected="${isActive}"
          aria-disabled="${isDisabled}"
          aria-label="${this.escapeHtml(step.label)}"
          data-step-id="${this.escapeHtml(step.id)}"
        >
          <div class="step-header">
            <div class="step-indicator">
              ${isCompleted ? '✓' : idx + 1}
            </div>
            ${
              this.state.showLabels
                ? `
              <div class="step-content">
                <div class="step-label">${this.escapeHtml(step.label)}</div>
                ${step.description ? `<div class="step-description">${this.escapeHtml(step.description)}</div>` : ''}
              </div>
            `
                : ''
            }
          </div>
        </div>

        ${
          idx < this.state.steps.length - 1
            ? `<div class="step-connector ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}"></div>`
            : ''
        }
      `;
    });

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="stepper" role="tablist" data-orientation="${this.state.orientation}">
        ${stepsHtml}
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const steps = this.shadowRootInternal?.querySelectorAll('[role="tab"]');
    if (!steps) return;

    steps.forEach((step: Element, idx: number) => {
      const stepEl = step as HTMLElement;
      const isDisabled = stepEl.getAttribute('aria-disabled') === 'true';

      stepEl.addEventListener('click', () => {
        if (!isDisabled) {
          this.goToStep(idx);
        }
      });

      // Keyboard navigation
      stepEl.addEventListener('keydown', (event: KeyboardEvent) => {
        if (isDisabled) return;

        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            event.preventDefault();
            if (this.state.activeStep < this.state.steps.length - 1) {
              this.nextStep();
            }
            break;

          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault();
            if (this.state.activeStep > 0) {
              this.previousStep();
            }
            break;

          case 'Home':
            event.preventDefault();
            this.goToStep(0);
            break;

          case 'End':
            event.preventDefault();
            this.goToStep(this.state.steps.length - 1);
            break;

          case 'Enter':
          case ' ':
            event.preventDefault();
            this.goToStep(idx);
            break;
        }
      });
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('ui-stepper', UiStepper);

declare global {
  interface HTMLElementTagNameMap {
    'ui-stepper': UiStepper;
  }
}

export { UiStepper };
