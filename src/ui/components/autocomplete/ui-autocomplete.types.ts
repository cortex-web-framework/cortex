export interface AutocompleteOption {
  label: string;
  value: string;
  description?: string;
}

export interface IAutocompleteElement extends HTMLElement {
  options: AutocompleteOption[];
  value: string | null;
  placeholder: string;
  label?: string;
  name: string;
  required: boolean;
  disabled: boolean;
  minChars: number;
  maxResults: number;
  readonly validationMessage: string;
  focus(): void;
  blur(): void;
  checkValidity(): boolean;
  reset(): void;
  search(query: string): void;
}

export interface AutocompleteState {
  options: AutocompleteOption[];
  value: string | null;
  placeholder: string;
  label?: string;
  name: string;
  required: boolean;
  disabled: boolean;
  minChars: number;
  maxResults: number;
  isOpen: boolean;
  searchQuery: string;
  filteredOptions: AutocompleteOption[];
  highlightedIndex: number;
  isValid: boolean;
}
