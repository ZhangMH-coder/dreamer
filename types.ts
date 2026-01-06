
export interface Wallpaper {
  id: string;
  url: string;
  title: string;
  tags: string[];
  author: string;
  isFavorite?: boolean;
  rotation?: number;
  focalPoint?: { x: number; y: number };
  views?: number;
}

export enum AppTab {
  DISCOVER = '发现',
  GALLERY = '我的收藏'
}

export interface GenerationConfig {
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}
