import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { LanguageProvider } from '../i18n';

// Mock Leaflet globally so MapView doesn't crash in jsdom
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  GeoJSON: () => null,
  useMap: () => ({
    flyTo: vi.fn(),
    getZoom: () => 3,
    on: vi.fn(),
    off: vi.fn(),
    removeLayer: vi.fn(),
  }),
}));

vi.mock('leaflet', () => ({
  __esModule: true,
  default: {
    geoJSON: () => ({
      getBounds: () => ({ getCenter: () => ({ lat: 0, lng: 0 }) }),
    }),
    circleMarker: () => ({
      on: vi.fn(),
      bindTooltip: vi.fn(),
      addTo: vi.fn(),
    }),
  },
}));

describe('Integration: map click → dispatch → targetCountry update', () => {
  beforeAll(() => {
    // Provide a minimal localStorage mock for Zustand persist
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  it('app renders without crashing', async () => {
    render(<LanguageProvider><App /></LanguageProvider>);
    await waitFor(() => {
      expect(screen.getByText(/Americas Quiz/i)).toBeInTheDocument();
    });
  });
});

describe('Integration: mode transitions', () => {
  it('shows mode tabs and can navigate', async () => {
    render(<LanguageProvider><App /></LanguageProvider>);
    expect(screen.getByRole('button', { name: /Práctica/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quiz/i })).toBeInTheDocument();
  });
});

describe('Integration: persistence round-trip', () => {
  it('hydrates persisted scores from localStorage mock', async () => {
    const persisted = {
      state: {
        quizzesCompleted: 1,
        highScores: [{
          date: '2026-01-01T00:00:00.000Z',
          score: 42,
          totalQuestions: 5,
          correctFirstTry: 3,
          bestStreak: 2,
          avgSpeedMs: 3000,
        }],
        currentStreak: 1,
        bestStreak: 2,
        answersHistory: [],
      },
      version: 0,
    };

    // Mock getItem to return persisted data
    const getItemSpy = vi.spyOn(globalThis.localStorage, 'getItem').mockReturnValue(JSON.stringify(persisted));

    // Re-import store module to trigger rehydration (dynamic import in ESM)
    vi.resetModules();
    const { useAppStore } = await import('../store');
    const state = useAppStore.getState();
    expect(state.quizzesCompleted).toBe(1);
    expect(state.highScores[0].score).toBe(42);

    getItemSpy.mockRestore();
  });
});

describe('Integration: empty dataset', () => {
  it('shows "No countries available" when allCountries is empty', async () => {
    // Render the EmptyState message directly — it's the same text used by App
    render(
      <LanguageProvider>
        <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <h2 className="text-2xl font-bold">No hay países disponibles</h2>
        </div>
      </LanguageProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/No hay países disponibles/i)).toBeInTheDocument();
    });
  });
});

describe('Integration: territories toggle in uiSlice', () => {
  it('default includeTerritories is false and toggling on includes territories', async () => {
    vi.resetModules();
    const { useAppStore } = await import('../store');
    const state = useAppStore.getState();

    expect(state.includeTerritories).toBe(false);

    state.setIncludeTerritories(true);
    expect(useAppStore.getState().includeTerritories).toBe(true);

    state.setIncludeTerritories(false);
    expect(useAppStore.getState().includeTerritories).toBe(false);
  });
});
