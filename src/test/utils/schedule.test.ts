import { describe, it, expect } from 'vitest';
import { flattenSchedules, getNearestDate, dateToISO } from '../../utils/schedule';
import type { TallerAgrupado, HorarioSemanalConTaller } from '../../types';

const mockTalleres: TallerAgrupado[] = [
  {
    taller_id: 1,
    taller_nombre: 'Guitarra',
    taller_tipo: 'instrumento',
    taller_color: '#e94560',
    horarios: [
      {
        id: 1,
        dia_semana: 0,
        hora_inicio: '14:00',
        hora_fin: '15:00',
        alumnos_count: 5,
        cupo_maximo: 10,
        cupo_disponible: 5,
        alumnos: [{ id: 1, nombre: 'Juan', apellido: 'Pérez', dni: '12345678' }],
      },
    ],
  },
  {
    taller_id: 2,
    taller_nombre: 'Canto',
    taller_tipo: 'taller',
    taller_color: '#0f3460',
    horarios: [
      {
        id: 2,
        dia_semana: 2,
        hora_inicio: '16:00',
        hora_fin: '17:30',
        alumnos_count: 3,
        cupo_maximo: 8,
        cupo_disponible: 5,
        alumnos: [],
      },
      {
        id: 3,
        dia_semana: 4,
        hora_inicio: '10:00',
        hora_fin: '11:00',
        alumnos_count: 2,
        cupo_maximo: 6,
        cupo_disponible: 4,
        alumnos: [{ id: 2, nombre: 'Ana', apellido: 'García', dni: '87654321' }],
      },
    ],
  },
];

describe('flattenSchedules', () => {
  it('returns an empty array when no workshops exist', () => {
    const result = flattenSchedules([]);
    expect(result).toEqual([]);
  });

  it('flattens a single workshop with one schedule', () => {
    const result = flattenSchedules([mockTalleres[0]]);
    expect(result).toHaveLength(1);
    expect(result[0].taller_nombre).toBe('Guitarra');
    expect(result[0].taller_color).toBe('#e94560');
    expect(result[0].id).toBe(1);
  });

  it('flattens multiple workshops preserving order and properties', () => {
    const result = flattenSchedules(mockTalleres);
    expect(result).toHaveLength(3);

    const expected: HorarioSemanalConTaller[] = [
      { ...mockTalleres[0].horarios[0], taller_nombre: 'Guitarra', taller_color: '#e94560' },
      { ...mockTalleres[1].horarios[0], taller_nombre: 'Canto', taller_color: '#0f3460' },
      { ...mockTalleres[1].horarios[1], taller_nombre: 'Canto', taller_color: '#0f3460' },
    ];
    expect(result).toEqual(expected);
  });
});

describe('getNearestDate', () => {
  it('returns a date object for the requested backend day', () => {
    const result = getNearestDate(0);
    expect(result instanceof Date).toBe(true);
  });
});

describe('dateToISO', () => {
  it('formats a date as YYYY-MM-DD', () => {
    const result = dateToISO(new Date(2026, 5, 15));
    expect(result).toBe('2026-06-15');
  });
});
