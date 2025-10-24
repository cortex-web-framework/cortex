export type ChipVariant = 'default' | 'outlined' | 'filled';

export interface ChipState {
  label: string;
  variant: ChipVariant;
  removable: boolean;
  disabled: boolean;
  selected: boolean;
}

export interface IChipElement extends HTMLElement {
  label: string;
  variant: ChipVariant;
  removable: boolean;
  disabled: boolean;
  selected: boolean;
}
