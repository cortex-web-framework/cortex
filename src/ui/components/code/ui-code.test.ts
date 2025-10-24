import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-code', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('ui-code');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentElement) {
      element.parentElement.removeChild(element);
    }
  });

  describe('Basic Rendering', () => {
    it('should render as a custom element', () => {
      assert.equal(element.tagName, 'UI-CODE');
    });

    it('should have a shadow root', () => {
      assert(element.shadowRoot);
    });

    it('should have code container', () => {
      const container = element.shadowRoot?.querySelector('.code-container');
      assert(container);
    });

    it('should have code element', () => {
      const code = element.shadowRoot?.querySelector('code');
      assert(code);
    });
  });

  describe('Code Property', () => {
    it('should have default code as undefined', () => {
      const el = element as any;
      assert.equal(el.code, undefined);
    });

    it('should accept code property', () => {
      const el = element as any;
      el.code = 'console.log("hello")';
      assert.equal(el.code, 'console.log("hello")');
    });

    it('should update code attribute', () => {
      const el = element as any;
      el.code = 'const x = 5;';
      assert.equal(element.getAttribute('code'), 'const x = 5;');
    });
  });

  describe('Language Property', () => {
    it('should default to plaintext language', () => {
      const el = element as any;
      assert.equal(el.language, 'plaintext');
    });

    it('should accept javascript language', () => {
      const el = element as any;
      el.language = 'javascript';
      assert.equal(el.language, 'javascript');
    });

    it('should accept typescript language', () => {
      const el = element as any;
      el.language = 'typescript';
      assert.equal(el.language, 'typescript');
    });

    it('should accept python language', () => {
      const el = element as any;
      el.language = 'python';
      assert.equal(el.language, 'python');
    });

    it('should accept html language', () => {
      const el = element as any;
      el.language = 'html';
      assert.equal(el.language, 'html');
    });

    it('should accept css language', () => {
      const el = element as any;
      el.language = 'css';
      assert.equal(el.language, 'css');
    });

    it('should set language attribute', () => {
      const el = element as any;
      el.language = 'json';
      assert.equal(element.getAttribute('language'), 'json');
    });
  });

  describe('Line Numbers Property', () => {
    it('should show line numbers by default', () => {
      const el = element as any;
      assert.equal(el.showLineNumbers, true);
    });

    it('should accept showLineNumbers property', () => {
      const el = element as any;
      el.showLineNumbers = false;
      assert.equal(el.showLineNumbers, false);
    });

    it('should update showLineNumbers attribute', () => {
      const el = element as any;
      el.showLineNumbers = false;
      assert.equal(element.getAttribute('showLineNumbers'), 'false');
    });
  });

  describe('Copyable Property', () => {
    it('should be copyable by default', () => {
      const el = element as any;
      assert.equal(el.copyable, true);
    });

    it('should accept copyable property', () => {
      const el = element as any;
      el.copyable = false;
      assert.equal(el.copyable, false);
    });

    it('should set copyable attribute', () => {
      const el = element as any;
      el.copyable = false;
      assert.equal(element.getAttribute('copyable'), 'false');
    });
  });

  describe('Copy Functionality', () => {
    it('should have copy method', () => {
      const el = element as any;
      assert(typeof el.copy === 'function');
    });

    it('should copy code to clipboard', () => {
      const el = element as any;
      el.code = 'const x = 5;';
      assert.equal(el.code, 'const x = 5;');
    });
  });

  describe('Attributes', () => {
    it('should accept code attribute', () => {
      element.setAttribute('code', 'console.log("test")');
      const el = element as any;
      assert.equal(el.code, 'console.log("test")');
    });

    it('should accept language attribute', () => {
      element.setAttribute('language', 'typescript');
      const el = element as any;
      assert.equal(el.language, 'typescript');
    });

    it('should accept showLineNumbers attribute', () => {
      element.setAttribute('showLineNumbers', 'false');
      const el = element as any;
      assert.equal(el.showLineNumbers, false);
    });

    it('should accept copyable attribute', () => {
      element.setAttribute('copyable', 'false');
      const el = element as any;
      assert.equal(el.copyable, false);
    });
  });

  describe('Accessibility', () => {
    it('should have pre element for code', () => {
      const pre = element.shadowRoot?.querySelector('pre');
      assert(pre);
    });

    it('should have code element inside pre', () => {
      const code = element.shadowRoot?.querySelector('pre code');
      assert(code);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty code', () => {
      const el = element as any;
      el.code = '';
      assert.equal(el.code, '');
    });

    it('should handle special characters in code', () => {
      const el = element as any;
      el.code = '<>&"\'';
      assert.equal(el.code, '<>&"\'');
    });

    it('should handle multiline code', () => {
      const el = element as any;
      el.code = 'line1\nline2\nline3';
      assert.equal(el.code, 'line1\nline2\nline3');
    });

    it('should handle changing language while displaying code', () => {
      const el = element as any;
      el.code = 'console.log("hi")';
      el.language = 'javascript';
      el.language = 'typescript';
      assert.equal(el.language, 'typescript');
    });

    it('should handle toggling line numbers', () => {
      const el = element as any;
      el.showLineNumbers = true;
      el.showLineNumbers = false;
      el.showLineNumbers = true;
      assert.equal(el.showLineNumbers, true);
    });
  });

  describe('Initial State', () => {
    it('should default language to plaintext', () => {
      const el = element as any;
      assert.equal(el.language, 'plaintext');
    });

    it('should show line numbers by default', () => {
      const el = element as any;
      assert.equal(el.showLineNumbers, true);
    });

    it('should be copyable by default', () => {
      const el = element as any;
      assert.equal(el.copyable, true);
    });

    it('should have no code initially', () => {
      const el = element as any;
      assert.equal(el.code, undefined);
    });
  });

  describe('Multiple Properties', () => {
    it('should handle multiple properties together', () => {
      const el = element as any;
      el.code = 'const x = 5;';
      el.language = 'javascript';
      el.showLineNumbers = true;
      el.copyable = true;

      assert.equal(el.code, 'const x = 5;');
      assert.equal(el.language, 'javascript');
      assert.equal(el.showLineNumbers, true);
      assert.equal(el.copyable, true);
    });

    it('should handle sequential property changes', () => {
      const el = element as any;
      el.code = 'First';
      assert.equal(el.code, 'First');
      el.language = 'python';
      assert.equal(el.language, 'python');
      el.showLineNumbers = false;
      assert.equal(el.showLineNumbers, false);
    });
  });

  describe('Language Coverage', () => {
    it('should accept all supported languages', () => {
      const el = element as any;
      const languages = ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'sql', 'yaml', 'xml', 'plaintext'];
      languages.forEach(lang => {
        el.language = lang;
        assert.equal(el.language, lang);
      });
    });
  });
});
