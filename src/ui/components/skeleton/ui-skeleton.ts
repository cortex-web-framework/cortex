/**
 * ui-skeleton: A loading placeholder component.
 */

import { ISkeletonElement, SkeletonState, SkeletonVariant } from './ui-skeleton.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiSkeleton extends HTMLElement implements ISkeletonElement {
  private shadowRootInternal: ShadowRoot;

  private state: SkeletonState = {
    variant: 'text',
    width: undefined,
    height: undefined,
    animating: true,
  };

  static get observedAttributes(): string[] {
    return ['variant', 'width', 'height', 'animate'];
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
      case 'variant':
        if (['text', 'circle', 'rectangle'].includes(newValue || '')) {
          this.state.variant = newValue as SkeletonVariant;
        }
        break;
      case 'width':
        this.state.width = newValue ?? undefined;
        break;
      case 'height':
        this.state.height = newValue ?? undefined;
        break;
      case 'animate':
        this.state.animating = newValue !== 'false';
        break;
    }

    this.render();
  }

  get variant(): SkeletonVariant {
    return this.state.variant;
  }

  set variant(val: SkeletonVariant) {
    this.state.variant = val;
    this.setAttribute('variant', val);
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

  get height(): string | undefined {
    return this.state.height;
  }

  set height(val: string | undefined) {
    this.state.height = val;
    if (val) {
      this.setAttribute('height', val);
    } else {
      this.removeAttribute('height');
    }
    this.render();
  }

  get animating(): boolean {
    return this.state.animating;
  }

  set animating(val: boolean) {
    this.state.animating = val;
    if (!val) {
      this.setAttribute('animate', 'false');
    } else {
      this.removeAttribute('animate');
    }
    this.render();
  }

  private getStyles(): string {
    const bgColor = themeManager.getColor('SURFACE_LIGHT') || '#e9ecef';
    const animation = this.state.animating ? 'skeleton-pulse 1.5s ease-in-out infinite' : 'none';

    let width = '100%';
    let height = '12px';
    let borderRadius = '4px';

    if (this.state.width) width = this.state.width;
    if (this.state.height) height = this.state.height;

    if (this.state.variant === 'circle') {
      borderRadius = '50%';
      if (!this.state.width && !this.state.height) {
        width = '40px';
        height = '40px';
      }
    } else if (this.state.variant === 'rectangle') {
      if (!this.state.width) width = '100%';
      if (!this.state.height) height = '200px';
    }

    return `
      :host {
        display: block;
      }

      .skeleton {
        width: ${width};
        height: ${height};
        background: ${bgColor};
        border-radius: ${borderRadius};
        animation: ${animation};
      }

      @keyframes skeleton-pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="skeleton" aria-busy="true" aria-label="Loading..."></div>
    `;
  }
}

customElements.define('ui-skeleton', UiSkeleton);

declare global {
  interface HTMLElementTagNameMap {
    'ui-skeleton': UiSkeleton;
  }
}

export { UiSkeleton };
