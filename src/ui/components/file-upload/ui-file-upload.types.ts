export interface FileUploadOption {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  file: File;
}

export interface FileUploadState {
  files: FileUploadOption[];
  maxFiles: number;
  maxSize: number;
  accept: string;
  multiple: boolean;
  disabled: boolean;
  dragOver: boolean;
  isValid: boolean;
}

export interface IFileUploadElement extends HTMLElement {
  files: FileUploadOption[];
  maxFiles: number;
  maxSize: number;
  accept: string;
  multiple: boolean;
  disabled: boolean;
  readonly validationMessage: string;
  focus(): void;
  blur(): void;
  checkValidity(): boolean;
  reset(): void;
  removeFile(index: number): void;
  clearFiles(): void;
}
