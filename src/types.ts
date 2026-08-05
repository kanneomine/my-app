export type EditMode = 'remove' | 'replace' | 'add' | 'lighting' | 'enhance';

export type ToolType = 'brush' | 'eraser' | 'rect';

export type LightingPreset =
  | 'day'
  | 'night'
  | 'sunset'
  | 'indirect'
  | 'warm_lamp'
  | 'neon'
  | 'studio'
  | 'custom';

export type EnhanceMode = 'hdr' | 'sharp' | 'noise' | 'upscale';

export interface ImageState {
  baseImage: string | null; // data URL
  maskImage: string | null; // data URL of black/white mask
  compositeImage: string | null; // data URL of image + red mask
  width: number;
  height: number;
}

export interface EditHistoryItem {
  id: string;
  timestamp: number;
  baseImage: string;
  resultImage: string;
  maskImage: string;
  prompt: string;
  mode: EditMode;
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  suggestedPrompt: string;
}


