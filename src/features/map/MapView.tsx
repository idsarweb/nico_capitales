import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Feature, Geometry, FeatureCollection } from 'geojson';
import geojsonRaw from '../../data/americas-110m.geojson?raw';
import { allCountries } from '../../data/countries';
import { useAppStore } from '../../store';
import type { Region, QuizMode } from '../../types';
import { Legend } from './Legend';

const LIGHT_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';

const americasGeoJson: FeatureCollection = JSON.parse(geojsonRaw);

const REGION_COLORS: Record<Region, string> = {
  'north-america': '#FF6B6B',
  'central-america': '#4ECDC4',
  caribbean: '#FFD93D',
  'south-america': '#6C5CE7',
};

const REGION_HOVER: Record<Region, string> = {
  'north-america': '#FF8E8E',
  'central-america': '#6FE5DC',
  caribbean: '#FFE566',
  'south-america': '#8B80F0',
};

const COUNTRY_BY_ISO = new Map(allCountries.map((c) => [c.iso, c]));

function getRegionForIso(iso: string): Region | null {
  return COUNTRY_BY_ISO.get(iso)?.region ?? null;
}

function getCountryName(iso: string): string {
  return COUNTRY_BY_ISO.get(iso)?.name ?? iso;
}

function isTinyIsland(feature: Feature<Geometry>): boolean {
  const iso = (feature.properties as Record<string, string> | undefined)?.ISO_A2;
  const region = getRegionForIso(iso ?? '');
  return region === 'caribbean';
}

/* Fly-to watcher */
function FlyToController({ targetIso, mode }: { targetIso: string | null; mode: QuizMode }) {
  const map = useMap();
  useEffect(() => {
    if (mode !== 'study') return;
    if (!targetIso) return;
    const country = COUNTRY_BY_ISO.get(targetIso);
    if (!country) return;
    const zoomLevel = country.region === 'caribbean' ? 8 : 6;
    map.flyTo(country.coordinates, zoomLevel, { duration: 1.5, easeLinearity: 0.25 });
  }, [targetIso, map, mode]);
  return null;
}

/* Circle markers for tiny islands */
function TinyIslandMarkers({
  data,
  showTooltips,
}: {
  data: GeoJSON.FeatureCollection;
  showTooltips: boolean;
}) {
  const map = useMap();
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    function update() {
      // clear previous
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];

      const storeTheme = useAppStore.getState().theme;
      const outlineColor = storeTheme === 'dark' ? '#ffffff' : '#1e293b';

      data.features.forEach((feature) => {
        if (!isTinyIsland(feature)) return;
        const iso = (feature.properties as Record<string, string> | undefined)?.ISO_A2 ?? '';
        const region = getRegionForIso(iso);
        if (!region) return;

        const layer = L.geoJSON(feature);
        const center = layer.getBounds().getCenter();
        const marker = L.circleMarker(center, {
          radius: 8,
          fillColor: REGION_COLORS[region],
          color: outlineColor,
          weight: 1,
          opacity: 1,
          fillOpacity: 0.7,
        });
        marker.on('click', () => {
          useAppStore.getState().onCountryClick(iso);
        });
        if (showTooltips) {
          marker.bindTooltip(getCountryName(iso), {
            direction: 'top',
            className:
              'bg-white text-slate-900 text-xs font-semibold px-2 py-1 rounded shadow-lg border-0 dark:bg-slate-900 dark:text-white',
          });
        }
        marker.addTo(map);
        markersRef.current.push(marker);
      });
    }

    update();
    map.on('zoomend', update);
    return () => {
      map.off('zoomend', update);
      markersRef.current.forEach((m) => map.removeLayer(m));
    };
  }, [map, data]);

  return null;
}

interface MapViewProps {
  mode?: 'study' | 'practice' | 'quiz';
}

export default function MapView({ mode = 'study' }: MapViewProps) {
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const targetCountry = useAppStore((s) => s.targetCountry);
  const selectedCountry = useAppStore((s) => s.selectedCountry);
  const onCountryClick = useAppStore((s) => s.onCountryClick);
  const phase = useAppStore((s) => s.phase);
  const theme = useAppStore((s) => s.theme);

  const isQuestionActive = phase === 'question';
  const isStudy = mode === 'study';

  const getStyle = useCallback(
    (iso: string, isHovered: boolean) => {
      const region = getRegionForIso(iso);
      const baseColor = region ? REGION_COLORS[region] : '#94a3b8';
      const hoverColor = region ? REGION_HOVER[region] : '#cbd5e1';
      const fillColor = isHovered ? hoverColor : baseColor;
      const isTarget = isStudy && targetCountry === iso;
      const isSelected = selectedCountry === iso;

      // In quiz/practice mode: transparent fill, only borders visible
      const fillOpacity = isStudy
        ? isHovered ? 0.85 : 0.6
        : isHovered ? 0.3 : 0.05;

      return {
        fillColor,
        weight: isTarget ? 3.5 : isSelected ? 2.5 : 1.5,
        opacity: 1,
        color: isTarget
          ? '#fbbf24'
          : isSelected || isHovered
            ? '#ffffff'
            : '#475569',
        dashArray: isTarget ? undefined : '3',
        fillOpacity,
      } as L.PathOptions;
    },
    [targetCountry, selectedCountry, isStudy]
  );

  const restyleAll = useCallback(() => {
    const layer = geoJsonLayerRef.current;
    if (!layer) return;
    layer.eachLayer((l) => {
      const f = (l as unknown as { feature?: Feature<Geometry> }).feature;
      if (!f) return;
      const props = f.properties as Record<string, string> | undefined;
      const iso = props?.ISO_A2 ?? '';
      (l as L.Path).setStyle(getStyle(iso, hoveredIso === iso));
    });
  }, [getStyle, hoveredIso]);

  useEffect(() => {
    restyleAll();
  }, [restyleAll, targetCountry, selectedCountry, hoveredIso]);

  const handleEachFeature = useCallback(
    (feature: Feature<Geometry>, layer: L.Layer) => {
      const props = feature.properties as Record<string, string> | undefined;
      const iso = props?.ISO_A2 ?? '';
      const name = getCountryName(iso);

      layer.on({
        mouseover: () => {
          setHoveredIso(iso);
        },
        mouseout: () => {
          setHoveredIso((prev) => (prev === iso ? null : prev));
        },
        click: () => {
          onCountryClick(iso);
        },
      });

      const path = (layer as unknown as { getElement?: () => SVGElement | null }).getElement?.();
      if (path) {
        path.setAttribute('tabindex', '0');
        path.setAttribute('role', 'button');
        path.setAttribute('aria-label', name);
        path.style.outline = 'none';

        // Note: focus/blur/keyboard accessibility is handled by Leaflet when
        // tabindex and role are present; we intentionally do NOT add raw
        // addEventListener here to avoid memory leaks on GeoJSON re-creation.
        // https://github.com/Leaflet/Leaflet/issues/7331
      }

      if (isStudy) {
        layer.bindTooltip(name, {
          permanent: false,
          direction: 'top',
          className:
            'bg-white text-slate-900 text-xs font-semibold px-2 py-1 rounded shadow-lg border-0 dark:bg-slate-900 dark:text-white',
        });
      }
    },
    [onCountryClick, getStyle]
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[10, -60]}
        zoom={3}
        minZoom={2}
        maxZoom={10}
        className="h-full w-full"
        style={{ minHeight: '60vh' }}
      >
        <TileLayer
          key={`tiles-${theme}`}
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url={theme === 'dark' ? DARK_TILE_URL : LIGHT_TILE_URL}
        />

        {allCountries.map((c) => (
          <CircleMarker
            key={`capital-${c.iso}`}
            center={c.coordinates}
            radius={3}
            bubblingMouseEvents={false}
            interactive={!isQuestionActive}
            pathOptions={{
              fillColor: REGION_COLORS[c.region],
              color: theme === 'dark' ? '#ffffff' : '#1e293b',
              weight: 1,
              fillOpacity: 0.9,
            }}
          >
            {isStudy && (
              <Popup>
                <strong>{c.name}</strong>
                <br />
                {c.capital}
              </Popup>
            )}
          </CircleMarker>
        ))}

        <GeoJSON
          data={americasGeoJson}
          style={(feature) => {
            const props = (feature?.properties ?? {}) as Record<string, string>;
            const iso = props.ISO_A2 ?? '';
            return getStyle(iso, hoveredIso === iso);
          }}
          onEachFeature={handleEachFeature}
          ref={geoJsonLayerRef as React.LegacyRef<L.GeoJSON>}
        />

        <TinyIslandMarkers data={americasGeoJson} showTooltips={isStudy} />

        <FlyToController targetIso={targetCountry} mode={mode} />
      </MapContainer>

      {isQuestionActive && mode !== 'study' && (
        <div
          className="pointer-events-none absolute inset-0 z-[998]"
          style={{ cursor: 'crosshair' }}
        />
      )}

      <Legend />
    </div>
  );
}
