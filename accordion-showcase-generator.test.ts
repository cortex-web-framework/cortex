/**
 * TDD Test for Accordion Showcase Generator
 * Zero Dependencies - Super Clean Code - Strict TypeScript
 */

import './browser-env';
import { test } from './test-framework';
import { AccordionShowcaseGenerator, accordionShowcaseGenerator } from './accordion-showcase-generator';

class AccordionShowcaseGeneratorTest {
  runTests(): void {
    test.describe('Accordion Showcase Generator', () => {
      test.it('should generate basic showcase HTML', () => {
        const generator = new AccordionShowcaseGenerator();
        const html = generator.generateBasicShowcase();
        
        test.expect(html).toContain('ui-accordion');
        test.expect(html).toContain('First Item');
        test.expect(html).toContain('Second Item');
        test.expect(html).toContain('Third Item');
        test.expect(html).toContain('data-disabled="true"');
        test.expect(html).toContain('component-card');
      });

      test.it('should generate multiple showcase HTML', () => {
        const generator = new AccordionShowcaseGenerator();
        const html = generator.generateMultipleShowcase();
        
        test.expect(html).toContain('ui-accordion');
        test.expect(html).toContain('allowMultiple');
        test.expect(html).toContain('Multiple Item 1');
        test.expect(html).toContain('Multiple Item 2');
        test.expect(html).toContain('Multiple Item 3');
      });

      test.it('should generate disabled showcase HTML', () => {
        const generator = new AccordionShowcaseGenerator();
        const html = generator.generateDisabledShowcase();
        
        test.expect(html).toContain('ui-accordion');
        test.expect(html).toContain('disabled');
        test.expect(html).toContain('Disabled Item 1');
        test.expect(html).toContain('Disabled Item 2');
      });

      test.it('should generate all showcases HTML', () => {
        const generator = new AccordionShowcaseGenerator();
        const html = generator.generateAllShowcases();
        
        test.expect(html).toContain('ui-accordion');
        test.expect(html).toContain('First Item');
        test.expect(html).toContain('Multiple Item 1');
        test.expect(html).toContain('Disabled Item 1');
      });

      test.it('should generate documentation HTML with section title', () => {
        const generator = new AccordionShowcaseGenerator();
        const html = generator.generateDocumentationHTML();
        
        test.expect(html).toContain('section-title');
        test.expect(html).toContain('Accordion & Collapsible');
        test.expect(html).toContain('ui-accordion');
      });

      test.it('should escape HTML content properly', () => {
        const generator = new AccordionShowcaseGenerator();
        const customConfig = {
          basic: {
            title: 'Test <script>alert("xss")</script>',
            description: 'Test description',
            items: [
              {
                id: 'test1',
                label: 'Test <b>Bold</b> Item',
                content: 'Content with <script>alert("xss")</script>',
                disabled: false
              }
            ],
            allowMultiple: false,
            disabled: false
          },
          multiple: {
            title: 'Multiple',
            description: 'Multiple items',
            items: [],
            allowMultiple: true,
            disabled: false
          },
          disabled: {
            title: 'Disabled',
            description: 'Disabled accordion',
            items: [],
            allowMultiple: false,
            disabled: true
          }
        };
        
        const customGenerator = new AccordionShowcaseGenerator(customConfig);
        const html = customGenerator.generateBasicShowcase();
        
        const assertion1 = test.expect(html);
        assertion1.toBeTruthy();
        
        const assertion2 = test.expect(html);
        assertion2.toContain('Test &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        
        const assertion3 = test.expect(html);
        assertion3.toContain('Test &lt;b&gt;Bold&lt;/b&gt; Item');
        
        const assertion4 = test.expect(html);
        assertion4.toContain('Content with &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
        
        const assertion5 = test.expect(html);
        assertion5.not.toContain('<script>');
      });

      test.it('should handle empty items array', () => {
        const generator = new AccordionShowcaseGenerator();
        const customConfig = {
          basic: {
            title: 'Empty Accordion',
            description: 'Accordion with no items',
            items: [],
            allowMultiple: false,
            disabled: false
          },
          multiple: {
            title: 'Multiple',
            description: 'Multiple items',
            items: [],
            allowMultiple: true,
            disabled: false
          },
          disabled: {
            title: 'Disabled',
            description: 'Disabled accordion',
            items: [],
            allowMultiple: false,
            disabled: true
          }
        };
        
        const customGenerator = new AccordionShowcaseGenerator(customConfig);
        const html = customGenerator.generateBasicShowcase();
        
        const assertion1 = test.expect(html);
        assertion1.toBeTruthy();
        
        const assertion2 = test.expect(html);
        assertion2.toContain('ui-accordion');
        
        const assertion3 = test.expect(html);
        assertion3.toContain('Empty Accordion');
        
        const assertion4 = test.expect(html);
        assertion4.not.toContain('slot="item"');
      });

      test.it('should export default instance', () => {
        test.expect(accordionShowcaseGenerator).toBeTruthy();
        test.expect(accordionShowcaseGenerator.constructor.name).toBe('AccordionShowcaseGenerator');
      });
    });
  }
}

// Run the tests
const generatorTest = new AccordionShowcaseGeneratorTest();
generatorTest.runTests();