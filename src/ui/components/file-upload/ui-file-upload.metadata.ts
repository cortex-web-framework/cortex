import { ComponentMetadata } from '../../metadata.js';

export const uiFileUploadMetadata: ComponentMetadata = {
  tag: 'ui-file-upload',
  name: 'File Upload',
  category: 'Advanced Input',
  description:
    'A file upload component with drag-and-drop support, file size validation, and multiple file handling. Provides visual feedback and comprehensive file management features. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'files',
      type: 'FileUploadOption[]',
      default: '[]',
      description: 'Array of uploaded files with metadata (name, size, type, lastModified, file)',
      isAttribute: false,
    },
    {
      name: 'maxFiles',
      type: 'number',
      default: '1',
      description: 'Maximum number of files allowed',
      isAttribute: true,
    },
    {
      name: 'maxSize',
      type: 'number',
      default: '10485760',
      description: 'Maximum file size in bytes (default 10MB)',
      isAttribute: true,
    },
    {
      name: 'accept',
      type: 'string',
      default: '""',
      description: 'Accepted file types (e.g., ".pdf,.doc" or "image/*")',
      isAttribute: true,
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: false,
      description: 'Allow multiple file selection',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false,
      description: 'Disable file upload',
      isAttribute: true,
    },
  ],
  events: [
    {
      name: 'change',
      detail: 'CustomEvent<{ files: FileUploadOption[] }>',
      description: 'Emitted when files list changes',
    },
    {
      name: 'upload',
      detail: 'CustomEvent<{ files: FileUploadOption[] }>',
      description: 'Emitted when files are successfully uploaded',
    },
    {
      name: 'error',
      detail: 'CustomEvent<{ error: string }>',
      description: 'Emitted when file validation fails',
    },
    {
      name: 'fileRemoved',
      detail: 'CustomEvent<{ index: number, files: FileUploadOption[] }>',
      description: 'Emitted when a file is removed from the list',
    },
  ],
  slots: [],
  cssProps: [
    {
      name: '--ui-file-upload-border-color',
      description: 'Border color of the drop zone',
      default: 'var(--ui-color-border, #ddd)',
    },
    {
      name: '--ui-file-upload-hover-color',
      description: 'Border color on hover',
      default: 'var(--ui-color-primary, #007bff)',
    },
    {
      name: '--ui-file-upload-bg',
      description: 'Background color of the drop zone',
      default: 'var(--ui-color-background-light, #f9f9f9)',
    },
  ],
  examples: [
    {
      title: 'Basic File Upload',
      code: `<ui-file-upload></ui-file-upload>`,
      description: 'Simple single file upload with drag-and-drop',
    },
    {
      title: 'Multiple File Upload',
      code: `<ui-file-upload multiple maxFiles="5"></ui-file-upload>`,
      description: 'Allow up to 5 files to be uploaded',
    },
    {
      title: 'Image Upload',
      code: `<ui-file-upload accept="image/*" maxSize="5242880"></ui-file-upload>`,
      description: 'Upload images only, max 5MB each',
    },
    {
      title: 'Document Upload',
      code: `<ui-file-upload accept=".pdf,.doc,.docx" maxFiles="3" maxSize="10485760"></ui-file-upload>`,
      description: 'Upload PDF or Word documents, up to 3 files, 10MB max each',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-file-upload',
};
