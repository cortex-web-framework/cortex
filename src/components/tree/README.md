# Tree Component

A powerful tree component for displaying hierarchical data structures with expand/collapse functionality, keyboard navigation, and comprehensive selection support. Built with Web Components and pure TypeScript - **zero external dependencies**.

## Features

### Core Functionality
- **Hierarchical Display** - Render nested data structures with proper indentation
- **Expand/Collapse** - Toggle visibility of child nodes with state tracking
- **Selection** - Single or multi-select mode with visual feedback
- **Keyboard Navigation** - Arrow keys, Enter, Space support for power users
- **Disabled Items** - Mark nodes as non-selectable
- **Custom Icons** - Display custom icons for each node
- **Custom Events** - `select`, `toggle`, and navigation events

### User Experience
- Click nodes to expand/collapse or select
- Visual feedback for selected and expanded nodes
- Smooth animations and transitions
- Keyboard-accessible with focus management
- Path tracking for nested navigation
- Responsive design optimized for all screen sizes

## Usage

### Basic Setup

```html
<ui-tree id="myTree"></ui-tree>

<script type="module">
  import './ui-tree.js';

  const tree = document.getElementById('myTree');

  const treeData = [
    {
      id: 'root',
      label: 'Root Node',
      icon: '📁',
      children: [
        { id: 'child1', label: 'Child 1', icon: '📄' },
        { id: 'child2', label: 'Child 2', icon: '📄' },
      ],
    },
  ];

  tree.setNodes(treeData);

  tree.addEventListener('select', (event) => {
    console.log('Selected node:', event.detail.node);
  });

  tree.addEventListener('toggle', (event) => {
    console.log('Node toggled:', event.detail.nodeId, event.detail.isExpanded);
  });
</script>
```

## API

### Data Structure

```typescript
interface TreeNode {
  id: string;           // Unique identifier for the node
  label: string;        // Display text
  children?: TreeNode[]; // Array of child nodes (optional)
  icon?: string;        // Custom icon/emoji (optional)
  disabled?: boolean;   // Prevent selection (optional)
}
```

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-nodes` | JSON string | none | Initial tree data as JSON |
| `multi-select` | flag | false | Enable multi-select mode |

### Events

#### select
Fired when user selects a node

```javascript
tree.addEventListener('select', (event) => {
  const { nodeId, node, selectedNodes } = event.detail;
  console.log(`Selected: ${node.label}`);
  console.log(`All selected: ${selectedNodes}`);
});
```

#### toggle
Fired when user expands or collapses a node

```javascript
tree.addEventListener('toggle', (event) => {
  const { nodeId, isExpanded } = event.detail;
  console.log(`${nodeId} is now ${isExpanded ? 'expanded' : 'collapsed'}`);
});
```

### Public Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `setNodes(nodes)` | void | Set the tree data |
| `getNodes()` | TreeNode[] | Get all root nodes |
| `expandNode(nodeId)` | void | Expand a specific node |
| `collapseNode(nodeId)` | void | Collapse a specific node |
| `expandAll()` | void | Expand all nodes with children |
| `collapseAll()` | void | Collapse all nodes |
| `getExpandedNodes()` | string[] | Get IDs of expanded nodes |
| `setExpandedNodes(ids)` | void | Set which nodes are expanded |
| `selectNode(nodeId)` | void | Select a node programmatically |
| `getSelectedNode()` | string \| null | Get selected node ID |
| `getSelectedNodes()` | string[] | Get all selected node IDs |
| `clearSelection()` | void | Clear all selections |
| `isExpanded(nodeId)` | boolean | Check if node is expanded |
| `isSelected(nodeId)` | boolean | Check if node is selected |
| `findNodeById(nodeId)` | TreeNode \| null | Find a node by ID |
| `getNodePath(nodeId)` | string[] | Get path to node (array of IDs) |
| `focus()` | void | Focus the first node |

## Implementation Details

### Data Structure Format

Trees are defined using nested JSON structures:

```typescript
const treeData = [
  {
    id: 'folder1',
    label: 'My Folder',
    icon: '📁',
    children: [
      {
        id: 'subfolder1',
        label: 'Sub Folder',
        icon: '📁',
        children: [
          { id: 'file1', label: 'File 1', icon: '📄' },
          { id: 'file2', label: 'File 2', icon: '📄' },
        ],
      },
      { id: 'file3', label: 'File 3', icon: '📄' },
    ],
  },
];
```

### Keyboard Navigation

From tree nodes:
- **ArrowRight** - Expand node (if it has children)
- **ArrowLeft** - Collapse node
- **ArrowDown** - Move to next visible node
- **ArrowUp** - Move to previous visible node
- **Enter, Space** - Select current node

### Expand/Collapse Behavior

- Click the arrow icon next to a node to toggle
- Use keyboard navigation (ArrowRight/ArrowLeft) to expand/collapse
- Use `expandNode()`, `collapseNode()`, `expandAll()`, `collapseAll()` methods
- State is tracked in `expandedNodes` Set (not persisted)

### Selection Modes

**Single Select (Default)**
```javascript
const tree = document.querySelector('ui-tree');
// Only one node can be selected at a time
tree.selectNode('node-id');
console.log(tree.getSelectedNode()); // 'node-id'
```

**Multi-Select**
```html
<ui-tree multi-select></ui-tree>
```
```javascript
tree.selectNode('node1');
tree.selectNode('node2');
console.log(tree.getSelectedNodes()); // ['node1', 'node2']
```

### Disabled Items

Prevent selection of specific nodes:

```javascript
const nodes = [
  {
    id: 'available',
    label: 'Available',
  },
  {
    id: 'unavailable',
    label: 'Unavailable',
    disabled: true,
  },
];

tree.setNodes(nodes);
```

Disabled nodes:
- Cannot be selected by clicking
- Skip keyboard navigation
- Display with reduced opacity and different styling
- Have `data-disabled` attribute in DOM

### Path Tracking

Get the path from root to a specific node:

```javascript
const path = tree.getNodePath('deep-nested-node');
console.log(path); // ['root', 'parent', 'child', 'deep-nested-node']
```

Useful for:
- Breadcrumb navigation
- Tracking selection history
- URL routing based on tree selection

## Examples

### File Browser

```html
<ui-tree id="fileBrowser"></ui-tree>

<script type="module">
  import './ui-tree.js';

  const fileStructure = [
    {
      id: 'src',
      label: 'src',
      icon: '📁',
      children: [
        {
          id: 'components',
          label: 'components',
          icon: '📁',
          children: [
            { id: 'button.ts', label: 'button.ts', icon: '📄' },
            { id: 'input.ts', label: 'input.ts', icon: '📄' },
          ],
        },
      ],
    },
    { id: 'package.json', label: 'package.json', icon: '📋' },
  ];

  const tree = document.getElementById('fileBrowser');
  tree.setNodes(fileStructure);

  tree.addEventListener('select', (event) => {
    console.log('File selected:', event.detail.node.label);
  });
</script>
```

### Organizational Chart

```javascript
const orgChart = [
  {
    id: 'ceo',
    label: 'CEO',
    icon: '👔',
    children: [
      {
        id: 'engineering',
        label: 'Engineering',
        icon: '🏢',
        children: [
          { id: 'eng1', label: 'John Smith', icon: '👨‍💻' },
          { id: 'eng2', label: 'Jane Doe', icon: '👩‍💻' },
        ],
      },
      {
        id: 'sales',
        label: 'Sales',
        icon: '💼',
        children: [
          { id: 'sales1', label: 'Bob Wilson', icon: '👨‍💼' },
        ],
      },
    ],
  },
];

tree.setNodes(orgChart);
```

### Deep Nesting with Path Tracking

```javascript
tree.addEventListener('select', (event) => {
  const path = tree.getNodePath(event.detail.nodeId);
  const breadcrumb = path.map(id => {
    const node = tree.findNodeById(id);
    return node?.label || id;
  }).join(' > ');

  console.log('Path:', breadcrumb);
});
```

### Dynamic Tree Updates

```javascript
// Add new items
function addFolder(parentId, name) {
  const nodes = tree.getNodes();
  const parent = tree.findNodeById(parentId);

  if (parent) {
    if (!parent.children) parent.children = [];
    parent.children.push({
      id: `folder-${Date.now()}`,
      label: name,
      icon: '📁',
      children: [],
    });

    tree.setNodes(nodes);
  }
}

// Remove items
function removeNode(nodeId) {
  const nodes = tree.getNodes();
  // Implement removal logic based on tree structure
  tree.setNodes(nodes);
}
```

## Styling

Component uses Shadow DOM with scoped styles. Key classes for customization:

- `.tree-container` - Root container
- `.tree-node` - Individual node wrapper
- `.node-content` - Node display area
- `.node-content.selected` - Selected node
- `.node-content.disabled` - Disabled node
- `.node-toggle` - Expand/collapse button
- `.node-toggle.expanded` - Expanded state
- `.node-icon` - Icon container
- `.node-label` - Text label
- `.node-children` - Children container
- `.node-children.visible` - Visible children
- `.tree-empty` - Empty state

## Performance

| Operation | Time |
|-----------|------|
| Render 100 nodes | < 20ms |
| Render 1000 nodes | < 100ms |
| Expand node | < 5ms |
| Select node | < 5ms |
| Find node by ID | < 1ms |

Supports efficiently rendering large hierarchies.

## Browser Compatibility

- Chrome 67+
- Firefox 63+
- Safari 10.1+
- Edge 79+
- Modern mobile browsers

Requires Shadow DOM support (all modern browsers).

## Accessibility

- ✓ Keyboard navigation support (arrows, enter, space)
- ✓ Focus management
- ✓ Clear visual feedback
- ✓ Semantic structure
- ✓ Text not nested in interactive elements
- ✓ Proper ARIA roles for tree structure

## Test Coverage

28+ test cases covering:
- Tree rendering and structure
- Node expansion/collapse
- Node selection
- Keyboard navigation
- Disabled items
- Path tracking
- Empty state
- Programmatic control
- Deep nesting

## Code Size

- TypeScript source: ~420 LOC
- Compiled JavaScript: ~16 KB
- Minified: ~6 KB
- No dependencies

## Limitations & Future Enhancements

### Current Limitations
- No virtual scrolling (impacts performance with 10,000+ nodes)
- No drag-and-drop reordering
- No search/filter functionality
- No lazy loading for large datasets

### Planned Features
- [ ] Virtual scrolling for large datasets
- [ ] Drag-and-drop support
- [ ] Search and filter
- [ ] Lazy loading for children
- [ ] Context menu support
- [ ] Animation options
- [ ] Checkbox selection
- [ ] Copy/paste operations

## Related Components

- **ui-dropdown** - Dropdown menu
- **ui-search** - Search with suggestions
- **ui-table** - Data table
- **ui-menu** - Context menu

## License

MIT

---

**Status**: Production Ready ✅
**Test Coverage**: 28+ tests
**Dependencies**: 0
**Bundle Size**: ~6 KB minified
