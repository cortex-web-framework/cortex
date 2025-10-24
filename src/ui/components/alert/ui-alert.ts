/**
 * ui-alert: An alert/notification component with multiple severity types.
 */

import { IAlertElement, AlertState, AlertType } from './ui-alert.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiAlert extends HTMLElement implements IAlertElement {
  private shadowRootInternal: ShadowRoot;

  private state: AlertState = {
    type: 'info',
    dismissible: true,
    visible: true,
    message: undefined,
  };

  static get observedAttributes(): string[] {
    return ['type', 'dismissible', 'visible', 'message'];
  }

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'type':
        if (['success', 'error', 'warning', 'info'].includes(newValue || '')) {
          this.state.type = newValue as AlertType;
        }
        break;
      case 'dismissible':
        this.state.dismissible = newValue !== null;
        break;
      case 'visible':
        this.state.visible = newValue !== null;
        break;
      case 'message':
        this.state.message = newValue ?? undefined;
        break;
    }

    this.render();
  }

  get type(): AlertType {
    return this.state.type;
  }

  set type(val: AlertType) {
    this.state.type = val;
    this.setAttribute('type', val);
    this.render();
  }

  get dismissible(): boolean {
    return this.state.dismissible;
  }

  set dismissible(val: boolean) {
    this.state.dismissible = val;
    if (val) {
      this.setAttribute('dismissible', '');
    } else {
      this.removeAttribute('dismissible');
    }
    this.render();
  }

  get visible(): boolean {
    return this.state.visible;
  }

  set visible(val: boolean) {
    this.state.visible = val;
    if (val) {
      this.setAttribute('visible', '');
    } else {
      this.removeAttribute('visible');
    }
    this.render();
  }

  get message(): string | undefined {
    return this.state.message;
  }

  set message(val: string | undefined) {
    this.state.message = val;
    if (val) {
      this.setAttribute('message', val);
    } else {
      this.removeAttribute('message');
    }
    this.render();
  }

  dismiss(): void {
    this.visible = false;
    this.dispatchEvent(
      new CustomEvent('dismiss', {
        detail: { type: this.state.type },
        bubbles: true,
        composed: true,
      })
    );
  }

  show(): void {
    this.visible = true;
    this.dispatchEvent(
      new CustomEvent('show', {
        detail: { type: this.state.type },
        bubbles: true,
        composed: true,
      })
    );
  }

  hide(): void {
    this.visible = false;
    this.dispatchEvent(
      new CustomEvent('hide', {
        detail: { type: this.state.type },
        bubbles: true,
        composed: true,
      })
    );
  }

  private setupEventListeners(): void {
    const closeBtn = this.shadowRootInternal.querySelector('.alert-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.dismiss();
      });
    }
  }

  private getColorForType(): { bg: string; border: string; text: string; icon: string } {
    switch (this.state.type) {
      case 'success':
        return {
          bg: '#d4edda',
          border: '#c3e6cb',
          text: '#155724',
          icon: '✓',
        };
      case 'error':
        return {
          bg: '#f8d7da',
          border: '#f5c6cb',
          text: '#721c24',
          icon: '✕',
        };
      case 'warning':
        return {
          bg: '#fff3cd',
          border: '#ffeeba',
          text: '#856404',
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          bg: '#d1ecf1',
          border: '#bee5eb',
          text: '#0c5460',
          icon: 'ℹ',
        };
    }
  }

  private getStyles(): string {
    const colors = this.getColorForType();

    return `
      :host {
        display: block;
      }

      .alert {
        display: ${this.state.visible ? 'flex' : 'none'};
        align-items: flex-start;
        padding: ${themeManager.getSpacing('MD')};
        background: ${colors.bg};
        border: 1px solid ${colors.border};
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        gap: ${themeManager.getSpacing('MD')};
        role: alert;
      }

      .alert-success {
        background: #d4edda;
        border-color: #c3e6cb;
        color: #155724;
      }

      .alert-error {
        background: #f8d7da;
        border-color: #f5c6cb;
        color: #721c24;
      }

      .alert-warning {
        background: #fff3cd;
        border-color: #ffeeba;
        color: #856404;
      }

      .alert-info {
        background: #d1ecf1;
        border-color: #bee5eb;
        color: #0c5460;
      }

      .alert-icon {
        font-size: 20px;
        font-weight: bold;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .alert-content {
        flex: 1;
        min-width: 0;
      }

      .alert-title {
        font-weight: 600;
        font-size: ${themeManager.getFontSize('MD')};
        margin-bottom: ${themeManager.getSpacing('XS')};
      }

      .alert-message {
        font-size: ${themeManager.getFontSize('SM')};
        line-height: 1.5;
      }

      .alert-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        opacity: 0.5;
        transition: opacity 0.2s;
      }

      .alert-close:hover {
        opacity: 1;
      }

      :host([visible="false"]) .alert {
        display: none;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const colors = this.getColorForType();

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>

      <div class="alert alert-${this.state.type}" role="alert" aria-live="polite">
        <div class="alert-icon" style="color: ${colors.text}">${colors.icon}</div>
        <div class="alert-content">
          ${this.state.message ? `<div class="alert-title">${this.state.message}</div>` : ''}
          <div class="alert-message">
            <slot name="content"></slot>
          </div>
        </div>
        ${
          this.state.dismissible
            ? `<button class="alert-close" aria-label="Dismiss alert">×</button>`
            : ''
        }
      </div>
    `;

    this.setupEventListeners();
  }
}

customElements.define('ui-alert', UiAlert);

declare global {
  interface HTMLElementTagNameMap {
    'ui-alert': UiAlert;
  }
}

export { UiAlert };
