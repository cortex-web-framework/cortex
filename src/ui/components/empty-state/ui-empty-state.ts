/**
 * ui-empty-state: An empty state/no-data component.
 */

import { IEmptyStateElement, EmptyStateState } from './ui-empty-state.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiEmptyState extends HTMLElement implements IEmptyStateElement {
  private shadowRootInternal: ShadowRoot;

  private state: EmptyStateState = {
    headingText: undefined,
    description: undefined,
    icon: undefined,
  };

  static get observedAttributes(): string[] {
    return ['headingText', 'description', 'icon'];
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
      case 'headingText':
        this.state.headingText = newValue ?? undefined;
        break;
      case 'description':
        this.state.description = newValue ?? undefined;
        break;
      case 'icon':
        this.state.icon = newValue ?? undefined;
        break;
    }

    this.render();
  }

  get headingText(): string | undefined {
    return this.state.headingText;
  }

  set headingText(val: string | undefined) {
    this.state.headingText = val;
    if (val) {
      this.setAttribute('headingText', val);
    } else {
      this.removeAttribute('headingText');
    }
    this.render();
  }

  get description(): string | undefined {
    return this.state.description;
  }

  set description(val: string | undefined) {
    this.state.description = val;
    if (val) {
      this.setAttribute('description', val);
    } else {
      this.removeAttribute('description');
    }
    this.render();
  }

  get icon(): string | undefined {
    return this.state.icon;
  }

  set icon(val: string | undefined) {
    this.state.icon = val;
    if (val) {
      this.setAttribute('icon', val);
    } else {
      this.removeAttribute('icon');
    }
    this.render();
  }

  private getStyles(): string {
    const textColor = themeManager.getColor('TEXT') || '#333';
    const textLightColor = themeManager.getColor('TEXT_LIGHT') || '#999';

    return `
      :host {
        display: block;
      }

      .empty-state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
      }

      .empty-state-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }

      .empty-state-title {
        font-size: 18px;
        font-weight: 600;
        color: ${textColor};
        margin: 0 0 8px 0;
      }

      .empty-state-description {
        font-size: 14px;
        color: ${textLightColor};
        margin: 0 0 24px 0;
        max-width: 400px;
      }

      .empty-state-content {
        width: 100%;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const iconHtml = this.state.icon ? `<div class="empty-state-icon">${this.state.icon}</div>` : '';
    const titleHtml = this.state.headingText ? `<h2 class="empty-state-title">${this.state.headingText}</h2>` : '';
    const descriptionHtml = this.state.description ? `<p class="empty-state-description">${this.state.description}</p>` : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="empty-state-container">
        ${iconHtml}
        ${titleHtml}
        ${descriptionHtml}
        <div class="empty-state-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('ui-empty-state', UiEmptyState);

declare global {
  interface HTMLElementTagNameMap {
    'ui-empty-state': UiEmptyState;
  }
}

export { UiEmptyState };
