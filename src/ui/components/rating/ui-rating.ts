/**
 * ui-rating: A star rating component.
 */

import { IRatingElement, RatingState } from './ui-rating.types.js';

class UiRating extends HTMLElement implements IRatingElement {
  private shadowRootInternal: ShadowRoot;

  private state: RatingState = {
    value: 0,
    maxValue: 5,
    readonly: false,
    size: 'medium',
  };

  static get observedAttributes(): string[] {
    return ['value', 'maxValue', 'readonly', 'size'];
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
      case 'value':
        this.state.value = parseInt(newValue || '0', 10);
        break;
      case 'maxValue':
        this.state.maxValue = parseInt(newValue || '5', 10);
        break;
      case 'readonly':
        this.state.readonly = newValue === 'true';
        break;
      case 'size':
        if (['small', 'medium', 'large'].includes(newValue || '')) {
          this.state.size = newValue as 'small' | 'medium' | 'large';
        }
        break;
    }

    this.render();
  }

  get value(): number {
    return this.state.value;
  }

  set value(val: number) {
    this.state.value = val;
    this.setAttribute('value', val.toString());
    this.render();
  }

  get maxValue(): number {
    return this.state.maxValue;
  }

  set maxValue(val: number) {
    this.state.maxValue = val;
    this.setAttribute('maxValue', val.toString());
    this.render();
  }

  get readonly(): boolean {
    return this.state.readonly;
  }

  set readonly(val: boolean) {
    this.state.readonly = val;
    if (val) {
      this.setAttribute('readonly', 'true');
    } else {
      this.removeAttribute('readonly');
    }
    this.render();
  }

  get size(): 'small' | 'medium' | 'large' {
    return this.state.size;
  }

  set size(val: 'small' | 'medium' | 'large') {
    this.state.size = val;
    this.setAttribute('size', val);
    this.render();
  }

  private getFontSize(): string {
    const sizes: Record<'small' | 'medium' | 'large', string> = {
      small: '16px',
      medium: '24px',
      large: '32px',
    };
    return sizes[this.state.size];
  }

  private getStyles(): string {
    const cursor = this.state.readonly ? 'default' : 'pointer';

    return `
      :host {
        display: inline-block;
      }

      .rating-container {
        display: flex;
        gap: 4px;
      }

      .star {
        font-size: ${this.getFontSize()};
        cursor: ${cursor};
        color: #ddd;
        user-select: none;
      }

      .star.filled {
        color: #ffc107;
      }

      .star.half {
        background: linear-gradient(90deg, #ffc107 50%, #ddd 50%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    let starsHtml = '';
    for (let i = 1; i <= this.state.maxValue; i++) {
      const filled = i <= this.state.value;
      starsHtml += `<span class="star ${filled ? 'filled' : ''}">★</span>`;
    }

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="rating-container">
        ${starsHtml}
      </div>
    `;

    if (!this.state.readonly) {
      const stars = this.shadowRoot?.querySelectorAll('.star');
      stars?.forEach((star, index) => {
        star.addEventListener('click', () => {
          this.value = index + 1;
          this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value } }));
        });
      });
    }
  }
}

customElements.define('ui-rating', UiRating);

declare global {
  interface HTMLElementTagNameMap {
    'ui-rating': UiRating;
  }
}

export { UiRating };
