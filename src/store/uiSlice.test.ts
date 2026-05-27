import { describe, it, expect } from 'vitest';
import { create } from 'zustand';
import { createUISlice } from './uiSlice';
import type { UISlice } from './uiSlice';

function makeStore() {
  return create<UISlice>()((...args) => createUISlice(...args));
}

describe('UISlice territories toggle', () => {
  it('default includeTerritories is false', () => {
    const store = makeStore();
    expect(store.getState().includeTerritories).toBe(false);
  });

  it('toggling on sets includeTerritories to true', () => {
    const store = makeStore();
    store.getState().setIncludeTerritories(true);
    expect(store.getState().includeTerritories).toBe(true);
  });

  it('toggling back off sets includeTerritories to false', () => {
    const store = makeStore();
    store.getState().setIncludeTerritories(true);
    store.getState().setIncludeTerritories(false);
    expect(store.getState().includeTerritories).toBe(false);
  });
});
