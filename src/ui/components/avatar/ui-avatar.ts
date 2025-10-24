/**
 * ui-avatar: A user avatar component with image and initials fallback.
 */

import { IAvatarElement, AvatarState, AvatarSize, AvatarShape } from './ui-avatar.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiAvatar extends HTMLElement implements IAvatarElement {
  private shadowRootInternal: ShadowRoot;

  private state: AvatarState = {
    src: undefined,
    alt: undefined,
    initials: undefined,
    size: 'medium',
    shape: 'circle',
    disabled: false,
  };

  static get observedAttributes(): string[] {
    return ['src', 'alt', 'initials', 'size', 'shape', 'disabled'];
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
      case 'src':
        this.state.src = newValue ?? undefined;
        break;
      case 'alt':
        this.state.alt = newValue ?? undefined;
        break;
      case 'initials':
        this.state.initials = newValue ?? undefined;
        break;
      case 'size':
        if (['small', 'medium', 'large', 'xlarge'].includes(newValue || '')) {
          this.state.size = newValue as AvatarSize;
        }
        break;
      case 'shape':
        if (['circle', 'square', 'rounded'].includes(newValue || '')) {
          this.state.shape = newValue as AvatarShape;
        }
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
    }

    this.render();
  }

  get src(): string | undefined {
    return this.state.src;
  }

  set src(val: string | undefined) {
    this.state.src = val;
    if (val) {
      this.setAttribute('src', val);
    } else {
      this.removeAttribute('src');
    }
    this.render();
  }

  get alt(): string | undefined {
    return this.state.alt;
  }

  set alt(val: string | undefined) {
    this.state.alt = val;
    if (val) {
      this.setAttribute('alt', val);
    } else {
      this.removeAttribute('alt');
    }
    this.render();
  }

  get initials(): string | undefined {
    return this.state.initials;
  }

  set initials(val: string | undefined) {
    this.state.initials = val;
    if (val) {
      this.setAttribute('initials', val);
    } else {
      this.removeAttribute('initials');
    }
    this.render();
  }

  get size(): AvatarSize {
    return this.state.size;
  }

  set size(val: AvatarSize) {
    this.state.size = val;
    this.setAttribute('size', val);
    this.render();
  }

  get shape(): AvatarShape {
    return this.state.shape;
  }

  set shape(val: AvatarShape) {
    this.state.shape = val;
    this.setAttribute('shape', val);
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

  private getSizeStyles(): { width: string; height: string; fontSize: string } {
    switch (this.state.size) {
      case 'small':
        return { width: '32px', height: '32px', fontSize: '12px' };
      case 'large':
        return { width: '64px', height: '64px', fontSize: '24px' };
      case 'xlarge':
        return { width: '96px', height: '96px', fontSize: '32px' };
      case 'medium':
      default:
        return { width: '48px', height: '48px', fontSize: '18px' };
    }
  }

  private getBorderRadius(): string {
    switch (this.state.shape) {
      case 'circle':
        return '50%';
      case 'square':
        return '0';
      case 'rounded':
      default:
        return '8px';
    }
  }

  private getStyles(): string {
    const { width, height, fontSize } = this.getSizeStyles();
    const borderRadius = this.getBorderRadius();

    return `
      :host {
        display: inline-block;
      }

      .avatar {
        width: ${width};
        height: ${height};
        border-radius: ${borderRadius};
        overflow: hidden;
        background: ${themeManager.getColor('SURFACE_LIGHT') || '#e9ecef'};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-initials {
        font-size: ${fontSize};
        font-weight: 600;
        color: ${themeManager.getColor('TEXT') || '#000'};
        text-transform: uppercase;
      }

      :host([disabled]) .avatar {
        opacity: 0.5;
      }

      :host([disabled]) .avatar-initials {
        opacity: 0.5;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    let content = '';

    if (this.state.src) {
      content = `<img src="${this.escapeHtml(this.state.src)}" alt="${this.escapeHtml(this.state.alt || 'Avatar')}" />`;
    } else if (this.state.initials) {
      content = `<div class="avatar-initials">${this.escapeHtml(this.state.initials)}</div>`;
    }

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="avatar" role="img" aria-label="${this.escapeHtml(this.state.alt || this.state.initials || 'Avatar')}">
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

customElements.define('ui-avatar', UiAvatar);

declare global {
  interface HTMLElementTagNameMap {
    'ui-avatar': UiAvatar;
  }
}

export { UiAvatar };
