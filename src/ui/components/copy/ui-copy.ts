import { ICopyElement, CopyState } from './ui-copy.types.js';
class UiCopy extends HTMLElement implements ICopyElement {
  private state: CopyState = { copied: false };
  private sr: ShadowRoot;
  static get observedAttributes() { return ['text']; }
  constructor() { super(); this.sr = this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this.render(); }
  attributeChangedCallback(n: string, _: string | null, v: string | null) { if (n === 'text') this.state.text = v ?? undefined; this.render(); }
  get text() { return this.state.text; }
  set text(v: string | undefined) { this.state.text = v; if (v) this.setAttribute('text', v); else this.removeAttribute('text'); this.render(); }
  get copied() { return this.state.copied; }
  copy() { if (this.state.text) navigator.clipboard.writeText(this.state.text); this.state.copied = true; this.render(); setTimeout(() => { this.state.copied = false; this.render(); }, 1000); }
  private render() { this.sr.innerHTML = `<style>:host{display:inline}button{padding:8px 12px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer}button:hover{background:#0056b3}</style><button>${this.state.copied ? '✓ Copied' : 'Copy'}</button>`; this.sr.querySelector('button')?.addEventListener('click', () => this.copy()); }
}
customElements.define('ui-copy', UiCopy);
declare global { interface HTMLElementTagNameMap { 'ui-copy': UiCopy; } }
export { UiCopy };
