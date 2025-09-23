export interface WindowCoordinates {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

export interface Product {
  id: string;
  name: string;
  category: 'roller' | 'venetian' | 'curtain' | 'shutter' | '3d-blinds';
  thumbnail: string;
  texture: string;
  price?: number;
  description?: string;
  swatches?: string[];
  is3D?: boolean;
  modelUrl?: string; // For 3D models
}

export interface SceneTransforms {
  opacity: number;
  scale: number;
  verticalOffset: number;
  rotation: number;
  isOpen: boolean;
}

export interface Scene {
  id?: string;
  photoUrl: string;
  windowCoords: WindowCoordinates;
  productId: string;
  transforms: SceneTransforms;
  shareUrl?: string;
}

export interface AppState {
  step: 'landing' | 'photo' | 'window' | 'catalog' | 'preview';
  photo: {
    file?: File;
    url?: string;
    originalDimensions?: { width: number; height: number };
  };
  windowCoords?: WindowCoordinates;
  selectedProduct?: Product;
  transforms: SceneTransforms;
  scene?: Scene;
  isLoading: boolean;
  error?: string;
}

export type AppAction =
  | { type: 'SET_STEP'; payload: AppState['step'] }
  | { type: 'SET_PHOTO'; payload: { file?: File; url?: string; originalDimensions?: { width: number; height: number } } }
  | { type: 'SET_WINDOW_COORDS'; payload: WindowCoordinates }
  | { type: 'SET_SELECTED_PRODUCT'; payload: Product }
  | { type: 'UPDATE_TRANSFORMS'; payload: Partial<SceneTransforms> }
  | { type: 'SET_SCENE'; payload: Scene }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_APP' };