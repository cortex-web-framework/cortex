export interface ModalState {
  isOpen: boolean;
  modalTitle?: string;
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnEscape: boolean;
  closeOnBackdrop: boolean;
  backdrop: boolean;
}

export interface IModalElement extends HTMLElement {
  isOpen: boolean;
  modalTitle?: string;
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnEscape: boolean;
  closeOnBackdrop: boolean;
  backdrop: boolean;
  open(): void;
  close(): void;
  toggle(): void;
}
