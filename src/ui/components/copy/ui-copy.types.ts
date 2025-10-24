export interface CopyState { text?: string; copied: boolean; }
export interface ICopyElement extends HTMLElement { text?: string; copied: boolean; copy(): void; }
