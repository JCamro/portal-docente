import { useState, useEffect, useCallback } from 'react';
import type { AlumnoResumenEntry, HorarioResumenFecha } from '../types';
import { getHorarioResumenFecha } from '../api/portalDocente';

interface UseAttendanceOptions {
  cicloId: number;
  horarioId: number;
  fecha: string;
  enabled?: boolean;
}

interface UseAttendanceReturn {
  resumen: HorarioResumenFecha | null;
  registros: AlumnoResumenEntry[];
  modo: HorarioResumenFecha['modo'] | null;
  aviso: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAttendance({
  cicloId,
  horarioId,
  fecha,
  enabled = true,
}: UseAttendanceOptions): UseAttendanceReturn {
  const [data, setData] = useState<HorarioResumenFecha | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getHorarioResumenFecha(cicloId, horarioId, fecha);
      setData(result);
    } catch {
      setError('Error al cargar la asistencia');
    } finally {
      setLoading(false);
    }
  }, [cicloId, horarioId, fecha, enabled]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return {
    resumen: data,
    registros: data?.registros || [],
    modo: data?.modo || null,
    aviso: data?.aviso || null,
    loading,
    error,
    refresh: fetchAttendance,
  };
}
