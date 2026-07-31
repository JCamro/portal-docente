import { useReducer, useCallback } from 'react';
import type { FilterState, FilterAction } from '../types/alumnos';

const initialFilterState: FilterState = {
  fecha: null,
  tallerId: null,
  hora: null,
  estado: null,
  search: null,
  dia_semana: null,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_FECHA': {
      return {
        ...state,
        fecha: action.payload,
        hora: null,
      };
    }
    case 'SET_TALLER': {
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
    case 'SET_ESTADO': {
      return {
        ...state,
        estado: action.payload,
      };
    }
    case 'SET_SEARCH': {
      return {
        ...state,
        search: action.payload,
      };
    }
    case 'SET_DIA_SEMANA': {
      return {
        ...state,
        dia_semana: action.payload,
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

  const setEstado = useCallback((estado: string | null) => {
    dispatch({ type: 'SET_ESTADO', payload: estado });
  }, []);

  const setSearch = useCallback((search: string | null) => {
    dispatch({ type: 'SET_SEARCH', payload: search });
  }, []);

  const setDiaSemana = useCallback((dia_semana: string | null) => {
    dispatch({ type: 'SET_DIA_SEMANA', payload: dia_semana });
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
    setEstado,
    setSearch,
    setDiaSemana,
    resetAll,
  };
}

export { filterReducer, initialFilterState };
export type { FilterState, FilterAction };
