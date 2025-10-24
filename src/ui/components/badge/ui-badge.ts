/**
 * ui-badge: A simple badge component for displaying status or count labels.
 */

import { IBadgeElement, BadgeState, BadgeVariant, BadgeSize } from './ui-badge.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiBadge extends HTMLElement implements IBadgeElement {
  private shadowRootInternal: ShadowRoot;

  private state: BadgeState = {
    content: '',
    variant: 'default',
    size: 'medium',
    disabled: false,
    pill: false,
    dot: false,
  };

  static get observedAttributes(): string[] {
    return ['content', 'variant', 'size', 'disabled', 'pill', 'dot'];
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
      case 'content':
        this.state.content = newValue || '';
        break;
      case 'variant':
        if (['default', 'primary', 'success', 'warning', 'error', 'info'].includes(newValue || '')) {
          this.state.variant = newValue as BadgeVariant;
        }
        break;
      case 'size':
        if (['small', 'medium', 'large'].includes(newValue || '')) {
          this.state.size = newValue as BadgeSize;
        }
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'pill':
        this.state.pill = newValue !== null;
        break;
      case 'dot':
        this.state.dot = newValue !== null;
        break;
    }

    this.render();
  }

  get content(): string {
    return this.state.content;
  }

  set content(val: string) {
    this.state.content = val;
    this.setAttribute('content', val);
    this.render();
  }

  get variant(): BadgeVariant {
    return this.state.variant;
  }

  set variant(val: BadgeVariant) {
    this.state.variant = val;
    this.setAttribute('variant', val);
    this.render();
  }

  get size(): BadgeSize {
    return this.state.size;
  }

  set size(val: BadgeSize) {
    this.state.size = val;
    this.setAttribute('size', val);
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

  get pill(): boolean {
    return this.state.pill;
  }

  set pill(val: boolean) {
    this.state.pill = val;
    if (val) {
      this.setAttribute('pill', '');
    } else {
      this.removeAttribute('pill');
    }
    this.render();
  }

  get dot(): boolean {
    return this.state.dot;
  }

  set dot(val: boolean) {
    this.state.dot = val;
    if (val) {
      this.setAttribute('dot', '');
    } else {
      this.removeAttribute('dot');
    }
    this.render();
  }

  private getColorAndBackground(): { bg: string; text: string } {
    switch (this.state.variant) {
      case 'primary':
        return { bg: themeManager.getColor('PRIMARY') || '#007bff', text: '#fff' };
      case 'success':
        return { bg: '#28a745', text: '#fff' };
      case 'warning':
        return { bg: '#ffc107', text: '#000' };
      case 'error':
        return { bg: '#dc3545', text: '#fff' };
      case 'info':
        return { bg: '#17a2b8', text: '#fff' };
      case 'default':
      default:
        return { bg: themeManager.getColor('SURFACE_LIGHT') || '#e9ecef', text: themeManager.getColor('TEXT') || '#000' };
    }
  }

  private getSizeStyles(): { padding: string; fontSize: string; minHeight: string } {
    switch (this.state.size) {
      case 'small':
        return { padding: '2px 6px', fontSize: '10px', minHeight: '16px' };
      case 'large':
        return { padding: '8px 12px', fontSize: '14px', minHeight: '32px' };
      case 'medium':
      default:
        return { padding: '4px 8px', fontSize: '12px', minHeight: '20px' };
    }
  }

  private getStyles(): string {
    const { bg, text } = this.getColorAndBackground();
    const { padding, fontSize, minHeight } = this.getSizeStyles();

    return `
      :host {
        display: inline-block;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: ${padding};
        background: ${bg};
        color: ${text};
        font-size: ${fontSize};
        font-weight: 600;
        border-radius: 4px;
        min-height: ${minHeight};
        border: none;
        white-space: nowrap;
        user-select: none;
        transition: all 0.2s ease;
      }

      .badge.pill {
        border-radius: 12px;
        padding-left: 10px;
        padding-right: 10px;
      }

      .badge.dot {
        width: 8px;
        height: 8px;
        padding: 0;
        border-radius: 50%;
        min-height: auto;
      }

      .badge.dot.small {
        width: 6px;
        height: 6px;
      }

      .badge.dot.large {
        width: 12px;
        height: 12px;
      }

      :host([disabled]) .badge {
        opacity: 0.6;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const badgeClass = `badge ${this.state.pill ? 'pill' : ''} ${this.state.dot ? 'dot' : ''} ${this.state.size}`;

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <span
        class="${badgeClass}"
        role="status"
        aria-label="${this.escapeHtml(this.state.content)}"
        aria-disabled="${this.state.disabled}"
      >
        ${!this.state.dot ? this.escapeHtml(this.state.content) : ''}
      </span>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('ui-badge', UiBadge);

declare global {
  interface HTMLElementTagNameMap {
    'ui-badge': UiBadge;
  }
}

export { UiBadge };
