import { useState, useEffect, useCallback, useRef } from 'react';
import type { NotaClase } from '../types';
import { getNotas, createNota, updateNota, deleteNota } from '../api/portalDocente';

interface UseHorarioNotesOptions {
  cicloId: number;
  horarioId: number;
  fecha: string;
  enabled?: boolean;
}

interface UseHorarioNotesReturn {
  nota: NotaClase | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: (contenido: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useHorarioNotes({
  cicloId,
  horarioId,
  fecha,
  enabled = true,
}: UseHorarioNotesOptions): UseHorarioNotesReturn {
  const [nota, setNota] = useState<NotaClase | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const fetchNota = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const notas = await getNotas(cicloId, {
        horario_id: horarioId,
        fecha,
      });
      setNota(notas.length > 0 ? notas[0] : null);
    } catch {
      setError('Error al cargar la nota de clase');
    } finally {
      setLoading(false);
    }
  }, [cicloId, horarioId, fecha, enabled]);

  useEffect(() => {
    abortRef.current = false;
    fetchNota();
    return () => { abortRef.current = true; };
  }, [fetchNota]);

  const save = useCallback(async (contenido: string): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      const trimmed = contenido.trim();
      if (nota) {
        if (!trimmed) {
          await deleteNota(cicloId, nota.id);
          if (!abortRef.current) setNota(null);
        } else if (trimmed !== nota.contenido) {
          const updated = await updateNota(cicloId, nota.id, { contenido: trimmed });
          if (!abortRef.current) setNota(updated);
        } else {
          // No changes — skip API call
          if (!abortRef.current) setSaving(false);
          return true;
        }
      } else if (trimmed) {
        const created = await createNota(cicloId, {
          horario: horarioId,
          fecha,
          contenido: trimmed,
        });
        if (!abortRef.current) setNota(created);
      }
      if (!abortRef.current) setSaving(false);
      return true;
    } catch {
      if (!abortRef.current) setError('Error al guardar la nota de clase');
      if (!abortRef.current) setSaving(false);
      return false;
    }
  }, [cicloId, horarioId, fecha, nota]);

  return {
    nota,
    loading,
    saving,
    error,
    save,
    refresh: fetchNota,
  };
}
