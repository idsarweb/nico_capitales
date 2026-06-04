import type { Region } from '../types';

export const REGION_LABEL_KEY: Record<Region, string> = {
  'north-america': 'map.northAmerica',
  'central-america': 'map.centralAmerica',
  caribbean: 'map.caribbean',
  'south-america': 'map.southAmerica',
};

export const REGION_COLORS: Record<Region, string> = {
  'north-america': '#FF6B6B',
  'central-america': '#4ECDC4',
  caribbean: '#FFD93D',
  'south-america': '#6C5CE7',
};

export const REGION_HOVER: Record<Region, string> = {
  'north-america': '#FF8E8E',
  'central-america': '#6FE5DC',
  caribbean: '#FFE566',
  'south-america': '#8B80F0',
};
