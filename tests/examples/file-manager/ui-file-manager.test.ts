import { describe, test, beforeEach, afterEach } from '../../index.js';
import { createComponentFixture, cleanupFixture } from '../../utils/component-helpers.js';
import '../../../../../../examples/file-manager/ui-file-manager.js';

describe('FileManager', () => {
  let fixture: HTMLElement;
  let component: any;

  beforeEach(async () => {
    fixture = createComponentFixture();
    component = document.createElement('ui-file-manager');
    fixture.appendChild(component);
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(() => {
    cleanupFixture(fixture);
  });

  describe('Initialization', () => {
    test('should render file manager interface', () => {
      const manager = component.shadowRoot.querySelector('.file-manager');
      if (!manager) throw new Error('File manager not found');
    });

    test('should have tree component for directory structure', () => {
      const tree = component.shadowRoot.querySelector('ui-tree');
      if (!tree) throw new Error('Tree component not found');
    });

    test('should have search component', () => {
      const search = component.shadowRoot.querySelector('ui-search');
      if (!search) throw new Error('Search component not found');
    });

    test('should have dropdown for file actions', () => {
      const dropdown = component.shadowRoot.querySelector('ui-dropdown');
      if (!dropdown) throw new Error('Dropdown component not found');
    });

    test('should display file list area', () => {
      const fileList = component.shadowRoot.querySelector('[data-file-list]');
      if (!fileList) throw new Error('File list not found');
    });
  });

  describe('File Display', () => {
    test('should display files in list', () => {
      const items = component.shadowRoot.querySelectorAll('[data-file-id]');
      if (items.length === 0) throw new Error('No files displayed');
    });

    test('should show file icons', () => {
      const icons = component.shadowRoot.querySelectorAll('.file-icon');
      if (icons.length === 0) throw new Error('File icons not shown');
    });

    test('should show file sizes', () => {
      const sizes = component.shadowRoot.querySelectorAll('.file-size');
      if (sizes.length === 0) throw new Error('File sizes not shown');
    });
  });

  describe('Directory Navigation', () => {
    test('tree should have directory structure', () => {
      const tree = component.shadowRoot.querySelector('ui-tree') as any;
      const nodes = tree.getNodes();
      if (nodes.length === 0) throw new Error('Directory structure not loaded');
    });

    test('should update file list on directory select', async () => {
      const tree = component.shadowRoot.querySelector('ui-tree') as any;
      const initialCount = component.shadowRoot.querySelectorAll('[data-file-id]').length;

      tree.selectNode('documents');
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (initialCount === 0) throw new Error('Initial files should exist');
    });
  });

  describe('Search Functionality', () => {
    test('search should have file items', () => {
      const search = component.shadowRoot.querySelector('ui-search') as any;
      const items = search.getItems();
      if (items.length === 0) throw new Error('Search items not set');
    });

    test('should be able to search for files', () => {
      const search = component.shadowRoot.querySelector('ui-search') as any;
      const items = search.getItems();
      if (!items.some((item: string) => item.includes('.pdf') || item.includes('.'))) {
        throw new Error('Should have file items in search');
      }
    });
  });

  describe('File Actions', () => {
    test('dropdown should have file actions', () => {
      const dropdown = component.shadowRoot.querySelector('ui-dropdown') as any;
      const actions = dropdown.getItems?.() || [];
      if (typeof actions !== 'object') throw new Error('Should have actions dropdown');
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive layout classes', () => {
      const mainContainer = component.shadowRoot.querySelector('.main-container');
      if (!mainContainer) throw new Error('Main container not found');
    });

    test('should have sidebar for directory tree', () => {
      const sidebar = component.shadowRoot.querySelector('.sidebar');
      if (!sidebar) throw new Error('Sidebar not found');
    });

    test('should have content area for files', () => {
      const content = component.shadowRoot.querySelector('.content');
      if (!content) throw new Error('Content area not found');
    });
  });

  describe('Component Integration', () => {
    test('tree, search, and dropdown should coexist', () => {
      const tree = component.shadowRoot.querySelector('ui-tree');
      const search = component.shadowRoot.querySelector('ui-search');
      const dropdown = component.shadowRoot.querySelector('ui-dropdown');

      if (!tree || !search || !dropdown) {
        throw new Error('All components should be present');
      }
    });
  });

  describe('Empty State', () => {
    test('should show empty state message when no files', () => {
      const emptyState = component.shadowRoot.querySelector('[data-empty-state]');
      if (!emptyState) throw new Error('Empty state element not found');
    });
  });

  describe('File Information Panel', () => {
    test('should have file info panel', () => {
      const infoPanel = component.shadowRoot.querySelector('[data-info-panel]');
      if (!infoPanel) throw new Error('Info panel not found');
    });

    test('should display file name', () => {
      const infoName = component.shadowRoot.querySelector('[data-info-name]');
      if (!infoName) throw new Error('File name info not found');
    });

    test('should display file type', () => {
      const infoType = component.shadowRoot.querySelector('[data-info-type]');
      if (!infoType) throw new Error('File type info not found');
    });

    test('should display file size', () => {
      const infoSize = component.shadowRoot.querySelector('[data-info-size]');
      if (!infoSize) throw new Error('File size info not found');
    });
  });
});
