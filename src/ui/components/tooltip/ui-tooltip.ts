/**
 * ui-tooltip: A tooltip component for displaying contextual hints.
 */

import { ITooltipElement, TooltipState, TooltipPosition, TooltipTrigger } from './ui-tooltip.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiTooltip extends HTMLElement implements ITooltipElement {
  private shadowRootInternal: ShadowRoot;

  private state: TooltipState = {
    content: undefined,
    position: 'top',
    trigger: 'hover',
    visible: false,
    disabled: false,
  };

  static get observedAttributes(): string[] {
    return ['content', 'position', 'trigger', 'disabled', 'visible'];
  }

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.setupListeners();
    this.render();
  }

  disconnectedCallback(): void {
    this.removeListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'content':
        this.state.content = newValue ?? undefined;
        break;
      case 'position':
        if (['top', 'bottom', 'left', 'right'].includes(newValue || '')) {
          this.state.position = newValue as TooltipPosition;
        }
        break;
      case 'trigger':
        if (['hover', 'click', 'focus'].includes(newValue || '')) {
          this.state.trigger = newValue as TooltipTrigger;
        }
        break;
      case 'disabled':
        this.state.disabled = newValue === 'true';
        break;
      case 'visible':
        this.state.visible = newValue === 'true';
        break;
    }

    this.setupListeners();
    this.render();
  }

  get content(): string | undefined {
    return this.state.content;
  }

  set content(val: string | undefined) {
    this.state.content = val;
    if (val) {
      this.setAttribute('content', val);
    } else {
      this.removeAttribute('content');
    }
    this.render();
  }

  get position(): TooltipPosition {
    return this.state.position;
  }

  set position(val: TooltipPosition) {
    this.state.position = val;
    this.setAttribute('position', val);
    this.render();
  }

  get trigger(): TooltipTrigger {
    return this.state.trigger;
  }

  set trigger(val: TooltipTrigger) {
    this.state.trigger = val;
    this.setAttribute('trigger', val);
    this.setupListeners();
    this.render();
  }

  get visible(): boolean {
    return this.state.visible && !this.state.disabled;
  }

  set visible(val: boolean) {
    this.state.visible = val;
    if (val) {
      this.setAttribute('visible', 'true');
    } else {
      this.removeAttribute('visible');
    }
    this.render();
  }

  get disabled(): boolean {
    return this.state.disabled;
  }

  set disabled(val: boolean) {
    this.state.disabled = val;
    if (val) {
      this.setAttribute('disabled', 'true');
    } else {
      this.removeAttribute('disabled');
    }
    if (val) this.hide();
    this.render();
  }

  show(): void {
    if (!this.state.disabled) {
      this.state.visible = true;
      this.setAttribute('visible', 'true');
      this.render();
    }
  }

  hide(): void {
    this.state.visible = false;
    this.removeAttribute('visible');
    this.render();
  }

  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private setupListeners(): void {
    this.removeListeners();

    const trigger = this.shadowRoot?.querySelector('.tooltip-trigger');
    if (!trigger) return;

    if (this.state.trigger === 'hover') {
      trigger.addEventListener('mouseenter', () => this.show());
      trigger.addEventListener('mouseleave', () => this.hide());
    } else if (this.state.trigger === 'click') {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
      document.addEventListener('click', () => this.hide());
    } else if (this.state.trigger === 'focus') {
      trigger.addEventListener('focus', () => this.show());
      trigger.addEventListener('blur', () => this.hide());
    }
  }

  private removeListeners(): void {
    const trigger = this.shadowRoot?.querySelector('.tooltip-trigger');
    if (!trigger) return;

    const newTrigger = trigger.cloneNode(true);
    if (trigger.parentNode) {
      trigger.parentNode.replaceChild(newTrigger, trigger);
    }
  }

  private getPositionStyles(): string {
    const positions: Record<TooltipPosition, string> = {
      top: `
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-8px);
      `,
      bottom: `
        top: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(8px);
      `,
      left: `
        right: 100%;
        top: 50%;
        transform: translateY(-50%) translateX(-8px);
      `,
      right: `
        left: 100%;
        top: 50%;
        transform: translateY(-50%) translateX(8px);
      `,
    };
    return positions[this.state.position];
  }

  private getStyles(): string {
    const bgColor = themeManager.getColor('SURFACE_DARK') || '#333';
    const textColor = themeManager.getColor('TEXT_LIGHT') || '#fff';
    const visibility = this.visible ? 'visible' : 'hidden';
    const opacity = this.visible ? '1' : '0';

    return `
      :host {
        display: inline-block;
        position: relative;
      }

      .tooltip-trigger {
        display: inline-block;
      }

      .tooltip-content {
        position: absolute;
        background: ${bgColor};
        color: ${textColor};
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 1000;
        visibility: ${visibility};
        opacity: ${opacity};
        transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
        ${this.getPositionStyles()}
      }

      .tooltip-content::before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
        ${this.getArrowStyles()}
      }

      [role="tooltip"] {
        outline: none;
      }
    `;
  }

  private getArrowStyles(): string {
    const arrowColor = themeManager.getColor('SURFACE_DARK') || '#333';
    const arrows: Record<TooltipPosition, string> = {
      top: `
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 6px 6px 0 6px;
        border-color: ${arrowColor} transparent transparent transparent;
      `,
      bottom: `
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 0 6px 6px 6px;
        border-color: transparent transparent ${arrowColor} transparent;
      `,
      left: `
        right: -6px;
        top: 50%;
        transform: translateY(-50%);
        border-width: 6px 0 6px 6px;
        border-color: transparent transparent transparent ${arrowColor};
      `,
      right: `
        left: -6px;
        top: 50%;
        transform: translateY(-50%);
        border-width: 6px 6px 6px 0;
        border-color: transparent ${arrowColor} transparent transparent;
      `,
    };
    return arrows[this.state.position];
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const contentText = this.state.content ? `${this.state.content}` : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="tooltip-trigger">
        <slot></slot>
      </div>
      <div class="tooltip-content" role="tooltip" aria-hidden="${!this.visible}">
        ${contentText}
      </div>
    `;

    this.setupListeners();
  }
}

customElements.define('ui-tooltip', UiTooltip);

declare global {
  interface HTMLElementTagNameMap {
    'ui-tooltip': UiTooltip;
  }
}

export { UiTooltip };
