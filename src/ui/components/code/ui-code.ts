/**
 * ui-code: A code display component.
 */

import { ICodeElement, CodeState, CodeLanguage } from './ui-code.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiCode extends HTMLElement implements ICodeElement {
  private shadowRootInternal: ShadowRoot;

  private state: CodeState = {
    code: undefined,
    language: 'plaintext',
    showLineNumbers: true,
    copyable: true,
  };

  static get observedAttributes(): string[] {
    return ['code', 'language', 'showLineNumbers', 'copyable'];
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
      case 'code':
        this.state.code = newValue ?? undefined;
        break;
      case 'language':
        if (
          ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'sql', 'yaml', 'xml', 'plaintext'].includes(newValue || '')
        ) {
          this.state.language = newValue as CodeLanguage;
        }
        break;
      case 'showLineNumbers':
        this.state.showLineNumbers = newValue !== 'false';
        break;
      case 'copyable':
        this.state.copyable = newValue !== 'false';
        break;
    }

    this.render();
  }

  get code(): string | undefined {
    return this.state.code;
  }

  set code(val: string | undefined) {
    this.state.code = val;
    if (val) {
      this.setAttribute('code', val);
    } else {
      this.removeAttribute('code');
    }
    this.render();
  }

  get language(): CodeLanguage {
    return this.state.language;
  }

  set language(val: CodeLanguage) {
    this.state.language = val;
    this.setAttribute('language', val);
    this.render();
  }

  get showLineNumbers(): boolean {
    return this.state.showLineNumbers;
  }

  set showLineNumbers(val: boolean) {
    this.state.showLineNumbers = val;
    if (!val) {
      this.setAttribute('showLineNumbers', 'false');
    } else {
      this.removeAttribute('showLineNumbers');
    }
    this.render();
  }

  get copyable(): boolean {
    return this.state.copyable;
  }

  set copyable(val: boolean) {
    this.state.copyable = val;
    if (!val) {
      this.setAttribute('copyable', 'false');
    } else {
      this.removeAttribute('copyable');
    }
    this.render();
  }

  copy(): void {
    if (this.state.code && navigator.clipboard) {
      navigator.clipboard.writeText(this.state.code).catch(() => {
        // Fallback: use deprecated execCommand
        const textarea = document.createElement('textarea');
        textarea.value = this.state.code!;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      });
    }
  }

  private getLineNumbers(): string {
    if (!this.state.code || !this.state.showLineNumbers) return '';

    const lines = this.state.code.split('\n');
    return lines.map((_, i) => `${i + 1}`).join('\n');
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }

  private getStyles(): string {
    const bgColor = themeManager.getColor('SURFACE_LIGHT') || '#f5f5f5';
    const textColor = themeManager.getColor('TEXT') || '#333';
    const borderColor = themeManager.getColor('BORDER') || '#ddd';

    return `
      :host {
        display: block;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 14px;
      }

      .code-wrapper {
        display: flex;
        border: 1px solid ${borderColor};
        border-radius: 6px;
        overflow: hidden;
      }

      .code-line-numbers {
        background: ${bgColor};
        color: #999;
        padding: 16px 12px;
        text-align: right;
        user-select: none;
        border-right: 1px solid ${borderColor};
        min-width: 50px;
      }

      .code-container {
        flex: 1;
        background: ${bgColor};
        color: ${textColor};
        padding: 16px;
        overflow-x: auto;
        position: relative;
      }

      pre {
        margin: 0;
        font-family: inherit;
        line-height: 1.6;
      }

      code {
        font-family: inherit;
        white-space: pre;
      }

      .code-toolbar {
        display: flex;
        gap: 8px;
        padding: 8px;
        background: ${bgColor};
        border-bottom: 1px solid ${borderColor};
        align-items: center;
      }

      .copy-button {
        padding: 4px 8px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }

      .copy-button:hover {
        background: #0056b3;
      }

      .language-badge {
        font-size: 12px;
        color: #999;
        text-transform: uppercase;
        margin-left: auto;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const code = this.state.code || '';
    const lineNumbers = this.getLineNumbers();
    const showLineNumbers = this.state.showLineNumbers && code.length > 0;
    const copyButton = this.state.copyable && code.length > 0 ? `<button class="copy-button">Copy</button>` : '';
    const lineNumbersHtml = showLineNumbers ? `<div class="code-line-numbers"><pre>${lineNumbers}</pre></div>` : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="code-toolbar">
        ${copyButton}
        <div class="language-badge">${this.state.language}</div>
      </div>
      <div class="code-wrapper">
        ${lineNumbersHtml}
        <div class="code-container">
          <pre><code>${this.escapeHtml(code)}</code></pre>
        </div>
      </div>
    `;

    const copyButton_ = this.shadowRoot?.querySelector('.copy-button');
    if (copyButton_) {
      copyButton_.addEventListener('click', () => this.copy());
    }
  }
}

customElements.define('ui-code', UiCode);

declare global {
  interface HTMLElementTagNameMap {
    'ui-code': UiCode;
  }
}

export { UiCode };
