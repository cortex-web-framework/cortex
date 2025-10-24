/**
 * Tree Component with Expandable Nodes and Selection
 * NO external dependencies - pure TypeScript
 */

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: string;
  disabled?: boolean;
}

export class TreeComponent extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private nodes: TreeNode[] = [];
  private expandedNodes: Set<string> = new Set();
  private selectedNode: string | null = null;
  private allowMultiSelect: boolean = false;
  private selectedNodes: Set<string> = new Set();

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    this.setupEventListeners();
  }

  private parseAttributes() {
    const dataAttr = this.getAttribute('data-nodes');
    if (dataAttr) {
      try {
        this.nodes = JSON.parse(dataAttr);
      } catch {
        console.error('Invalid JSON in data-nodes attribute');
      }
    }

    this.allowMultiSelect = this.hasAttribute('multi-select');
  }

  private render() {
    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #333;
        }

        .tree-container {
          padding: 0.5rem 0;
        }

        .tree-node {
          user-select: none;
        }

        .node-content {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          transition: background 0.15s;
          border-radius: 4px;
          gap: 0.5rem;
        }

        .node-content:hover {
          background: #f5f5f5;
        }

        .node-content.selected {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .node-content.disabled {
          cursor: not-allowed;
          color: #ccc;
          opacity: 0.6;
        }

        .node-content.disabled:hover {
          background: transparent;
        }

        .node-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          cursor: pointer;
          color: #666;
          font-size: 0.9rem;
          user-select: none;
          flex-shrink: 0;
        }

        .node-toggle.placeholder {
          visibility: hidden;
        }

        .node-toggle.has-children {
          visibility: visible;
          color: #667eea;
          transition: transform 0.2s;
        }

        .node-toggle.has-children.expanded {
          transform: rotate(90deg);
        }

        .node-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .node-label {
          flex: 1;
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .node-children {
          display: none;
          margin-left: 1.5rem;
        }

        .node-children.visible {
          display: block;
        }

        .tree-empty {
          padding: 2rem 1rem;
          text-align: center;
          color: #999;
          font-size: 0.9rem;
        }

        @media (max-width: 640px) {
          .node-content {
            padding: 0.4rem 0.5rem;
            font-size: 0.9rem;
          }

          .node-children {
            margin-left: 1rem;
          }
        }
      </style>

      <div class="tree-container" data-tree-root></div>
    `;

    this.renderNodes();
  }

  private renderNodes() {
    const container = this._shadowRoot.querySelector('[data-tree-root]') as HTMLElement;

    if (!this.nodes || this.nodes.length === 0) {
      container.innerHTML = '<div class="tree-empty">No items to display</div>';
      return;
    }

    container.innerHTML = this.nodes.map((node) => this.renderNode(node, 0)).join('');
  }

  private renderNode(node: TreeNode, depth: number): string {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = this.expandedNodes.has(node.id);
    const isSelected = this.selectedNodes.has(node.id) || this.selectedNode === node.id;
    const isDisabled = node.disabled === true;

    const toggleClass = hasChildren
      ? `node-toggle has-children ${isExpanded ? 'expanded' : ''}`
      : 'node-toggle placeholder';

    const contentClass = `node-content ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`;
    const icon = node.icon ? `<div class="node-icon">${node.icon}</div>` : '';
    const childrenHtml = hasChildren
      ? `<div class="node-children ${isExpanded ? 'visible' : ''}" data-children="${node.id}">
           ${node.children!.map((child) => this.renderNode(child, depth + 1)).join('')}
         </div>`
      : '';

    return `
      <div class="tree-node" data-node-id="${node.id}">
        <div class="${contentClass}" data-node-content="${node.id}" ${isDisabled ? 'data-disabled' : ''}>
          <div class="${toggleClass}" data-toggle="${node.id}">▶</div>
          ${icon}
          <div class="node-label">${this.escapeHtml(node.label)}</div>
        </div>
        ${childrenHtml}
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private setupEventListeners() {
    const container = this._shadowRoot.querySelector('[data-tree-root]') as HTMLElement;

    // Node click handler
    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Toggle handler
      if (target.hasAttribute('data-toggle')) {
        const nodeId = target.getAttribute('data-toggle')!;
        this.toggleNode(nodeId);
        return;
      }

      // Content click handler
      const contentElement = target.closest('[data-node-content]');
      if (contentElement) {
        const nodeId = contentElement.getAttribute('data-node-content')!;
        if (!contentElement.hasAttribute('data-disabled')) {
          this.selectNodeInternal(nodeId);
        }
      }
    });

    // Keyboard navigation
    container.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement;
      if (target.hasAttribute('data-node-content')) {
        this.handleKeyboard(e as KeyboardEvent, target);
      }
    });
  }

  private handleKeyboard(e: KeyboardEvent, element: HTMLElement) {
    const nodeId = element.getAttribute('data-node-content')!;

    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault();
        const node = this.findNode(this.nodes, nodeId);
        if (node && node.children && node.children.length > 0) {
          if (!this.expandedNodes.has(nodeId)) {
            this.toggleNode(nodeId);
          }
        }
        break;
      }

      case 'ArrowLeft': {
        e.preventDefault();
        const node = this.findNode(this.nodes, nodeId);
        if (node && node.children && node.children.length > 0) {
          if (this.expandedNodes.has(nodeId)) {
            this.toggleNode(nodeId);
          }
        }
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        const nextNode = this.getNextNode(nodeId);
        if (nextNode) {
          this.focusNode(nextNode);
        }
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        const prevNode = this.getPreviousNode(nodeId);
        if (prevNode) {
          this.focusNode(prevNode);
        }
        break;
      }

      case 'Enter':
      case ' ': {
        e.preventDefault();
        this.selectNodeInternal(nodeId);
        break;
      }
    }
  }

  private findNode(nodes: TreeNode[], id: string): TreeNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  private getNextNode(currentId: string): string | null {
    const allNodeIds = this.getAllNodeIds(this.nodes, this.expandedNodes);
    const currentIndex = allNodeIds.indexOf(currentId);
    if (currentIndex >= 0 && currentIndex < allNodeIds.length - 1) {
      return allNodeIds[currentIndex + 1];
    }
    return null;
  }

  private getPreviousNode(currentId: string): string | null {
    const allNodeIds = this.getAllNodeIds(this.nodes, this.expandedNodes);
    const currentIndex = allNodeIds.indexOf(currentId);
    if (currentIndex > 0) {
      return allNodeIds[currentIndex - 1];
    }
    return null;
  }

  private getAllNodeIds(nodes: TreeNode[], expanded: Set<string>): string[] {
    const ids: string[] = [];
    for (const node of nodes) {
      ids.push(node.id);
      if (expanded.has(node.id) && node.children) {
        ids.push(...this.getAllNodeIds(node.children, expanded));
      }
    }
    return ids;
  }

  private focusNode(nodeId: string) {
    const element = this._shadowRoot.querySelector(`[data-node-content="${nodeId}"]`) as HTMLElement;
    if (element) {
      element.focus();
    }
  }

  private toggleNode(nodeId: string) {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }

    this.renderNodes();
    this.setupEventListeners();
    this.emitToggleEvent(nodeId, this.expandedNodes.has(nodeId));
  }

  private selectNodeInternal(nodeId: string) {
    if (!this.allowMultiSelect) {
      this.selectedNodes.clear();
      this.selectedNode = nodeId;
    } else {
      if (this.selectedNodes.has(nodeId)) {
        this.selectedNodes.delete(nodeId);
      } else {
        this.selectedNodes.add(nodeId);
      }
    }

    this.renderNodes();
    this.setupEventListeners();
    this.emitSelectEvent(nodeId);
  }

  private emitToggleEvent(nodeId: string, isExpanded: boolean) {
    this.dispatchEvent(
      new CustomEvent('toggle', {
        detail: { nodeId, isExpanded },
        bubbles: true,
        composed: true,
      })
    );
  }

  private emitSelectEvent(nodeId: string) {
    const node = this.findNode(this.nodes, nodeId);
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: {
          nodeId,
          node,
          selectedNodes: Array.from(this.selectedNodes),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public API
  setNodes(nodes: TreeNode[]) {
    this.nodes = nodes;
    this.expandedNodes.clear();
    this.selectedNodes.clear();
    this.selectedNode = null;
    this.renderNodes();
    this.setupEventListeners();
  }

  getNodes(): TreeNode[] {
    return this.nodes;
  }

  expandNode(nodeId: string) {
    if (!this.expandedNodes.has(nodeId)) {
      this.expandedNodes.add(nodeId);
      this.renderNodes();
      this.setupEventListeners();
    }
  }

  collapseNode(nodeId: string) {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
      this.renderNodes();
      this.setupEventListeners();
    }
  }

  expandAll() {
    const allNodeIds = this.getAllNodeIds(this.nodes, new Set());
    allNodeIds.forEach((id) => {
      const node = this.findNode(this.nodes, id);
      if (node && node.children && node.children.length > 0) {
        this.expandedNodes.add(id);
      }
    });
    this.renderNodes();
    this.setupEventListeners();
  }

  collapseAll() {
    this.expandedNodes.clear();
    this.renderNodes();
    this.setupEventListeners();
  }

  getExpandedNodes(): string[] {
    return Array.from(this.expandedNodes);
  }

  setExpandedNodes(nodeIds: string[]) {
    this.expandedNodes = new Set(nodeIds);
    this.renderNodes();
    this.setupEventListeners();
  }

  getSelectedNode(): string | null {
    return this.selectedNode;
  }

  getSelectedNodes(): string[] {
    return Array.from(this.selectedNodes);
  }

  selectNode(nodeId: string) {
    this.selectedNode = nodeId;
    if (!this.allowMultiSelect) {
      this.selectedNodes.clear();
    }
    this.selectedNodes.add(nodeId);
    this.renderNodes();
    this.setupEventListeners();
  }

  clearSelection() {
    this.selectedNode = null;
    this.selectedNodes.clear();
    this.renderNodes();
    this.setupEventListeners();
  }

  isExpanded(nodeId: string): boolean {
    return this.expandedNodes.has(nodeId);
  }

  isSelected(nodeId: string): boolean {
    return this.selectedNodes.has(nodeId) || this.selectedNode === nodeId;
  }

  findNodeById(nodeId: string): TreeNode | null {
    return this.findNode(this.nodes, nodeId);
  }

  getNodePath(nodeId: string): string[] {
    const path: string[] = [];

    const traverse = (nodes: TreeNode[], targetId: string): boolean => {
      for (const node of nodes) {
        if (node.id === targetId) {
          path.push(node.id);
          return true;
        }
        if (node.children) {
          if (traverse(node.children, targetId)) {
            path.unshift(node.id);
            return true;
          }
        }
      }
      return false;
    };

    traverse(this.nodes, nodeId);
    return path;
  }

  focus() {
    const firstNode = this._shadowRoot.querySelector('[data-node-content]') as HTMLElement;
    if (firstNode) {
      firstNode.focus();
    }
  }
}

// Register the custom element
if (!customElements.get('ui-tree')) {
  customElements.define('ui-tree', TreeComponent);
}
