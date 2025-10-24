import { IWatermarkElement, WatermarkState } from './ui-watermark.types.js';

class UiWatermark extends HTMLElement implements IWatermarkElement {
  private state: WatermarkState = { opacity: 0.1, fontSize: 20, angle: -45 };
  private sr: ShadowRoot;

  static get observedAttributes() {
    return ['text', 'opacity', 'font-size', 'angle'];
  }

  constructor() {
    super();
    this.sr = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, _: string | null, val: string | null) {
    if (name === 'text') this.state.text = val || undefined;
    if (name === 'opacity') this.state.opacity = Math.max(0, Math.min(1, parseFloat(val || '0.1')));
    if (name === 'font-size') this.state.fontSize = Math.max(1, parseInt(val || '20', 10));
    if (name === 'angle') this.state.angle = parseInt(val || '-45', 10) % 360;
    this.render();
  }

  get text() {
    return this.state.text;
  }

  set text(val: string | undefined) {
    this.state.text = val;
    if (val) this.setAttribute('text', val);
    else this.removeAttribute('text');
    this.render();
  }

  get opacity() {
    return this.state.opacity;
  }

  set opacity(val: number) {
    this.state.opacity = Math.max(0, Math.min(1, val));
    this.setAttribute('opacity', this.state.opacity.toString());
    this.render();
  }

  get fontSize() {
    return this.state.fontSize;
  }

  set fontSize(val: number) {
    this.state.fontSize = Math.max(1, val);
    this.setAttribute('font-size', this.state.fontSize.toString());
    this.render();
  }

  get angle() {
    return this.state.angle;
  }

  set angle(val: number) {
    this.state.angle = val % 360;
    this.setAttribute('angle', this.state.angle.toString());
    this.render();
  }

  private render() {
    const id = `watermark-${Math.random().toString(36).slice(2, 9)}`;
    this.sr.innerHTML = `<style>:host{position:relative;display:block}.watermark{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden;z-index:1}.watermark svg{width:100%;height:100%}svg text{fill:#000;font-weight:bold;letter-spacing:2px}</style><div class="watermark"><svg viewBox="0 0 400 300" preserveAspectRatio="none"><defs><pattern id="${id}" x="0" y="0" width="400" height="300" patternUnits="userSpaceOnUse"><text x="200" y="150" font-size="${this.state.fontSize}" text-anchor="middle" opacity="${this.state.opacity}" transform="rotate(${this.state.angle} 200 150)">${this.state.text || 'Watermark'}</text></pattern></defs><rect width="400" height="300" fill="url(#${id})"/></svg></div><slot></slot>`;
  }
}

customElements.define('ui-watermark', UiWatermark);

declare global {
  interface HTMLElementTagNameMap {
    'ui-watermark': UiWatermark;
  }
}

export { UiWatermark };
