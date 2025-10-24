/**
 * File Manager - Integrated Example
 * Combines: tree (directory structure), search (file lookup), dropdown (file actions)
 * NO external dependencies - pure TypeScript
 */

export class FileManager extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private fileSystem = [
    {
      id: 'root',
      label: 'My Computer',
      icon: '💻',
      children: [
        {
          id: 'documents',
          label: 'Documents',
          icon: '📁',
          children: [
            { id: 'doc1', label: 'Resume.pdf', icon: '📄' },
            { id: 'doc2', label: 'CoverLetter.docx', icon: '📄' },
            { id: 'doc3', label: 'ProjectProposal.xlsx', icon: '📊' },
          ],
        },
        {
          id: 'downloads',
          label: 'Downloads',
          icon: '📁',
          children: [
            { id: 'dl1', label: 'installer.exe', icon: '⚙️' },
            { id: 'dl2', label: 'image.zip', icon: '📦' },
          ],
        },
        {
          id: 'projects',
          label: 'Projects',
          icon: '📁',
          children: [
            {
              id: 'project1',
              label: 'WebApp',
              icon: '📁',
              children: [
                { id: 'src', label: 'src', icon: '📁' },
                { id: 'package', label: 'package.json', icon: '📋' },
              ],
            },
            { id: 'project2', label: 'MobileApp', icon: '📁' },
          ],
        },
        {
          id: 'pictures',
          label: 'Pictures',
          icon: '📁',
          children: [
            { id: 'pic1', label: 'vacation.jpg', icon: '🖼️' },
            { id: 'pic2', label: 'family.png', icon: '🖼️' },
          ],
        },
      ],
    },
  ];

  private selectedFile: string | null = null;
  private searchTerm: string = '';

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  private render() {
    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f5f7fa;
          color: #333;
        }

        .file-manager {
          min-height: 100vh;
          padding: 2rem;
        }

        .header {
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .toolbar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-wrapper {
          flex: 1;
          min-width: 250px;
        }

        .main-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
        }

        .sidebar {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          height: fit-content;
        }

        .sidebar h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1rem;
          color: #667eea;
        }

        .content {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .content h2 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.2rem;
          color: #1a1a1a;
        }

        .file-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .file-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.15s;
          margin-bottom: 0.5rem;
          gap: 0.75rem;
        }

        .file-item:hover {
          background: #f9f9f9;
        }

        .file-item.selected {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .file-icon {
          font-size: 1.2rem;
          min-width: 24px;
        }

        .file-name {
          flex: 1;
          font-size: 0.9rem;
        }

        .file-size {
          font-size: 0.8rem;
          color: #999;
          min-width: 60px;
          text-align: right;
        }

        .action-dropdown {
          min-width: 200px;
        }

        .info-panel {
          background: #f9f9f9;
          border-radius: 4px;
          padding: 1rem;
          margin-top: 1.5rem;
          border-left: 4px solid #667eea;
        }

        .info-panel h4 {
          margin-top: 0;
          color: #667eea;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.9rem;
        }

        .info-label {
          color: #666;
        }

        .info-value {
          font-weight: 500;
          color: #333;
        }

        .empty-state {
          padding: 3rem 1rem;
          text-align: center;
          color: #999;
        }

        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 1024px) {
          .main-container {
            grid-template-columns: 1fr;
          }

          .toolbar {
            flex-direction: column;
          }

          .search-wrapper {
            min-width: 100%;
          }
        }
      </style>

      <div class="file-manager">
        <div class="header">
          <h1>📂 File Manager</h1>
          <p>Browse and manage your files and folders</p>
        </div>

        <div class="toolbar">
          <div class="search-wrapper">
            <ui-search id="file-search" placeholder="Search files..."></ui-search>
          </div>
          <div class="action-dropdown">
            <ui-dropdown id="file-actions" data-selected-text="File Actions">
              <div data-option data-value="new-folder">New Folder</div>
              <div data-option data-value="upload">Upload File</div>
              <div data-option data-value="refresh">Refresh</div>
            </ui-dropdown>
          </div>
        </div>

        <div class="main-container">
          <div class="sidebar">
            <h3>Directories</h3>
            <ui-tree id="file-tree"></ui-tree>
          </div>

          <div class="content">
            <h2 data-current-path>My Computer</h2>
            <ul class="file-list" data-file-list></ul>
            <div class="info-panel" data-info-panel style="display: none;">
              <h4>File Information</h4>
              <div class="info-item">
                <span class="info-label">Name:</span>
                <span class="info-value" data-info-name></span>
              </div>
              <div class="info-item">
                <span class="info-label">Type:</span>
                <span class="info-value" data-info-type></span>
              </div>
              <div class="info-item">
                <span class="info-label">Size:</span>
                <span class="info-value" data-info-size></span>
              </div>
              <div class="info-item">
                <span class="info-label">Modified:</span>
                <span class="info-value" data-info-modified></span>
              </div>
            </div>
            <div class="empty-state" data-empty-state style="display: none;">
              <div class="empty-state-icon">📭</div>
              <p>No files in this directory</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.initializeTree();
    this.renderFileList();
  }

  private initializeTree() {
    const tree = this._shadowRoot.getElementById('file-tree') as any;
    if (tree) {
      tree.setNodes(this.fileSystem);
    }
  }

  private renderFileList() {
    const fileList = this._shadowRoot.querySelector('[data-file-list]') as HTMLElement;
    const emptyState = this._shadowRoot.querySelector('[data-empty-state]') as HTMLElement;

    if (!fileList) return;

    const currentNode = this.selectedFile ? this.findNode(this.fileSystem, this.selectedFile) : this.fileSystem[0];
    const files = currentNode?.children || [];

    if (files.length === 0) {
      fileList.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    fileList.innerHTML = files
      .map((file) => {
        const isSelected = file.id === this.selectedFile ? 'selected' : '';
        const size = Math.random() * 100;

        return `
          <li class="file-item ${isSelected}" data-file-id="${file.id}">
            <span class="file-icon">${file.icon}</span>
            <span class="file-name">${file.label}</span>
            <span class="file-size">${size.toFixed(0)} KB</span>
          </li>
        `;
      })
      .join('');
  }

  private findNode(nodes: any[], id: string): any {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  private setupEventListeners() {
    const tree = this._shadowRoot.getElementById('file-tree') as any;
    if (tree) {
      tree.addEventListener('select', (e: any) => {
        this.selectedFile = e.detail.nodeId;
        const pathLabel = this._shadowRoot.querySelector('[data-current-path]');
        if (pathLabel) {
          const node = this.findNode(this.fileSystem, this.selectedFile);
          pathLabel.textContent = node?.label || 'My Computer';
        }
        this.renderFileList();
      });
    }

    const search = this._shadowRoot.querySelector('ui-search') as any;
    if (search) {
      const allFiles = this.getAllFiles(this.fileSystem);
      search.setItems(allFiles.map((f) => f.label));

      search.addEventListener('select', (e: any) => {
        const file = allFiles.find((f) => f.label === e.detail.value);
        if (file) {
          this.selectedFile = file.id;
          this.renderFileList();
        }
      });
    }

    const fileList = this._shadowRoot.querySelector('[data-file-list]');
    if (fileList) {
      fileList.addEventListener('click', (e: any) => {
        const item = (e.target as HTMLElement).closest('[data-file-id]');
        if (item) {
          const fileId = item.getAttribute('data-file-id');
          this.selectedFile = fileId;
          this.renderFileList();
          this.showFileInfo(fileId);
        }
      });
    }

    const actions = this._shadowRoot.getElementById('file-actions') as any;
    if (actions) {
      actions.addEventListener('change', (e: any) => {
        switch (e.detail.value) {
          case 'new-folder':
            console.log('Creating new folder...');
            break;
          case 'upload':
            console.log('Opening file upload...');
            break;
          case 'refresh':
            this.renderFileList();
            break;
        }
      });
    }
  }

  private getAllFiles(nodes: any[]): any[] {
    let files: any[] = [];
    for (const node of nodes) {
      files.push(node);
      if (node.children) {
        files = files.concat(this.getAllFiles(node.children));
      }
    }
    return files;
  }

  private showFileInfo(fileId: string) {
    const node = this.findNode(this.fileSystem, fileId);
    if (!node) return;

    const infoPanel = this._shadowRoot.querySelector('[data-info-panel]');
    if (infoPanel) {
      infoPanel.style.display = 'block';

      const infoName = this._shadowRoot.querySelector('[data-info-name]');
      const infoType = this._shadowRoot.querySelector('[data-info-type]');
      const infoSize = this._shadowRoot.querySelector('[data-info-size]');
      const infoModified = this._shadowRoot.querySelector('[data-info-modified]');

      if (infoName) infoName.textContent = node.label;
      if (infoType) infoType.textContent = node.children ? 'Folder' : 'File';
      if (infoSize) infoSize.textContent = `${Math.random() * 100}.5 MB`;
      if (infoModified) infoModified.textContent = new Date().toLocaleDateString();
    }
  }
}

// Register the custom element
if (!customElements.get('ui-file-manager')) {
  customElements.define('ui-file-manager', FileManager);
}
