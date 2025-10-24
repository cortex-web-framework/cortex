/**
 * ui-divider: A simple divider/separator component.
 */

import { IDividerElement, DividerState, DividerOrientation, DividerVariant } from './ui-divider.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiDivider extends HTMLElement implements IDividerElement {
  private shadowRootInternal: ShadowRoot;

  private state: DividerState = {
    orientation: 'horizontal',
    variant: 'default',
    text: undefined,
  };

  static get observedAttributes(): string[] {
    return ['orientation', 'variant', 'text'];
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
          this.state.orientation = newValue as DividerOrientation;
        }
        break;
      case 'variant':
        if (['default', 'dashed', 'dotted'].includes(newValue || '')) {
          this.state.variant = newValue as DividerVariant;
        }
        break;
      case 'text':
        this.state.text = newValue ?? undefined;
        break;
    }

    this.render();
  }

  get orientation(): DividerOrientation {
    return this.state.orientation;
  }

  set orientation(val: DividerOrientation) {
    this.state.orientation = val;
    this.setAttribute('orientation', val);
    this.render();
  }

  get variant(): DividerVariant {
    return this.state.variant;
  }

  set variant(val: DividerVariant) {
    this.state.variant = val;
    this.setAttribute('variant', val);
    this.render();
  }

  get text(): string | undefined {
    return this.state.text;
  }

  set text(val: string | undefined) {
    this.state.text = val;
    if (val) {
      this.setAttribute('text', val);
    } else {
      this.removeAttribute('text');
    }
    this.render();
  }

  private getStyles(): string {
    const isVertical = this.state.orientation === 'vertical';
    const color = themeManager.getColor('BORDER') || '#ddd';
    let borderStyle = 'solid';

    switch (this.state.variant) {
      case 'dashed':
        borderStyle = 'dashed';
        break;
      case 'dotted':
        borderStyle = 'dotted';
        break;
      case 'default':
      default:
        borderStyle = 'solid';
        break;
    }

    return `
      :host {
        display: block;
      }

      .divider-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${isVertical ? 'auto' : '100%'};
        height: ${isVertical ? '100%' : 'auto'};
        min-height: ${isVertical ? '1px' : 'auto'};
        min-width: ${isVertical ? '1px' : 'auto'};
        flex-direction: ${isVertical ? 'column' : 'row'};
        gap: ${themeManager.getSpacing('SM')};
      }

      .divider {
        flex: 1;
        background: transparent;
        border: none;
        border-${isVertical ? 'left' : 'top'}: 1px ${borderStyle} ${color};
      }

      .divider-text {
        flex-shrink: 0;
        font-size: ${themeManager.getFontSize('SM')};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
        white-space: nowrap;
        padding: ${isVertical ? `0 ${themeManager.getSpacing('SM')}` : `${themeManager.getSpacing('SM')} 0`};
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const dividerLine = `<div class="divider"></div>`;

    let content = '';
    if (this.state.text) {
      content = `
        ${dividerLine}
        <div class="divider-text">${this.escapeHtml(this.state.text)}</div>
        ${dividerLine}
      `;
    } else {
      content = dividerLine;
    }

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="divider-container" role="separator" aria-orientation="${this.state.orientation}">
        ${content}
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('ui-divider', UiDivider);

declare global {
  interface HTMLElementTagNameMap {
    'ui-divider': UiDivider;
  }
}

export { UiDivider };
