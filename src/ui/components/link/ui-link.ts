/**
 * ui-link: A hyperlink component with theming support.
 */

import { ILinkElement, LinkState, LinkVariant } from './ui-link.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiLink extends HTMLElement implements ILinkElement {
  private shadowRootInternal: ShadowRoot;

  private state: LinkState = {
    href: undefined,
    target: undefined,
    disabled: false,
    variant: 'default',
    underline: true,
  };

  static get observedAttributes(): string[] {
    return ['href', 'target', 'disabled', 'variant', 'underline'];
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
      case 'href':
        this.state.href = newValue ?? undefined;
        break;
      case 'target':
        if (['_blank', '_self', '_parent', '_top'].includes(newValue || '')) {
          this.state.target = newValue as '_blank' | '_self' | '_parent' | '_top';
        }
        break;
      case 'disabled':
        this.state.disabled = newValue === 'true';
        break;
      case 'variant':
        if (['default', 'primary', 'success', 'warning', 'error', 'info'].includes(newValue || '')) {
          this.state.variant = newValue as LinkVariant;
        }
        break;
      case 'underline':
        this.state.underline = newValue !== 'false';
        break;
    }

    this.render();
  }

  get href(): string | undefined {
    return this.state.href;
  }

  set href(val: string | undefined) {
    this.state.href = val;
    if (val) {
      this.setAttribute('href', val);
    } else {
      this.removeAttribute('href');
    }
    this.render();
  }

  get target(): '_blank' | '_self' | '_parent' | '_top' | undefined {
    return this.state.target;
  }

  set target(val: '_blank' | '_self' | '_parent' | '_top' | undefined) {
    this.state.target = val;
    if (val) {
      this.setAttribute('target', val);
    } else {
      this.removeAttribute('target');
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
    this.render();
  }

  get variant(): LinkVariant {
    return this.state.variant;
  }

  set variant(val: LinkVariant) {
    this.state.variant = val;
    this.setAttribute('variant', val);
    this.render();
  }

  get underline(): boolean {
    return this.state.underline;
  }

  set underline(val: boolean) {
    this.state.underline = val;
    if (!val) {
      this.setAttribute('underline', 'false');
    } else {
      this.removeAttribute('underline');
    }
    this.render();
  }

  private getColorForVariant(): string {
    const colors: Record<LinkVariant, string> = {
      default: themeManager.getColor('TEXT') || '#000',
      primary: themeManager.getColor('PRIMARY') || '#007bff',
      success: themeManager.getColor('SUCCESS') || '#28a745',
      warning: themeManager.getColor('WARNING') || '#ffc107',
      error: themeManager.getColor('ERROR') || '#dc3545',
      info: themeManager.getColor('INFO') || '#17a2b8',
    };
    return colors[this.state.variant];
  }

  private getStyles(): string {
    const color = this.getColorForVariant();
    const hoverColor = this.state.disabled ? color : this.adjustColorBrightness(color, -20);
    const textDecoration = this.state.underline ? 'underline' : 'none';
    const cursor = this.state.disabled ? 'not-allowed' : 'pointer';
    const pointerEvents = this.state.disabled ? 'none' : 'auto';
    const opacity = this.state.disabled ? '0.6' : '1';

    return `
      :host {
        display: inline;
      }

      a {
        color: ${color};
        text-decoration: ${textDecoration};
        cursor: ${cursor};
        pointer-events: ${pointerEvents};
        opacity: ${opacity};
        transition: color 0.2s ease-in-out;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
      }

      a:hover:not([aria-disabled="true"]) {
        color: ${hoverColor};
        text-decoration: ${this.state.underline ? 'underline' : 'none'};
      }

      a:focus {
        outline: 2px solid ${color};
        outline-offset: 2px;
        border-radius: 2px;
      }

      a[aria-disabled="true"] {
        text-decoration: none;
      }
    `;
  }

  private adjustColorBrightness(color: string, amount: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const href = this.state.href || '#';
    const target = this.state.target ? `target="${this.state.target}"` : '';
    const ariaDisabled = this.state.disabled ? 'aria-disabled="true"' : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <a href="${href}" ${target} ${ariaDisabled} role="link">
        <slot></slot>
      </a>
    `;
  }
}

customElements.define('ui-link', UiLink);

declare global {
  interface HTMLElementTagNameMap {
    'ui-link': UiLink;
  }
}

export { UiLink };
