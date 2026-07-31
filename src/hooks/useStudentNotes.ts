import { useState, useEffect, useCallback } from 'react';
import type { NotaAlumno } from '../types';
import { getNotasAlumno, createNotaAlumno, updateNotaAlumno, deleteNotaAlumno } from '../api/portalDocente';

interface UseStudentNotesOptions {
  cicloId: number;
  horarioId: number;
  fecha: string;
  enabled?: boolean;
}

interface UseStudentNotesReturn {
  notas: Record<number, NotaAlumno>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: (alumnoId: number, contenido: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useStudentNotes({
  cicloId,
  horarioId,
  fecha,
  enabled = true,
}: UseStudentNotesOptions): UseStudentNotesReturn {
  const [notas, setNotas] = useState<Record<number, NotaAlumno>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotas = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const list = await getNotasAlumno(cicloId, {
        horario_id: horarioId,
        fecha,
      });
      const map: Record<number, NotaAlumno> = {};
      for (const na of list) {
        map[na.alumno] = na;
      }
      setNotas(map);
    } catch {
      setError('Error al cargar las notas de alumno');
    } finally {
      setLoading(false);
    }
  }, [cicloId, horarioId, fecha, enabled]);

  useEffect(() => {
    fetchNotas();
  }, [fetchNotas]);

  const save = useCallback(async (alumnoId: number, contenido: string) => {
    const trimmed = contenido.trim();
    const existing = notas[alumnoId];
    if (!existing && !trimmed) return;
    setSaving(true);
    try {
      if (existing && !trimmed) {
        await deleteNotaAlumno(cicloId, existing.id);
        setNotas((prev) => {
          const next = { ...prev };
          delete next[alumnoId];
          return next;
        });
      } else if (existing) {
        const updated = await updateNotaAlumno(cicloId, existing.id, { contenido: trimmed });
        setNotas((prev) => ({ ...prev, [alumnoId]: updated }));
      } else {
        const created = await createNotaAlumno(cicloId, {
          horario: horarioId,
          alumno: alumnoId,
          fecha,
          contenido: trimmed,
        });
        setNotas((prev) => ({ ...prev, [alumnoId]: created }));
      }
    } catch {
      setError('Error al guardar la nota de alumno');
    } finally {
      setSaving(false);
    }
  }, [cicloId, horarioId, fecha, notas]);

  return {
    notas,
    loading,
    saving,
    error,
    save,
    refresh: fetchNotas,
  };
}
