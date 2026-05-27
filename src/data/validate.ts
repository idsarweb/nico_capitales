import type { Country } from '../types';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateDataset(data: Country[], geoJsonIsoSet?: Set<string>): ValidationResult {
  const errors: string[] = [];
  const isoMap = new Map<string, string[]>();

  for (const c of data) {
    // 1. Duplicate ISO check
    const existing = isoMap.get(c.iso) ?? [];
    existing.push(c.name);
    isoMap.set(c.iso, existing);

    // 2. Missing / invalid coordinates
    if (!c.coordinates || c.coordinates.length !== 2) {
      errors.push(`Missing or invalid coordinates for ${c.name} (${c.iso})`);
    } else {
      const [lat, lng] = c.coordinates;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        errors.push(`Coordinates are not numbers for ${c.name} (${c.iso})`);
      } else if (lat < -90 || lat > 90) {
        errors.push(`Latitude out of range for ${c.name} (${c.iso}): ${lat}`);
      } else if (lng < -180 || lng > 180) {
        errors.push(`Longitude out of range for ${c.name} (${c.iso}): ${lng}`);
      }
    }

    // 3. Required fields
    if (!c.name || c.name.trim().length === 0) {
      errors.push(`Missing name for ISO ${c.iso}`);
    }
    if (!c.capital || c.capital.trim().length === 0) {
      errors.push(`Missing capital for ${c.name} (${c.iso})`);
    }
    if (!c.region) {
      errors.push(`Missing region for ${c.name} (${c.iso})`);
    }
    if (!c.funFact || c.funFact.trim().length === 0) {
      errors.push(`Missing funFact for ${c.name} (${c.iso})`);
    }
  }

  // Report duplicates
  for (const [iso, names] of isoMap) {
    if (names.length > 1) {
      errors.push(`Duplicate ISO code "${iso}" used by: ${names.join(', ')}`);
    }
  }

  // 4. GeoJSON cross-reference
  if (geoJsonIsoSet) {
    for (const c of data) {
      if (!geoJsonIsoSet.has(c.iso)) {
        errors.push(`GeoJSON missing feature for ${c.name} (${c.iso})`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/** Throws on invalid data so that import-time calls fail loudly at build/dev startup. */
export function validateAndThrow(data: Country[], geoJsonIsoSet?: Set<string>): void {
  const result = validateDataset(data, geoJsonIsoSet);
  if (!result.ok) {
    const msg = result.errors.join('\n  - ');
    throw new Error(`Dataset validation failed:\n  - ${msg}`);
  }
}
