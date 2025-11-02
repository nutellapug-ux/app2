
export enum LayerType {
  BACKGROUND = 'background',
  PERSON = 'person',
  TEXT = 'text',
}

export type Layers = {
  [key in LayerType]?: string;
};

export type VisibleLayers = {
  [key in LayerType]: boolean;
};

export type LoadingState = {
  [key in LayerType]?: boolean | string;
};

export interface EnhancementSettings {
  model: string;
  resolution: string;
  style: string;
  creativity: string;
  prompt: string;
}

export interface ExportSettings {
  format: 'webp' | 'tiff' | 'png';
  resolution: '1080p' | '4k' | '8k';
  background: 'transparent' | 'white' | 'black' | 'custom';
  customColor: string;
}