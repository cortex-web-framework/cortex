/**
 * ui-file-upload: A file upload component with drag-and-drop support.
 */

import { IFileUploadElement, FileUploadState, FileUploadOption } from './ui-file-upload.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiFileUpload extends HTMLElement implements IFileUploadElement {
  private shadowRootInternal: ShadowRoot;
  private inputElement: HTMLInputElement | null = null;

  private state: FileUploadState = {
    files: [],
    maxFiles: 1,
    maxSize: 10485760, // 10MB default
    accept: '',
    multiple: false,
    disabled: false,
    dragOver: false,
    isValid: true,
  };

  static get observedAttributes(): string[] {
    return ['maxFiles', 'maxSize', 'accept', 'multiple', 'disabled'];
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
      case 'maxFiles':
        this.state.maxFiles = newValue ? parseInt(newValue, 10) : 1;
        break;
      case 'maxSize':
        this.state.maxSize = newValue ? parseInt(newValue, 10) : 10485760;
        break;
      case 'accept':
        this.state.accept = newValue ?? '';
        break;
      case 'multiple':
        this.state.multiple = newValue !== null;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
    }

    this.render();
  }

  get files(): FileUploadOption[] {
    return this.state.files;
  }

  set files(val: FileUploadOption[]) {
    this.state.files = val;
    this.render();

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { files: val },
        bubbles: true,
        composed: true,
      })
    );
  }

  get maxFiles(): number {
    return this.state.maxFiles;
  }

  set maxFiles(val: number) {
    this.state.maxFiles = val;
    this.setAttribute('maxFiles', String(val));
  }

  get maxSize(): number {
    return this.state.maxSize;
  }

  set maxSize(val: number) {
    this.state.maxSize = val;
    this.setAttribute('maxSize', String(val));
  }

  get accept(): string {
    return this.state.accept;
  }

  set accept(val: string) {
    this.state.accept = val;
    this.setAttribute('accept', val);
    this.render();
  }

  get multiple(): boolean {
    return this.state.multiple;
  }

  set multiple(val: boolean) {
    this.state.multiple = val;
    if (val) {
      this.setAttribute('multiple', '');
    } else {
      this.removeAttribute('multiple');
    }
    this.render();
  }

  get disabled(): boolean {
    return this.state.disabled;
  }

  set disabled(val: boolean) {
    this.state.disabled = val;
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
    this.render();
  }

  get validationMessage(): string {
    if (this.state.isValid) return '';
    if (this.state.files.length === 0) {
      return 'At least one file is required.';
    }
    if (this.state.files.length > this.state.maxFiles) {
      return `Maximum ${this.state.maxFiles} file(s) allowed.`;
    }
    return 'Invalid file selection.';
  }

  focus(): void {
    this.inputElement?.focus();
  }

  blur(): void {
    this.inputElement?.blur();
  }

  checkValidity(): boolean {
    this.validate();
    return this.state.isValid;
  }

  reset(): void {
    this.state.files = [];
    if (this.inputElement) {
      this.inputElement.value = '';
    }
    this.render();
  }

  removeFile(index: number): void {
    if (index >= 0 && index < this.state.files.length) {
      this.state.files.splice(index, 1);
      this.render();

      this.dispatchEvent(
        new CustomEvent('fileRemoved', {
          detail: { index, files: this.state.files },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  clearFiles(): void {
    this.state.files = [];
    if (this.inputElement) {
      this.inputElement.value = '';
    }
    this.render();
  }

  private validate(): void {
    if (this.state.files.length === 0 || this.state.files.length <= this.state.maxFiles) {
      this.state.isValid = true;
    } else {
      this.state.isValid = false;
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  private setupEventListeners(): void {
    if (!this.inputElement) return;

    this.inputElement.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      this.handleFileSelection(target.files);
    });

    const dropZone = this.shadowRootInternal.querySelector('.drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.state.dragOver = true;
        this.render();
      });

      dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.state.dragOver = false;
        this.render();
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.state.dragOver = false;
        const files = (e as DragEvent).dataTransfer?.files;
        this.handleFileSelection(files);
      });

      // Click to open file picker
      dropZone.addEventListener('click', () => {
        this.inputElement?.click();
      });
    }
  }

  private handleFileSelection(fileList: FileList | null | undefined): void {
    if (!fileList) return;

    const newFiles: FileUploadOption[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Check file size
      if (file.size > this.state.maxSize) {
        this.dispatchEvent(
          new CustomEvent('error', {
            detail: {
              error: `File "${file.name}" exceeds maximum size of ${this.formatFileSize(this.state.maxSize)}`,
            },
            bubbles: true,
            composed: true,
          })
        );
        continue;
      }

      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        file: file,
      });
    }

    // Check max files
    const totalFiles = this.state.multiple ? newFiles : newFiles.slice(0, 1);

    if (!this.state.multiple && totalFiles.length > 1) {
      this.state.files = totalFiles.slice(0, 1);
    } else if (this.state.multiple) {
      if (this.state.files.length + totalFiles.length > this.state.maxFiles) {
        this.dispatchEvent(
          new CustomEvent('error', {
            detail: {
              error: `Maximum ${this.state.maxFiles} file(s) allowed`,
            },
            bubbles: true,
            composed: true,
          })
        );
        return;
      }
      this.state.files = [...this.state.files, ...totalFiles];
    } else {
      this.state.files = totalFiles;
    }

    this.state.dragOver = false;
    this.render();

    this.dispatchEvent(
      new CustomEvent('upload', {
        detail: { files: this.state.files },
        bubbles: true,
        composed: true,
      })
    );
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
      }

      .file-upload-wrapper {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('MD')};
      }

      .drop-zone {
        padding: ${themeManager.getSpacing('XL')};
        border: 2px dashed ${themeManager.getColor('BORDER') || '#ddd'};
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        background: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f9f9f9'};
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        user-select: none;
      }

      .drop-zone:hover {
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
        background: ${themeManager.getColor('PRIMARY_LIGHT') || '#e7f3ff'};
      }

      .drop-zone.drag-over {
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
        background: ${themeManager.getColor('PRIMARY_LIGHT') || '#e7f3ff'};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
      }

      .drop-zone:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .drop-zone-content {
        pointer-events: none;
      }

      .drop-zone-icon {
        font-size: 32px;
        margin-bottom: ${themeManager.getSpacing('SM')};
      }

      .drop-zone-text {
        font-size: ${themeManager.getFontSize('MD')};
        font-weight: 500;
        color: ${themeManager.getColor('TEXT') || '#333'};
        margin-bottom: ${themeManager.getSpacing('XS')};
      }

      .drop-zone-hint {
        font-size: ${themeManager.getFontSize('SM')};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
      }

      input[type="file"] {
        display: none;
      }

      .file-list {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('SM')};
      }

      .file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: ${themeManager.getSpacing('MD')};
        background: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f5f5f5'};
        border-radius: ${themeManager.getBorderRadius('SM') || '2px'};
        border-left: 4px solid ${themeManager.getColor('PRIMARY') || '#007bff'};
      }

      .file-info {
        flex: 1;
        min-width: 0;
      }

      .file-name {
        font-weight: 500;
        color: ${themeManager.getColor('TEXT') || '#333'};
        word-break: break-word;
        margin-bottom: 2px;
      }

      .file-size {
        font-size: ${themeManager.getFontSize('XS')};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
      }

      .file-remove {
        padding: ${themeManager.getSpacing('SM')};
        background: none;
        border: none;
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
        cursor: pointer;
        font-size: 18px;
        flex-shrink: 0;
        margin-left: ${themeManager.getSpacing('MD')};
        transition: opacity 0.2s;
      }

      .file-remove:hover {
        opacity: 0.7;
      }

      .error-message {
        font-size: ${themeManager.getFontSize('SM')};
        color: ${themeManager.getColor('DANGER') || '#dc3545'};
        padding: ${themeManager.getSpacing('SM')};
        background: rgba(220, 53, 69, 0.1);
        border-radius: ${themeManager.getBorderRadius('SM') || '2px'};
      }

      :host([disabled]) .drop-zone {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const fileListHtml = this.state.files
      .map(
        (file, index) => `
        <div class="file-item">
          <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-size">${this.formatFileSize(file.size)}</div>
          </div>
          <button class="file-remove" data-index="${index}" title="Remove file">×</button>
        </div>
      `
      )
      .join('');

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="file-upload-wrapper">
        <div class="drop-zone ${this.state.dragOver ? 'drag-over' : ''}" ${this.state.disabled ? 'disabled' : ''}>
          <div class="drop-zone-content">
            <div class="drop-zone-icon">📁</div>
            <div class="drop-zone-text">Drag and drop files here</div>
            <div class="drop-zone-hint">or click to select</div>
          </div>
        </div>

        <input
          type="file"
          ${this.state.accept ? `accept="${this.state.accept}"` : ''}
          ${this.state.multiple ? 'multiple' : ''}
          ${this.state.disabled ? 'disabled' : ''}
        >

        ${
          this.state.files.length > 0
            ? `
          <div class="file-list">
            ${fileListHtml}
          </div>
        `
            : ''
        }

        ${!this.state.isValid ? `<div class="error-message">${this.validationMessage}</div>` : ''}
      </div>
    `;

    this.inputElement = this.shadowRootInternal.querySelector('input[type="file"]');
    this.setupEventListeners();

    // Setup remove buttons
    const removeButtons = this.shadowRootInternal.querySelectorAll('.file-remove');
    removeButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt((btn as HTMLElement).getAttribute('data-index') || '0', 10);
        this.removeFile(index);
      });
    });
  }
}

customElements.define('ui-file-upload', UiFileUpload);

declare global {
  interface HTMLElementTagNameMap {
    'ui-file-upload': UiFileUpload;
  }
}

export { UiFileUpload };
