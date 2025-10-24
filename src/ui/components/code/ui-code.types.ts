export type CodeLanguage = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json' | 'bash' | 'sql' | 'yaml' | 'xml' | 'plaintext';

export interface CodeState {
  code?: string;
  language: CodeLanguage;
  showLineNumbers: boolean;
  copyable: boolean;
}

export interface ICodeElement extends HTMLElement {
  code?: string;
  language: CodeLanguage;
  showLineNumbers: boolean;
  copyable: boolean;
  copy(): void;
}
