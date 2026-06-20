import { useReducer, useCallback } from 'react';
import type { FilterState, FilterAction } from '../types/alumnos';

const initialFilterState: FilterState = {
  fecha: null,
  tallerId: null,
  hora: null,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_FECHA': {
      // Selecting a fecha resets hora; taller stays (but gets reduced options)
      return {
        ...state,
        fecha: action.payload,
        hora: null,
      };
    }
    case 'SET_TALLER': {
      // Selecting a taller resets hora
      return {
        ...state,
        tallerId: action.payload,
        hora: null,
      };
    }
    case 'SET_HORA': {
      return {
        ...state,
        hora: action.payload,
      };
    }
    case 'RESET_ALL': {
      return { ...initialFilterState };
    }
    default:
      return state;
  }
}

export function useFilterReducer(initial?: Partial<FilterState>) {
  const [state, dispatch] = useReducer(
    filterReducer,
    { ...initialFilterState, ...initial }
  );

  const setFecha = useCallback((fecha: string | null) => {
    dispatch({ type: 'SET_FECHA', payload: fecha });
  }, []);

  const setTaller = useCallback((tallerId: number | null) => {
    dispatch({ type: 'SET_TALLER', payload: tallerId });
  }, []);

  const setHora = useCallback((hora: string | null) => {
    dispatch({ type: 'SET_HORA', payload: hora });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  return {
    state,
    dispatch,
    setFecha,
    setTaller,
    setHora,
    resetAll,
  };
}

export { filterReducer, initialFilterState };
export type { FilterState, FilterAction };
