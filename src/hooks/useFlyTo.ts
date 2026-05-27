import { useCallback } from 'react';

export interface FlyToOptions {
  lat: number;
  lng: number;
  zoom?: number;
  duration?: number; // seconds
}

/** Returns a callback that can be wired to a Leaflet map ref later. */
export function useFlyTo() {
  const flyTo = useCallback(
    (map: L.Map | null, { lat, lng, zoom = 6, duration = 1.5 }: FlyToOptions) => {
      if (!map) return;
      map.flyTo([lat, lng], zoom, {
        duration,
        easeLinearity: 0.25,
      });
    },
    []
  );

  return flyTo;
}

// Minimal ambient type so we don't need to import Leaflet at build time here.
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace L {
  interface Map {
    flyTo(latlng: [number, number], zoom?: number, options?: { duration?: number; easeLinearity?: number }): void;
  }
}
