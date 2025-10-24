/**
 * TDD Test for Component Registry Implementation
 * Zero Dependencies - Super Clean Code - Strict TypeScript
 */

import './browser-env';
import { test } from './test-framework';
import { ComponentRegistryManager, componentRegistry, type ComponentInfo, type ComponentCategory } from './component-registry';

class ComponentRegistryImplementationTest {
  runTests(): void {
    test.describe('Component Registry Implementation', () => {
      test.it('should return correct registry structure', () => {
        const registry = ComponentRegistryManager.getRegistry();
        
        test.expect(registry).toBeTruthy();
        test.expect(registry.components).toBeTruthy();
        test.expect(registry.totalCount).toBe(53);
        test.expect(registry.categories).toBeTruthy();
        test.expect(registry.version).toBe('1.0.0');
      });

      test.it('should have all 53 components defined', () => {
        const registry = ComponentRegistryManager.getRegistry();
        
        test.expect(registry.components.length).toBe(53);
        test.expect(registry.totalCount).toBe(53);
      });

      test.it('should have correct component structure', () => {
        const registry = ComponentRegistryManager.getRegistry();
        const firstComponent = registry.components[0];
        
        test.expect(firstComponent.name).toBeTruthy();
        test.expect(firstComponent.tagName).toBeTruthy();
        test.expect(firstComponent.category).toBeTruthy();
        test.expect(firstComponent.description).toBeTruthy();
        test.expect(typeof firstComponent.implemented).toBe('boolean');
        test.expect(firstComponent.version).toBeTruthy();
        test.expect(Array.isArray(firstComponent.dependencies)).toBe(true);
        test.expect(Array.isArray(firstComponent.props)).toBe(true);
        test.expect(Array.isArray(firstComponent.events)).toBe(true);
      });

      test.it('should find components by name', () => {
        const buttonComponent = ComponentRegistryManager.getComponent('button');
        
        test.expect(buttonComponent).toBeTruthy();
        test.expect(buttonComponent?.name).toBe('button');
        test.expect(buttonComponent?.tagName).toBe('ui-button');
        test.expect(buttonComponent?.category).toBe('Buttons & Selection');
      });

      test.it('should return undefined for non-existent component', () => {
        const nonExistentComponent = ComponentRegistryManager.getComponent('non-existent');
        
        test.expect(nonExistentComponent).toBeUndefined();
      });

      test.it('should get components by category', () => {
        const buttonComponents = ComponentRegistryManager.getComponentsByCategory('Buttons & Selection');
        
        test.expect(buttonComponents.length).toBeGreaterThan(0);
        buttonComponents.forEach(component => {
          test.expect(component.category).toBe('Buttons & Selection');
        });
      });

      test.it('should get implemented components only', () => {
        const implementedComponents = ComponentRegistryManager.getImplementedComponents();
        
        test.expect(implementedComponents.length).toBe(53);
        implementedComponents.forEach(component => {
          test.expect(component.implemented).toBe(true);
        });
      });

      test.it('should return correct component count', () => {
        const count = ComponentRegistryManager.getComponentCount();
        
        test.expect(count).toBe(53);
      });

      test.it('should return category counts', () => {
        const categoryCounts = ComponentRegistryManager.getCategoryCounts();
        
        test.expect(categoryCounts['Buttons & Selection']).toBeGreaterThan(0);
        test.expect(categoryCounts['Text Inputs & Forms']).toBeGreaterThan(0);
        test.expect(categoryCounts['Display & Feedback']).toBeGreaterThan(0);
        test.expect(categoryCounts['Navigation']).toBeGreaterThan(0);
        test.expect(categoryCounts['Layout & Structure']).toBeGreaterThan(0);
        test.expect(categoryCounts['Data Display']).toBeGreaterThan(0);
        test.expect(categoryCounts['Overlays & Interactions']).toBeGreaterThan(0);
        test.expect(categoryCounts['Utilities & Special']).toBeGreaterThan(0);
      });

      test.it('should validate component names', () => {
        test.expect(ComponentRegistryManager.validateComponent('button')).toBe(true);
        test.expect(ComponentRegistryManager.validateComponent('accordion')).toBe(true);
        test.expect(ComponentRegistryManager.validateComponent('non-existent')).toBe(false);
      });

      test.it('should return component dependencies', () => {
        const buttonDeps = ComponentRegistryManager.getComponentDependencies('button');
        const accordionDeps = ComponentRegistryManager.getComponentDependencies('accordion');
        
        test.expect(Array.isArray(buttonDeps)).toBe(true);
        test.expect(Array.isArray(accordionDeps)).toBe(true);
        test.expect(buttonDeps.length).toBe(0);
        test.expect(accordionDeps.length).toBe(0);
      });

      test.it('should return component props', () => {
        const buttonProps = ComponentRegistryManager.getComponentProps('button');
        const accordionProps = ComponentRegistryManager.getComponentProps('accordion');
        
        test.expect(Array.isArray(buttonProps)).toBe(true);
        test.expect(Array.isArray(accordionProps)).toBe(true);
        test.expect(buttonProps.length).toBeGreaterThan(0);
        test.expect(accordionProps.length).toBeGreaterThan(0);
        test.expect(buttonProps).toContain('variant');
        test.expect(buttonProps).toContain('size');
        test.expect(accordionProps).toContain('allowMultiple');
        test.expect(accordionProps).toContain('disabled');
      });

      test.it('should return component events', () => {
        const buttonEvents = ComponentRegistryManager.getComponentEvents('button');
        const accordionEvents = ComponentRegistryManager.getComponentEvents('accordion');
        
        test.expect(Array.isArray(buttonEvents)).toBe(true);
        test.expect(Array.isArray(accordionEvents)).toBe(true);
        test.expect(buttonEvents).toContain('click');
        test.expect(accordionEvents).toContain('itemOpened');
        test.expect(accordionEvents).toContain('itemClosed');
      });

      test.it('should have unique component names', () => {
        const registry = ComponentRegistryManager.getRegistry();
        const names = registry.components.map(c => c.name);
        const uniqueNames = new Set(names);
        
        test.expect(names.length).toBe(uniqueNames.size);
      });

      test.it('should have unique tag names', () => {
        const registry = ComponentRegistryManager.getRegistry();
        const tagNames = registry.components.map(c => c.tagName);
        const uniqueTagNames = new Set(tagNames);
        
        test.expect(tagNames.length).toBe(uniqueTagNames.size);
      });

      test.it('should have proper tag name format', () => {
        const registry = ComponentRegistryManager.getRegistry();
        
        registry.components.forEach(component => {
          test.expect(component.tagName).toMatch(/^ui-[a-z]+(-[a-z]+)*$/);
        });
      });

      test.it('should have valid categories', () => {
        const registry = ComponentRegistryManager.getRegistry();
        const validCategories = [
          'Buttons & Selection',
          'Text Inputs & Forms',
          'Display & Feedback',
          'Navigation',
          'Layout & Structure',
          'Data Display',
          'Overlays & Interactions',
          'Utilities & Special'
        ];
        
        registry.components.forEach(component => {
          test.expect(validCategories).toContain(component.category);
        });
      });

      test.it('should have meaningful descriptions', () => {
        const registry = ComponentRegistryManager.getRegistry();
        
        registry.components.forEach(component => {
          test.expect(component.description.length).toBeGreaterThan(10);
          test.expect(component.description).not.toContain('undefined');
          test.expect(component.description).not.toContain('null');
        });
      });

      test.it('should export registry instance', () => {
        test.expect(componentRegistry).toBeTruthy();
        test.expect(componentRegistry.totalCount).toBe(53);
        test.expect(componentRegistry.components.length).toBe(53);
      });

      test.it('should have correct version', () => {
        const registry = ComponentRegistryManager.getRegistry();
        
        test.expect(registry.version).toBe('1.0.0');
      });

      test.it('should have all components implemented', () => {
        const registry = ComponentRegistryManager.getRegistry();
        
        registry.components.forEach(component => {
          test.expect(component.implemented).toBe(true);
        });
      });

      test.it('should have consistent version numbers', () => {
        const registry = ComponentRegistryManager.getRegistry();
        
        registry.components.forEach(component => {
          test.expect(component.version).toBe('1.0.0');
        });
      });
    });
  }
}

// Run the tests
const implementationTest = new ComponentRegistryImplementationTest();
implementationTest.runTests();