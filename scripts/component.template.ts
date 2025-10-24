class {{componentPascalCase}} extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            padding: 16px;
            color: var(--cortex-text-color, #333);
            background-color: var(--cortex-background-color, #f0f0f0);
            border: 1px solid var(--cortex-border-color, #ccc);
            border-radius: var(--cortex-border-radius, 4px);
          }
        </style>
        <p>Hello, Cortex!</p>
      `;
    }
  }

  static get observedAttributes() {
    return ['message'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'message' && this.shadowRoot) {
      this.shadowRoot.querySelector('p').textContent = newValue;
    }
  }

  get message() {
    return this.getAttribute('message') || 'Hello, Cortex!';
  }

  set message(value) {
    this.setAttribute('message', value);
  }
}

customElements.define('{{componentKebabCase}}', {{componentPascalCase}});