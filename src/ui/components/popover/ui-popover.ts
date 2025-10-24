/**
 * ui-popover: A popover component for displaying rich content.
 */

import { IPopoverElement, PopoverState, PopoverPosition, PopoverTrigger } from './ui-popover.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiPopover extends HTMLElement implements IPopoverElement {
  private shadowRootInternal: ShadowRoot;

  private state: PopoverState = {
    headerText: undefined,
    position: 'bottom',
    trigger: 'click',
    visible: false,
    disabled: false,
    width: undefined,
  };

  static get observedAttributes(): string[] {
    return ['headerText', 'position', 'trigger', 'disabled', 'visible', 'width'];
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
      case 'headerText':
        this.state.headerText = newValue ?? undefined;
        break;
      case 'position':
        if (['top', 'bottom', 'left', 'right', 'auto'].includes(newValue || '')) {
          this.state.position = newValue as PopoverPosition;
        }
        break;
      case 'trigger':
        if (['hover', 'click', 'focus'].includes(newValue || '')) {
          this.state.trigger = newValue as PopoverTrigger;
        }
        break;
      case 'disabled':
        this.state.disabled = newValue === 'true';
        break;
      case 'visible':
        this.state.visible = newValue === 'true';
        break;
      case 'width':
        this.state.width = newValue ?? undefined;
        break;
    }

    this.setupListeners();
    this.render();
  }

  get headerText(): string | undefined {
    return this.state.headerText;
  }

  set headerText(val: string | undefined) {
    this.state.headerText = val;
    if (val) {
      this.setAttribute('headerText', val);
    } else {
      this.removeAttribute('headerText');
    }
    this.render();
  }

  get position(): PopoverPosition {
    return this.state.position;
  }

  set position(val: PopoverPosition) {
    this.state.position = val;
    this.setAttribute('position', val);
    this.render();
  }

  get trigger(): PopoverTrigger {
    return this.state.trigger;
  }

  set trigger(val: PopoverTrigger) {
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

  get width(): string | undefined {
    return this.state.width;
  }

  set width(val: string | undefined) {
    this.state.width = val;
    if (val) {
      this.setAttribute('width', val);
    } else {
      this.removeAttribute('width');
    }
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

    const trigger = this.shadowRoot?.querySelector('.popover-trigger');
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
    const trigger = this.shadowRoot?.querySelector('.popover-trigger');
    if (!trigger) return;

    const newTrigger = trigger.cloneNode(true);
    if (trigger.parentNode) {
      trigger.parentNode.replaceChild(newTrigger, trigger);
    }
  }

  private getPositionStyles(): string {
    const positions: Record<PopoverPosition, string> = {
      top: `
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-12px);
      `,
      bottom: `
        top: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(12px);
      `,
      left: `
        right: 100%;
        top: 50%;
        transform: translateY(-50%) translateX(-12px);
      `,
      right: `
        left: 100%;
        top: 50%;
        transform: translateY(-50%) translateX(12px);
      `,
      auto: `
        top: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(12px);
      `,
    };
    return positions[this.state.position];
  }

  private getStyles(): string {
    const bgColor = themeManager.getColor('SURFACE') || '#fff';
    const textColor = themeManager.getColor('TEXT') || '#000';
    const borderColor = themeManager.getColor('BORDER') || '#ddd';
    const visibility = this.visible ? 'visible' : 'hidden';
    const opacity = this.visible ? '1' : '0';
    const width = this.state.width || '320px';

    return `
      :host {
        display: inline-block;
        position: relative;
      }

      .popover-trigger {
        display: inline-block;
      }

      .popover-content {
        position: absolute;
        background: ${bgColor};
        color: ${textColor};
        border: 1px solid ${borderColor};
        border-radius: 6px;
        width: ${width};
        z-index: 1000;
        visibility: ${visibility};
        opacity: ${opacity};
        transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        ${this.getPositionStyles()}
      }

      .popover-header {
        padding: 12px 16px;
        border-bottom: 1px solid ${borderColor};
        font-weight: 500;
        font-size: 14px;
      }

      .popover-body {
        padding: 12px 16px;
        font-size: 14px;
      }

      [role="dialog"] {
        outline: none;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const header = this.state.headerText ? `<div class="popover-header">${this.state.headerText}</div>` : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="popover-trigger">
        <slot></slot>
      </div>
      <div class="popover-content" role="dialog" aria-hidden="${!this.visible}">
        ${header}
        <div class="popover-body">
          <slot name="body"></slot>
        </div>
      </div>
    `;

    this.setupListeners();
  }
}

customElements.define('ui-popover', UiPopover);

declare global {
  interface HTMLElementTagNameMap {
    'ui-popover': UiPopover;
  }
}

export { UiPopover };
