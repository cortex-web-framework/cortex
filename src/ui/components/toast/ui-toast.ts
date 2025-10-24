/**
 * ui-toast: A toast notification component.
 */

import { IToastElement, ToastState, ToastType } from './ui-toast.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiToast extends HTMLElement implements IToastElement {
  private shadowRootInternal: ShadowRoot;
  private autoHideTimer: ReturnType<typeof setTimeout> | null = null;

  private state: ToastState = {
    message: undefined,
    toastType: 'info',
    visible: false,
    autoHide: true,
    duration: 3000,
  };

  static get observedAttributes(): string[] {
    return ['message', 'toastType', 'autoHide', 'duration', 'visible'];
  }

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
  }

  disconnectedCallback(): void {
    this.clearAutoHideTimer();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'message':
        this.state.message = newValue ?? undefined;
        break;
      case 'toastType':
        if (['info', 'success', 'warning', 'error'].includes(newValue || '')) {
          this.state.toastType = newValue as ToastType;
        }
        break;
      case 'autoHide':
        this.state.autoHide = newValue !== 'false';
        break;
      case 'duration':
        this.state.duration = parseInt(newValue || '3000', 10);
        break;
      case 'visible':
        this.state.visible = newValue === 'true';
        break;
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

  get toastType(): ToastType {
    return this.state.toastType;
  }

  set toastType(val: ToastType) {
    this.state.toastType = val;
    this.setAttribute('toastType', val);
    this.render();
  }

  get visible(): boolean {
    return this.state.visible;
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

  get autoHide(): boolean {
    return this.state.autoHide;
  }

  set autoHide(val: boolean) {
    this.state.autoHide = val;
    if (!val) {
      this.setAttribute('autoHide', 'false');
    } else {
      this.removeAttribute('autoHide');
    }
    this.render();
  }

  get duration(): number {
    return this.state.duration;
  }

  set duration(val: number) {
    this.state.duration = val;
    this.setAttribute('duration', val.toString());
    this.render();
  }

  show(): void {
    this.state.visible = true;
    this.setAttribute('visible', 'true');
    this.render();

    if (this.state.autoHide && this.state.duration > 0) {
      this.clearAutoHideTimer();
      this.autoHideTimer = setTimeout(() => this.hide(), this.state.duration);
    }
  }

  hide(): void {
    this.state.visible = false;
    this.removeAttribute('visible');
    this.clearAutoHideTimer();
    this.render();
  }

  private clearAutoHideTimer(): void {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }

  private getColorForType(): string {
    const colors: Record<ToastType, string> = {
      info: themeManager.getColor('INFO') || '#17a2b8',
      success: themeManager.getColor('SUCCESS') || '#28a745',
      warning: themeManager.getColor('WARNING') || '#ffc107',
      error: themeManager.getColor('ERROR') || '#dc3545',
    };
    return colors[this.state.toastType];
  }

  private getStyles(): string {
    const bgColor = this.getColorForType();
    const textColor = '#fff';
    const visibility = this.state.visible ? 'visible' : 'hidden';
    const opacity = this.state.visible ? '1' : '0';

    return `
      :host {
        display: block;
      }

      .toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 20px;
        background: ${bgColor};
        color: ${textColor};
        border-radius: 6px;
        font-size: 14px;
        visibility: ${visibility};
        opacity: ${opacity};
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        word-wrap: break-word;
      }

      .toast-icon {
        display: inline-block;
        margin-right: 8px;
        font-weight: bold;
      }

      .toast-message {
        display: inline;
      }
    `;
  }

  private getIcon(): string {
    const icons: Record<ToastType, string> = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✕',
    };
    return icons[this.state.toastType];
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const message = this.state.message || '';
    const icon = this.getIcon();

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="toast-container" role="alert" aria-live="assertive">
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;
  }
}

customElements.define('ui-toast', UiToast);

declare global {
  interface HTMLElementTagNameMap {
    'ui-toast': UiToast;
  }
}

export { UiToast };
