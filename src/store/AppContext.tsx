import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction, SceneTransforms } from '@/types';

const initialTransforms: SceneTransforms = {
  opacity: 0.9,
  scale: 1,
  verticalScale: 1,
  horizontalScale: 1,
  verticalOffset: 0,
  horizontalOffset: 0,
  rotation: 0,
  isOpen: true,
};

const initialState: AppState = {
  step: 'landing',
  photo: {},
  transforms: initialTransforms,
  isLoading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_PHOTO':
      return { ...state, photo: action.payload };
    case 'SET_WINDOW_COORDS':
      return { ...state, windowCoords: action.payload };
    case 'SET_SELECTED_PRODUCT':
      return { ...state, selectedProduct: action.payload };
    case 'SET_SELECTED_TEXTURE':
      return { ...state, selectedTexture: action.payload };
    case 'UPDATE_TRANSFORMS':
      return {
        ...state,
        transforms: { ...state.transforms, ...action.payload },
      };
    case 'SET_SCENE':
      return { ...state, scene: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: undefined };
    case 'RESET_APP':
      return initialState;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}