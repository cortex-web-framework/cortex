export interface ResultState { type?: 'success' | 'error' | 'warning' | 'info'; resultTitle?: string; description?: string; }
export interface IResultElement extends HTMLElement { type?: 'success' | 'error' | 'warning' | 'info'; resultTitle?: string; description?: string; }
