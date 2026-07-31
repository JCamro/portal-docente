import { useState, useEffect, useCallback } from 'react';
import type { NotaDia } from '../types';
import { getNotasDia, createNotaDia, updateNotaDia, deleteNotaDia } from '../api/portalDocente';

interface UseNotasDiaOptions {
  cicloId: number;
  fecha: string;
  enabled?: boolean;
}

interface UseNotasDiaReturn {
  nota: NotaDia | null;
  contenido: string;
  setContenido: (value: string) => void;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotasDia({
  cicloId,
  fecha,
  enabled = true,
}: UseNotasDiaOptions): UseNotasDiaReturn {
  const [nota, setNota] = useState<NotaDia | null>(null);
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNota = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const notas = await getNotasDia(cicloId, { fecha });
      if (notas.length > 0) {
        setNota(notas[0]);
        setContenido(notas[0].contenido);
      } else {
        setNota(null);
        setContenido('');
      }
    } catch {
      setError('Error al cargar la nota del día');
    } finally {
      setLoading(false);
    }
  }, [cicloId, fecha, enabled]);

  useEffect(() => {
    fetchNota();
  }, [fetchNota]);

  const save = useCallback(async () => {
    const trimmed = contenido.trim();
    if (!nota && !trimmed) return;
    setSaving(true);
    try {
      if (nota && !trimmed) {
        await deleteNotaDia(cicloId, nota.id);
        setNota(null);
      } else if (nota) {
        const updated = await updateNotaDia(cicloId, nota.id, { contenido: trimmed });
        setNota(updated);
      } else {
        const created = await createNotaDia(cicloId, { fecha, contenido: trimmed });
        setNota(created);
      }
    } catch {
      setError('Error al guardar la nota del día');
    } finally {
      setSaving(false);
    }
  }, [cicloId, fecha, nota, contenido]);

  return {
    nota,
    contenido,
    setContenido,
    loading,
    saving,
    error,
    save,
    refresh: fetchNota,
  };
}
