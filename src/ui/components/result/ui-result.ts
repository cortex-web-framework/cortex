import { IResultElement, ResultState } from './ui-result.types.js';
class UiResult extends HTMLElement implements IResultElement {
  private state: ResultState = {};
  private sr: ShadowRoot;
  static get observedAttributes() { return ['type', 'result-title', 'description']; }
  constructor() { super(); this.sr = this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this.render(); }
  attributeChangedCallback(n: string, _: string | null, v: string | null) { if (n === 'result-title') this.state.resultTitle = v ?? undefined; else if (n === 'type') this.state.type = v as any ?? undefined; else if (n === 'description') this.state.description = v ?? undefined; this.render(); }
  get type() { return this.state.type; }
  set type(v: 'success' | 'error' | 'warning' | 'info' | undefined) { this.state.type = v; this.render(); }
  get resultTitle() { return this.state.resultTitle; }
  set resultTitle(v: string | undefined) { this.state.resultTitle = v; this.render(); }
  get description() { return this.state.description; }
  set description(v: string | undefined) { this.state.description = v; this.render(); }
  private render() {
    const icons: Record<string, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const colors: Record<string, string> = { success: '#28a745', error: '#dc3545', warning: '#ffc107', info: '#17a2b8' };
    const icon = icons[this.state.type || 'info'];
    const color = colors[this.state.type || 'info'];
    this.sr.innerHTML = `<style>:host{display:block;text-align:center;padding:40px}.icon{font-size:48px;color:${color};margin-bottom:16px}.title{font-size:20px;font-weight:bold;margin:16px 0}.desc{color:#666}</style><div class="icon">${icon}</div><div class="title">${this.state.resultTitle || ''}</div><div class="desc">${this.state.description || ''}</div><slot></slot>`;
  }
}
customElements.define('ui-result', UiResult);
declare global { interface HTMLElementTagNameMap { 'ui-result': UiResult; } }
export { UiResult };
