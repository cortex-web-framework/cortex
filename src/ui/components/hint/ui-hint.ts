import { IHintElement, HintState } from './ui-hint.types.js';

class UiHint extends HTMLElement implements IHintElement {
  private state: HintState = {};
  private sr: ShadowRoot;

  static get observedAttributes() {
    return ['text', 'type'];
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
    if (name === 'type') this.state.type = (val as any) || undefined;
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

  get type() {
    return this.state.type;
  }

  set type(val: 'info' | 'warning' | 'error' | 'success' | undefined) {
    this.state.type = val;
    if (val) this.setAttribute('type', val);
    else this.removeAttribute('type');
    this.render();
  }

  private render() {
    const colors: Record<string, string> = { info: '#17a2b8', warning: '#ffc107', error: '#dc3545', success: '#28a745' };
    const color = colors[this.state.type || 'info'];
    this.sr.innerHTML = `<style>:host{display:block}span{font-size:12px;color:${color};display:flex;align-items:center;gap:6px}span::before{content:'ℹ';font-weight:bold}</style><span>${this.state.text || ''}<slot></slot></span>`;
  }
}

customElements.define('ui-hint', UiHint);

declare global {
  interface HTMLElementTagNameMap {
    'ui-hint': UiHint;
  }
}

export { UiHint };
