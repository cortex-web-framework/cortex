export interface CarouselItem {
  id?: string;
  src?: string;
  altText?: string;
  caption?: string;
}

export interface CarouselState {
  items: CarouselItem[];
  currentIndex: number;
  autoPlay: boolean;
  interval: number;
  showControls: boolean;
}

export interface ICarouselElement extends HTMLElement {
  items: CarouselItem[];
  currentIndex: number;
  autoPlay: boolean;
  interval: number;
  showControls: boolean;
  next(): void;
  prev(): void;
  goTo(index: number): void;
}
