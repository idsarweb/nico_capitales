import { describe, it, expect } from 'vitest';
import { validateDataset, validateAndThrow } from './validate';
import type { Country } from '../types';

const validCountry: Country = {
  iso: 'BR',
  name: 'Brazil',
  capital: 'Brasília',
  coordinates: [-15.79, -47.88],
  region: 'south-america',
  funFact: 'Brazil is the only country to have won the FIFA World Cup five times.',
};

const secondCountry: Country = {
  iso: 'AR',
  name: 'Argentina',
  capital: 'Buenos Aires',
  coordinates: [-34.6, -58.38],
  region: 'south-america',
  funFact: 'Argentina is home to Aconcagua, the highest peak outside of Asia.',
};

describe('validateDataset', () => {
  it('passes for a valid single country', () => {
    const result = validateDataset([validCountry]);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('passes for a valid multi-country dataset', () => {
    const result = validateDataset([validCountry, secondCountry]);
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('detects duplicate ISO codes', () => {
    const dup = { ...validCountry, name: 'Fake Brazil' };
    const result = validateDataset([validCountry, dup]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate ISO') && e.includes('BR'))).toBe(true);
  });

  it('detects missing coordinates', () => {
    const bad = { ...validCountry, coordinates: [0] as unknown as [number, number] };
    const result = validateDataset([bad]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing or invalid coordinates'))).toBe(true);
  });

  it('detects out-of-range latitude', () => {
    const bad = { ...validCountry, coordinates: [95, 0] as [number, number] };
    const result = validateDataset([bad]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Latitude out of range'))).toBe(true);
  });

  it('detects out-of-range longitude', () => {
    const bad = { ...validCountry, coordinates: [0, 190] as [number, number] };
    const result = validateDataset([bad]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Longitude out of range'))).toBe(true);
  });

  it('detects missing name', () => {
    const bad = { ...validCountry, name: '' };
    const result = validateDataset([bad]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing name'))).toBe(true);
  });

  it('detects missing capital', () => {
    const bad = { ...validCountry, capital: '  ' };
    const result = validateDataset([bad]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing capital'))).toBe(true);
  });

  it('detects missing region', () => {
    const bad = { ...validCountry, region: undefined } as unknown as Country;
    const result = validateDataset([bad]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing region'))).toBe(true);
  });

  it('detects missing funFact', () => {
    const bad = { ...validCountry, funFact: '' };
    const result = validateDataset([bad]);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('Missing funFact'))).toBe(true);
  });

  it('reports GeoJSON missing features when geoJsonIsoSet provided', () => {
    const geoSet = new Set<string>(['AR']);
    const result = validateDataset([validCountry, secondCountry], geoSet);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('GeoJSON missing feature') && e.includes('BR'))).toBe(true);
  });
});

describe('validateAndThrow', () => {
  it('throws with detailed message on invalid data', () => {
    expect(() => validateAndThrow([{ ...validCountry, name: '' }])).toThrow(
      /Dataset validation failed/,
    );
  });

  it('does not throw for valid data', () => {
    expect(() => validateAndThrow([validCountry])).not.toThrow();
  });
});
