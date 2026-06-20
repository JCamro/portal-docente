import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilterReducer } from './useFilterReducer';
import type { FilterState } from '../types/alumnos';

/**
 * Wraps useFilterReducer with URL search params sync.
 * Reads initial state from URL on mount and writes dispatches to URL.
 */
export function useFilterURLSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);

  // Read initial state from URL
  const initialFromURL: Partial<FilterState> = {};
  const urlFecha = searchParams.get('fecha');
  const urlTaller = searchParams.get('taller');
  const urlHora = searchParams.get('hora');

  if (urlFecha) initialFromURL.fecha = urlFecha;
  if (urlTaller) initialFromURL.tallerId = Number(urlTaller);
  if (urlHora) initialFromURL.hora = urlHora;

  const { state, setFecha, setTaller, setHora, resetAll } = useFilterReducer(
    Object.keys(initialFromURL).length > 0 ? initialFromURL : undefined
  );

  // Sync state → URL (skip initial mount to avoid double-render)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const next = new URLSearchParams();
    if (state.fecha) next.set('fecha', state.fecha);
    if (state.tallerId !== null) next.set('taller', String(state.tallerId));
    if (state.hora) next.set('hora', state.hora);

    setSearchParams(next, { replace: true });
  }, [state, setSearchParams]);

  const onChange = (field: 'fecha' | 'tallerId' | 'hora', value: string | number | null) => {
    switch (field) {
      case 'fecha':
        setFecha(value as string | null);
        break;
      case 'tallerId':
        setTaller(value as number | null);
        break;
      case 'hora':
        setHora(value as string | null);
        break;
    }
  };

  return { state, onChange, resetAll, setFecha, setTaller, setHora };
}
