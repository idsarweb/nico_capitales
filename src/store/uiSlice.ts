import type { StateCreator } from 'zustand';
import type { Region } from '../types';
import type { Language } from '../i18n/types';

export type MapViewMode = 'map' | 'list';

export interface UISlice {
  includeTerritories: boolean;
  selectedRegions: Region[];
  theme: 'light' | 'dark';
  mapView: MapViewMode;
  language: Language;

  // Actions
  setIncludeTerritories: (value: boolean) => void;
  toggleRegion: (region: Region) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setMapView: (view: MapViewMode) => void;
  setLanguage: (lang: Language) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  includeTerritories: false,
  selectedRegions: [
    'north-america',
    'central-america',
    'caribbean',
    'south-america',
  ],
  theme: 'light',
  mapView: 'map',
  language: 'es',

  setIncludeTerritories: (value) => set({ includeTerritories: value }),

  toggleRegion: (region) =>
    set((state) => {
      const has = state.selectedRegions.includes(region);
      const selectedRegions = has
        ? state.selectedRegions.filter((r) => r !== region)
        : [...state.selectedRegions, region];
      return { selectedRegions };
    }),

  setTheme: (theme) => set({ theme }),
  setMapView: (view) => set({ mapView: view }),
  setLanguage: (language) => set({ language }),
});
