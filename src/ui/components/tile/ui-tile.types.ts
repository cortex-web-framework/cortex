export interface TileState {
  imageUrl?: string;
  title: string;
  description?: string;
  href?: string;
}

export interface ITileElement extends HTMLElement {
  imageUrl?: string;
  title: string;
  description?: string;
  href?: string;
}
