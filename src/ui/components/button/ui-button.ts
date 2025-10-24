import { themeManager } from '../../theme/theme-manager';
// Removed: import { UI_COLORS } from '../../theme/colors';
// Removed: import { UI_BORDER_RADIUS } from '../../theme/borders';
// Removed: import { UI_SPACING } from '../../theme/spacing';
// Removed: import { UI_FONT_SIZES, UI_FONT_WEIGHTS } from '../../theme/typography';

/**
 * @typedef {'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost'} ButtonVariant
 * @typedef {'small' | 'medium' | 'large'} ButtonSize
 */

/**
 * `UiButton` is a custom element that renders a customizable button.
 * It supports different variants, sizes, disabled states, and loading states.
 *
 * @element ui-button
 *
 * @attr {ButtonVariant} variant - The visual style of the button (default: 'primary').
 * @attr {ButtonSize} size - The size of the button (default: 'medium').
 * @attr {boolean} disabled - If true, the button is disabled.
 * @attr {boolean} loading - If true, the button shows a loading indicator and is disabled.
 *
 * @slot - The content of the button.
 *
 * @cssprop [--ui-button-background-color=var(--ui-color-primary)] - Background color of the button.
 * @cssprop [--ui-button-color=var(--ui-color-background-default)] - Text color of the button.
 * @cssprop [--ui-button-border-color=var(--ui-color-primary)] - Border color of the button.
 * @cssprop [--ui-button-padding=var(--ui-spacing-md) var(--ui-spacing-lg)] - Padding of the button.
 * @cssprop [--ui-button-font-size=var(--ui-font-size-md)] - Font size of the button.
 * @cssprop [--ui-button-border-radius=var(--ui-border-radius-md)] - Border radius of the button.
 */
class UiButton extends HTMLElement {
  /**
   * @type {ButtonVariant}
   */
  private _variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' = 'primary';
  /**
   * @type {ButtonSize}
   */
  private _size: 'small' | 'medium' | 'large' = 'medium';
  private _disabled: boolean = false;
  private _loading: boolean = false;

  static get observedAttributes(): string[] {
    return ['variant', 'size', 'disabled', 'loading'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.handleClick = this.handleClick.bind(this);
  }

  connectedCallback(): void {
    this.shadowRoot?.addEventListener('click', this.handleClick);
    this.render();
  }

  disconnectedCallback(): void {
    this.shadowRoot?.removeEventListener('click', this.handleClick);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      switch (name) {
        case 'variant':
          // Validate and cast newValue to ButtonVariant
          if (newValue && ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ghost'].includes(newValue)) {
            this._variant = newValue as 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
          } else {
            this._variant = 'primary'; // Default if invalid
          }
          break;
        case 'size':
          // Validate and cast newValue to ButtonSize
          if (newValue && ['small', 'medium', 'large'].includes(newValue)) {
            this._size = newValue as 'small' | 'medium' | 'large';
          } else {
            this._size = 'medium'; // Default if invalid
          }
          break;
        case 'disabled':
          this._disabled = newValue !== null;
          break;
        case 'loading':
          this._loading = newValue !== null;
          break;
      }
      this.render();
    }
  }

  /**
   * @param {ButtonVariant} value
   */
  set variant(value: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost') {
    this.setAttribute('variant', value);
  }

  get variant(): 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' {
    return this._variant;
  }

  /**
   * @param {ButtonSize} value
   */
  set size(value: 'small' | 'medium' | 'large') {
    this.setAttribute('size', value);
  }

  get size(): 'small' | 'medium' | 'large' {
    return this._size;
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set loading(value: boolean) {
    if (value) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }

  get loading(): boolean {
    return this._loading;
  }

  private handleClick(event: Event): void {
    if (this.disabled || this.loading) {
      event.stopPropagation(); // Prevent click event from propagating if disabled or loading
      return;
    }
    // Re-dispatch the click event from the host element
    this.dispatchEvent(new MouseEvent('click', event));
  }

  private getButtonStyles(): string {
    const isGhost = this.variant === 'ghost';
    const variantColorName = this.variant.toUpperCase() as 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER' | 'WARNING' | 'INFO'; // Cast to specific keys

    const backgroundColor = isGhost ? 'transparent' : themeManager.getColor(variantColorName);
    const textColor = isGhost ? themeManager.getColor(variantColorName) : themeManager.getColor('BACKGROUND_DEFAULT');
    const borderColor = isGhost ? themeManager.getColor(variantColorName) : themeManager.getColor(variantColorName);

    let padding = `${themeManager.getSpacing('SM')} ${themeManager.getSpacing('MD')}`;
    let fontSize = themeManager.getFontSize('MD');
    let fontWeight = themeManager.getFontWeight('NORMAL');

    switch (this.size) {
      case 'small':
        padding = `${themeManager.getSpacing('XXS')} ${themeManager.getSpacing('SM')}`;
        fontSize = themeManager.getFontSize('SM');
        break;
      case 'large':
        padding = `${themeManager.getSpacing('MD')} ${themeManager.getSpacing('XL')}`;
        fontSize = themeManager.getFontSize('LG');
        fontWeight = themeManager.getFontWeight('MEDIUM');
        break;
    }

    const borderRadius = themeManager.getBorderRadius('MD');
    const transition = themeManager.getTransition('FAST');

    return `
      :host {
        display: inline-block;
        cursor: pointer;
      }
      button {
        background-color: ${backgroundColor};
        color: ${textColor};
        border: 1px solid ${borderColor};
        padding: ${padding};
        font-size: ${fontSize};
        font-weight: ${fontWeight};
        border-radius: ${borderRadius};
        cursor: ${this.disabled || this.loading ? 'not-allowed' : 'pointer'};
        transition: ${transition};
        outline: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: ${themeManager.getSpacing('XXS')};
        opacity: ${this.disabled || this.loading ? '0.6' : '1'};
      }
      button:hover:not([disabled]):not([loading]) {
        background-color: ${isGhost ? 'transparent' : `var(${themeManager.getColor(variantColorName)}-hover, ${themeManager.getColor(variantColorName)})`};
        border-color: ${isGhost ? `var(${themeManager.getColor(variantColorName)}-hover, ${themeManager.getColor(variantColorName)})` : `var(${themeManager.getColor(variantColorName)}-hover, ${themeManager.getColor(variantColorName)})`};
        color: ${isGhost ? `var(${themeManager.getColor(variantColorName)}-hover, ${themeManager.getColor(variantColorName)})` : `var(${themeManager.getColor('BACKGROUND_DEFAULT')}, ${themeManager.getColor('BACKGROUND_DEFAULT')})`};
      }
      button:active:not([disabled]):not([loading]) {
        background-color: ${isGhost ? 'transparent' : `var(${themeManager.getColor(variantColorName)}-active, ${themeManager.getColor(variantColorName)})`};
        border-color: ${isGhost ? `var(${themeManager.getColor(variantColorName)}-active, ${themeManager.getColor(variantColorName)})` : `var(${themeManager.getColor(variantColorName)}-active, ${themeManager.getColor(variantColorName)})`};
        color: ${isGhost ? `var(${themeManager.getColor(variantColorName)}-active, ${themeManager.getColor(variantColorName)})` : `var(${themeManager.getColor('BACKGROUND_DEFAULT')}, ${themeManager.getColor('BACKGROUND_DEFAULT')})`};
      }
      button:focus-visible {
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5); /* Focus ring */
      }
      .loading-spinner {
        border: 2px solid #f3f3f3;
        border-top: 2px solid ${textColor};
        border-radius: 50%;
        width: 1em;
        height: 1em;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
  }

  render(): void {
    if (!this.shadowRoot) return;

    const disabledAttr = (this.disabled || this.loading) ? 'disabled' : ''; // Correct HTML syntax for boolean attribute

    this.shadowRoot.innerHTML = `
      <style>${this.getButtonStyles()}</style>
      <button
        type="button"
        ${disabledAttr}
        aria-busy="${this.loading}"
        aria-label="${this.loading ? 'Loading' : ''}"
      >
        ${this.loading ? '<div class="loading-spinner"></div>' : ''}
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('ui-button', UiButton);