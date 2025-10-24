/**
 * ui-modal: A modal dialog component with customizable size and close behavior.
 */

import { IModalElement, ModalState } from './ui-modal.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiModal extends HTMLElement implements IModalElement {
  private shadowRootInternal: ShadowRoot;

  private state: ModalState = {
    isOpen: false,
    modalTitle: undefined,
    size: 'medium',
    closeOnEscape: true,
    closeOnBackdrop: true,
    backdrop: true,
  };

  static get observedAttributes(): string[] {
    return ['isOpen', 'modalTitle', 'size', 'closeOnEscape', 'closeOnBackdrop', 'backdrop'];
  }

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'isOpen':
        this.state.isOpen = newValue !== null;
        break;
      case 'modalTitle':
        this.state.modalTitle = newValue ?? undefined;
        break;
      case 'size':
        if (['small', 'medium', 'large', 'fullscreen'].includes(newValue || '')) {
          this.state.size = newValue as 'small' | 'medium' | 'large' | 'fullscreen';
        }
        break;
      case 'closeOnEscape':
        this.state.closeOnEscape = newValue !== null;
        break;
      case 'closeOnBackdrop':
        this.state.closeOnBackdrop = newValue !== null;
        break;
      case 'backdrop':
        this.state.backdrop = newValue !== null;
        break;
    }

    this.render();
  }

  get isOpen(): boolean {
    return this.state.isOpen;
  }

  set isOpen(val: boolean) {
    this.state.isOpen = val;
    if (val) {
      this.setAttribute('isOpen', '');
    } else {
      this.removeAttribute('isOpen');
    }
    this.render();
  }

  get modalTitle(): string | undefined {
    return this.state.modalTitle;
  }

  set modalTitle(val: string | undefined) {
    this.state.modalTitle = val;
    if (val) {
      this.setAttribute('modalTitle', val);
    } else {
      this.removeAttribute('modalTitle');
    }
    this.render();
  }

  get size(): 'small' | 'medium' | 'large' | 'fullscreen' {
    return this.state.size;
  }

  set size(val: 'small' | 'medium' | 'large' | 'fullscreen') {
    this.state.size = val;
    this.setAttribute('size', val);
    this.render();
  }

  get closeOnEscape(): boolean {
    return this.state.closeOnEscape;
  }

  set closeOnEscape(val: boolean) {
    this.state.closeOnEscape = val;
    if (val) {
      this.setAttribute('closeOnEscape', '');
    } else {
      this.removeAttribute('closeOnEscape');
    }
  }

  get closeOnBackdrop(): boolean {
    return this.state.closeOnBackdrop;
  }

  set closeOnBackdrop(val: boolean) {
    this.state.closeOnBackdrop = val;
    if (val) {
      this.setAttribute('closeOnBackdrop', '');
    } else {
      this.removeAttribute('closeOnBackdrop');
    }
  }

  get backdrop(): boolean {
    return this.state.backdrop;
  }

  set backdrop(val: boolean) {
    this.state.backdrop = val;
    if (val) {
      this.setAttribute('backdrop', '');
    } else {
      this.removeAttribute('backdrop');
    }
    this.render();
  }

  open(): void {
    this.isOpen = true;
    this.dispatchEvent(
      new CustomEvent('open', {
        detail: { isOpen: true },
        bubbles: true,
        composed: true,
      })
    );
  }

  close(): void {
    this.isOpen = false;
    this.dispatchEvent(
      new CustomEvent('close', {
        detail: { isOpen: false },
        bubbles: true,
        composed: true,
      })
    );
  }

  toggle(): void {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private setupEventListeners(): void {
    const backdrop = this.shadowRootInternal.querySelector('.modal-backdrop');
    const closeBtn = this.shadowRootInternal.querySelector('.modal-close');

    if (backdrop && this.state.closeOnBackdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.dispatchEvent(
            new CustomEvent('backdrop-click', {
              bubbles: true,
              composed: true,
            })
          );
          this.close();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    if (this.state.closeOnEscape) {
      this.addEventListener('keydown', (e) => {
        const event = e as KeyboardEvent;
        if (event.key === 'Escape' && this.state.isOpen) {
          this.close();
        }
      });
    }
  }

  private getStyles(): string {
    const sizeMap = {
      small: '300px',
      medium: '500px',
      large: '800px',
      fullscreen: '100%',
    };

    const width = sizeMap[this.state.size];

    return `
      :host {
        display: block;
      }

      .modal-backdrop {
        display: ${this.state.isOpen && this.state.backdrop ? 'block' : 'none'};
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
      }

      .modal-container {
        display: ${this.state.isOpen ? 'flex' : 'none'};
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        align-items: center;
        justify-content: center;
        z-index: 1001;
        padding: ${themeManager.getSpacing('MD')};
      }

      .modal {
        position: relative;
        width: ${width};
        max-height: 90vh;
        background: white;
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        role: dialog;
        aria-modal: true;
      }

      .modal-small {
        width: ${sizeMap.small};
      }

      .modal-medium {
        width: ${sizeMap.medium};
      }

      .modal-large {
        width: ${sizeMap.large};
      }

      .modal-fullscreen {
        width: 100%;
        height: 100%;
        max-height: 100vh;
        border-radius: 0;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: ${themeManager.getSpacing('LG')};
        border-bottom: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
      }

      .modal-title {
        font-size: ${themeManager.getFontSize('LG')};
        font-weight: 600;
        color: ${themeManager.getColor('TEXT') || '#333'};
        margin: 0;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }

      .modal-close:hover {
        color: ${themeManager.getColor('TEXT') || '#333'};
      }

      .modal-body {
        flex: 1;
        padding: ${themeManager.getSpacing('LG')};
        overflow-y: auto;
        color: ${themeManager.getColor('TEXT') || '#333'};
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: ${themeManager.getSpacing('MD')};
        padding: ${themeManager.getSpacing('LG')};
        border-top: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>

      ${this.state.backdrop ? '<div class="modal-backdrop"></div>' : ''}

      <div class="modal-container">
        <div class="modal modal-${this.state.size}" role="dialog" aria-modal="true">
          ${
            this.state.modalTitle
              ? `
            <div class="modal-header">
              <h2 class="modal-title">${this.state.modalTitle}</h2>
              <button class="modal-close" aria-label="Close modal">×</button>
            </div>
          `
              : `
            <div class="modal-header" style="justify-content: flex-end;">
              <button class="modal-close" aria-label="Close modal">×</button>
            </div>
          `
          }
          <div class="modal-body">
            <slot name="content"></slot>
          </div>
          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }
}

customElements.define('ui-modal', UiModal);

declare global {
  interface HTMLElementTagNameMap {
    'ui-modal': UiModal;
  }
}

export { UiModal };
