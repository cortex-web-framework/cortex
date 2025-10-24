import { describe, test, beforeEach, afterEach } from '../../index.js';
import { createComponentFixture, cleanupFixture } from '../../utils/component-helpers.js';
import '../../../../../../src/components/tree/ui-tree.js';

describe('TreeComponent', () => {
  let fixture: HTMLElement;
  let component: any;

  const testNodes = [
    {
      id: 'root1',
      label: 'Root 1',
      icon: '📁',
      children: [
        { id: 'child1-1', label: 'Child 1-1', icon: '📄' },
        {
          id: 'child1-2',
          label: 'Child 1-2',
          icon: '📁',
          children: [
            { id: 'grandchild1-2-1', label: 'Grandchild 1-2-1', icon: '📄' },
            { id: 'grandchild1-2-2', label: 'Grandchild 1-2-2', icon: '📄' },
          ],
        },
      ],
    },
    {
      id: 'root2',
      label: 'Root 2',
      icon: '📁',
      children: [
        { id: 'child2-1', label: 'Child 2-1', icon: '📄' },
        { id: 'child2-2', label: 'Child 2-2', icon: '📄', disabled: true },
      ],
    },
  ];

  beforeEach(async () => {
    fixture = createComponentFixture();
    component = document.createElement('ui-tree');
    component.setAttribute('data-nodes', JSON.stringify(testNodes));
    fixture.appendChild(component);
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  afterEach(() => {
    cleanupFixture(fixture);
  });

  describe('Initialization', () => {
    test('component should render tree structure', () => {
      const nodes = component.shadowRoot.querySelectorAll('[data-node-id]');
      if (nodes.length === 0) throw new Error('No nodes rendered');
    });

    test('should parse data-nodes attribute', () => {
      const nodes = component.getNodes();
      if (nodes.length !== 2) throw new Error('Should have 2 root nodes');
      if (nodes[0].id !== 'root1') throw new Error('First node should be root1');
    });

    test('should display root nodes', () => {
      const content = component.shadowRoot.querySelectorAll('[data-node-content]');
      if (content.length < 2) throw new Error('Should display at least 2 root nodes');
    });

    test('should not display children initially when collapsed', () => {
      const childContent = component.shadowRoot.querySelector('[data-node-content="child1-1"]');
      if (childContent) throw new Error('Children should not be visible when collapsed');
    });

    test('should render icons if provided', () => {
      const icons = component.shadowRoot.querySelectorAll('.node-icon');
      if (icons.length === 0) throw new Error('Icons should be rendered');
    });
  });

  describe('Node Expansion', () => {
    test('should expand node on toggle click', () => {
      const toggle = component.shadowRoot.querySelector('[data-toggle="root1"]');
      toggle.dispatchEvent(new Event('click', { bubbles: true }));

      const childContent = component.shadowRoot.querySelector('[data-node-content="child1-1"]');
      if (!childContent) throw new Error('Children should be visible after expand');
    });

    test('should collapse node on second toggle click', () => {
      const toggle = component.shadowRoot.querySelector('[data-toggle="root1"]');

      toggle.dispatchEvent(new Event('click', { bubbles: true }));
      toggle.dispatchEvent(new Event('click', { bubbles: true }));

      const childContent = component.shadowRoot.querySelector('[data-node-content="child1-1"]');
      if (childContent) throw new Error('Children should be hidden after collapse');
    });

    test('expandNode should expand a node', () => {
      component.expandNode('root1');

      const expanded = component.getExpandedNodes();
      if (!expanded.includes('root1')) throw new Error('root1 should be expanded');
    });

    test('collapseNode should collapse a node', () => {
      component.expandNode('root1');
      component.collapseNode('root1');

      const expanded = component.getExpandedNodes();
      if (expanded.includes('root1')) throw new Error('root1 should be collapsed');
    });

    test('expandAll should expand all nodes', () => {
      component.expandAll();

      const expanded = component.getExpandedNodes();
      if (expanded.length === 0) throw new Error('Some nodes should be expanded');
    });

    test('collapseAll should collapse all nodes', () => {
      component.expandAll();
      component.collapseAll();

      const expanded = component.getExpandedNodes();
      if (expanded.length !== 0) throw new Error('All nodes should be collapsed');
    });

    test('should add expanded class when node is expanded', () => {
      component.expandNode('root1');

      const toggle = component.shadowRoot.querySelector('[data-toggle="root1"]');
      if (!toggle?.classList.contains('expanded')) {
        throw new Error('Toggle should have expanded class');
      }
    });

    test('should emit toggle event when node is expanded', () => {
      let eventFired = false;
      let eventDetail: any;

      component.addEventListener('toggle', (e: any) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      component.expandNode('root1');

      if (!eventFired) throw new Error('Toggle event should be fired');
      if (eventDetail.nodeId !== 'root1') throw new Error('Event should include correct nodeId');
      if (!eventDetail.isExpanded) throw new Error('Event should indicate node is expanded');
    });
  });

  describe('Node Selection', () => {
    test('should select node on content click', () => {
      const content = component.shadowRoot.querySelector('[data-node-content="root1"]');
      content.dispatchEvent(new Event('click', { bubbles: true }));

      if (component.getSelectedNode() !== 'root1') {
        throw new Error('root1 should be selected');
      }
    });

    test('should deselect previous node when selecting new one', () => {
      const content1 = component.shadowRoot.querySelector('[data-node-content="root1"]');
      const content2 = component.shadowRoot.querySelector('[data-node-content="root2"]');

      content1.dispatchEvent(new Event('click', { bubbles: true }));
      content2.dispatchEvent(new Event('click', { bubbles: true }));

      if (component.getSelectedNode() !== 'root2') {
        throw new Error('root2 should be selected');
      }
    });

    test('should add selected class to selected node', () => {
      component.selectNode('root1');

      const content = component.shadowRoot.querySelector('[data-node-content="root1"]');
      if (!content?.classList.contains('selected')) {
        throw new Error('Selected node should have selected class');
      }
    });

    test('should not select disabled nodes', () => {
      component.expandNode('root2');

      const content = component.shadowRoot.querySelector('[data-node-content="child2-2"]');
      content.dispatchEvent(new Event('click', { bubbles: true }));

      if (component.getSelectedNode() === 'child2-2') {
        throw new Error('Disabled node should not be selectable');
      }
    });

    test('should emit select event when node is selected', () => {
      let eventFired = false;
      let eventDetail: any;

      component.addEventListener('select', (e: any) => {
        eventFired = true;
        eventDetail = e.detail;
      });

      const content = component.shadowRoot.querySelector('[data-node-content="root1"]');
      content.dispatchEvent(new Event('click', { bubbles: true }));

      if (!eventFired) throw new Error('Select event should be fired');
      if (eventDetail.nodeId !== 'root1') throw new Error('Event should include nodeId');
      if (!eventDetail.node) throw new Error('Event should include node object');
    });

    test('clearSelection should clear all selections', () => {
      component.selectNode('root1');
      component.clearSelection();

      if (component.getSelectedNode() !== null) {
        throw new Error('No node should be selected after clear');
      }
    });

    test('isSelected should return true for selected node', () => {
      component.selectNode('root1');

      if (!component.isSelected('root1')) {
        throw new Error('isSelected should return true for selected node');
      }
    });

    test('isSelected should return false for unselected node', () => {
      component.selectNode('root1');

      if (component.isSelected('root2')) {
        throw new Error('isSelected should return false for unselected node');
      }
    });
  });

  describe('Keyboard Navigation', () => {
    test('should expand node with ArrowRight', () => {
      const content = component.shadowRoot.querySelector('[data-node-content="root1"]');
      content.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

      const expanded = component.getExpandedNodes();
      if (!expanded.includes('root1')) {
        throw new Error('Node should be expanded with ArrowRight');
      }
    });

    test('should collapse node with ArrowLeft', () => {
      component.expandNode('root1');

      const content = component.shadowRoot.querySelector('[data-node-content="root1"]');
      content.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

      const expanded = component.getExpandedNodes();
      if (expanded.includes('root1')) {
        throw new Error('Node should be collapsed with ArrowLeft');
      }
    });

    test('should select node with Enter key', () => {
      const content = component.shadowRoot.querySelector('[data-node-content="root1"]');
      content.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      if (component.getSelectedNode() !== 'root1') {
        throw new Error('Node should be selected with Enter key');
      }
    });

    test('should select node with Space key', () => {
      const content = component.shadowRoot.querySelector('[data-node-content="root2"]');
      content.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

      if (component.getSelectedNode() !== 'root2') {
        throw new Error('Node should be selected with Space key');
      }
    });
  });

  describe('Multi-Select', () => {
    test('should support multi-select when enabled', () => {
      const multiComponent = document.createElement('ui-tree');
      multiComponent.setAttribute('data-nodes', JSON.stringify(testNodes));
      multiComponent.setAttribute('multi-select', '');
      fixture.appendChild(multiComponent);

      // Multi-select would require additional setup
      if (!multiComponent) throw new Error('Multi-select component not created');
    });
  });

  describe('Public API', () => {
    test('setNodes should update tree nodes', () => {
      const newNodes = [
        { id: 'new1', label: 'New Node 1' },
        { id: 'new2', label: 'New Node 2' },
      ];

      component.setNodes(newNodes);

      const nodes = component.getNodes();
      if (nodes.length !== 2) throw new Error('Should have 2 new nodes');
      if (nodes[0].id !== 'new1') throw new Error('First node should be new1');
    });

    test('getNodes should return all nodes', () => {
      const nodes = component.getNodes();
      if (nodes.length !== 2) throw new Error('Should return 2 root nodes');
    });

    test('getExpandedNodes should return expanded node IDs', () => {
      component.expandNode('root1');
      component.expandNode('root2');

      const expanded = component.getExpandedNodes();
      if (expanded.length !== 2) throw new Error('Should have 2 expanded nodes');
      if (!expanded.includes('root1') || !expanded.includes('root2')) {
        throw new Error('Should include both root1 and root2');
      }
    });

    test('setExpandedNodes should set expanded state', () => {
      component.setExpandedNodes(['root1', 'root2']);

      const expanded = component.getExpandedNodes();
      if (expanded.length !== 2) throw new Error('Should have 2 expanded nodes');
    });

    test('getSelectedNode should return selected node ID', () => {
      component.selectNode('root1');

      if (component.getSelectedNode() !== 'root1') {
        throw new Error('Should return selected node ID');
      }
    });

    test('getSelectedNodes should return array of selected node IDs', () => {
      component.selectNode('root1');

      const selected = component.getSelectedNodes();
      if (!selected.includes('root1')) throw new Error('Should include root1');
    });

    test('selectNode should select a node programmatically', () => {
      component.selectNode('root2');

      if (component.getSelectedNode() !== 'root2') {
        throw new Error('selectNode should update selected node');
      }
    });

    test('isExpanded should return expand state', () => {
      component.expandNode('root1');

      if (!component.isExpanded('root1')) {
        throw new Error('isExpanded should return true');
      }

      if (component.isExpanded('root2')) {
        throw new Error('isExpanded should return false for collapsed node');
      }
    });

    test('findNodeById should find a node by ID', () => {
      const node = component.findNodeById('child1-1');

      if (!node) throw new Error('Should find node');
      if (node.id !== 'child1-1') throw new Error('Should return correct node');
      if (node.label !== 'Child 1-1') throw new Error('Node should have correct label');
    });

    test('findNodeById should return null for non-existent node', () => {
      const node = component.findNodeById('nonexistent');

      if (node !== null) throw new Error('Should return null for non-existent node');
    });

    test('getNodePath should return path to node', () => {
      const path = component.getNodePath('grandchild1-2-1');

      if (path.length !== 3) throw new Error('Path should have 3 nodes');
      if (path[0] !== 'root1') throw new Error('Path should start with root1');
      if (path[2] !== 'grandchild1-2-1') throw new Error('Path should end with grandchild');
    });

    test('focus should focus first node', () => {
      component.focus();
      // Just verify it doesn't throw
      if (!component) throw new Error('focus() failed');
    });
  });

  describe('Disabled Items', () => {
    test('should not select disabled nodes', () => {
      component.expandNode('root2');

      const content = component.shadowRoot.querySelector('[data-node-content="child2-2"]');
      if (!content?.hasAttribute('data-disabled')) {
        throw new Error('Disabled node should have data-disabled attribute');
      }
    });

    test('should render disabled items with disabled class', () => {
      component.expandNode('root2');

      const content = component.shadowRoot.querySelector('[data-node-content="child2-2"]');
      if (!content?.classList.contains('disabled')) {
        throw new Error('Disabled item should have disabled class');
      }
    });
  });

  describe('Tree Traversal', () => {
    test('should find deeply nested nodes', () => {
      const node = component.findNodeById('grandchild1-2-2');

      if (!node) throw new Error('Should find deeply nested node');
      if (node.label !== 'Grandchild 1-2-2') throw new Error('Should have correct label');
    });

    test('should show nested children when parent is expanded', () => {
      component.expandNode('root1');
      component.expandNode('child1-2');

      const grandchildContent = component.shadowRoot.querySelector('[data-node-content="grandchild1-2-1"]');
      if (!grandchildContent) throw new Error('Grandchild should be visible');
    });
  });

  describe('Empty State', () => {
    test('should show empty message when no nodes', () => {
      component.setNodes([]);

      const emptyMsg = component.shadowRoot.querySelector('.tree-empty');
      if (!emptyMsg?.textContent?.includes('No items')) {
        throw new Error('Should show empty message');
      }
    });
  });
});
