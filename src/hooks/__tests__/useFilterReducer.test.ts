import { describe, it, expect } from 'vitest';
import { filterReducer } from '../useFilterReducer';
import type { FilterState } from '../../types/alumnos';

describe('filterReducer', () => {
  const initial: FilterState = { fecha: null, tallerId: null, hora: null, estado: null, search: null, dia_semana: null };

  it('returns same state for no-op', () => {
    // @ts-expect-error unknown action type should be handled by default case
    const result = filterReducer(initial, { type: 'NOOP' });
    expect(result).toEqual(initial);
  });

  it('SET_FECHA updates fecha and resets hora', () => {
    const state: FilterState = { ...initial, fecha: null, tallerId: 1, hora: '10:00-11:00' };
    const result = filterReducer(state, { type: 'SET_FECHA', payload: '2026-06-15' });
    expect(result).toEqual({ ...initial, fecha: '2026-06-15', tallerId: 1, hora: null });
  });

  it('SET_FECHA with null clears fecha and hora', () => {
    const state: FilterState = { ...initial, fecha: '2026-06-15', tallerId: 1, hora: '10:00-11:00' };
    const result = filterReducer(state, { type: 'SET_FECHA', payload: null });
    expect(result).toEqual({ ...initial, fecha: null, tallerId: 1, hora: null });
  });

  it('SET_TALLER updates tallerId and resets hora', () => {
    const state: FilterState = { ...initial, fecha: null, tallerId: null, hora: '10:00-11:00' };
    const result = filterReducer(state, { type: 'SET_TALLER', payload: 2 });
    expect(result).toEqual({ ...initial, fecha: null, tallerId: 2, hora: null });
  });

  it('SET_TALLER with null clears tallerId and hora', () => {
    const state: FilterState = { ...initial, fecha: null, tallerId: 1, hora: '10:00-11:00' };
    const result = filterReducer(state, { type: 'SET_TALLER', payload: null });
    expect(result).toEqual({ ...initial, fecha: null, tallerId: null, hora: null });
  });

  it('SET_HORA updates hora field', () => {
    const state: FilterState = { ...initial, fecha: null, tallerId: null, hora: null };
    const result = filterReducer(state, { type: 'SET_HORA', payload: '10:00-11:00' });
    expect(result).toEqual({ ...initial, fecha: null, tallerId: null, hora: '10:00-11:00' });
  });

  it('SET_HORA with null clears hora', () => {
    const state: FilterState = { ...initial, fecha: null, tallerId: 1, hora: '10:00-11:00' };
    const result = filterReducer(state, { type: 'SET_HORA', payload: null });
    expect(result).toEqual({ ...initial, fecha: null, tallerId: 1, hora: null });
  });

  it('RESET_ALL clears all fields', () => {
    const state: FilterState = { fecha: '2026-06-15', tallerId: 1, hora: '10:00-11:00', estado: null, search: null, dia_semana: null };
    const result = filterReducer(state, { type: 'RESET_ALL' });
    expect(result).toEqual({ fecha: null, tallerId: null, hora: null, estado: null, search: null, dia_semana: null });
  });

  it('dispatches SET_FECHA then SET_TALLER — cascade resets hora each time', () => {
    let state = initial;
    state = filterReducer(state, { type: 'SET_FECHA', payload: '2026-06-15' });
    expect(state.fecha).toBe('2026-06-15');

    state = filterReducer(state, { type: 'SET_TALLER', payload: 3 });
    expect(state.fecha).toBe('2026-06-15');
    expect(state.tallerId).toBe(3);
    expect(state.hora).toBeNull();

    state = filterReducer(state, { type: 'SET_HORA', payload: '14:00-15:00' });
    expect(state.hora).toBe('14:00-15:00');

    // Changing fecha resets hora
    state = filterReducer(state, { type: 'SET_FECHA', payload: '2026-06-16' });
    expect(state.fecha).toBe('2026-06-16');
    expect(state.tallerId).toBe(3);
    expect(state.hora).toBeNull();
  });
});
