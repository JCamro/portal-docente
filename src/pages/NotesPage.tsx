import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getNotas, createNota, updateNota, deleteNota, getHorarios, getAsistenciasPorHorario } from '../api/portalDocente';
import type { NotaClase, HorarioDetalle } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import CascadeFilters from '../components/domain/CascadeFilters';
import NotesInlineForm from '../components/domain/NotesInlineForm';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { useFilterURLSync } from '../hooks/useFilterURLSync';
import { formatDate } from '../utils/formatters';

type NoteNivel = 'general' | 'dia' | 'taller' | 'clase' | 'alumno' | 'todas';

const NotesPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const { state: filterState, onChange: onFilterChange } = useFilterURLSync();

  const [notas, setNotas] = useState<NotaClase[]>([]);
  const [horarios, setHorarios] = useState<HorarioDetalle[]>([]);
  const [fechas, setFechas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Nivel filter
  const [nivelFilter, setNivelFilter] = useState<NoteNivel>('todas');

  // Editing state
  const [showForm, setShowForm] = useState(false);
  const [editingNota, setEditingNota] = useState<NotaClase | null>(null);

  // Taller and hora options for CascadeFilters
  const talleres = useMemo(() => {
    const map = new Map<number, string>();
    for (const h of horarios) {
      if (h.taller_id && !map.has(h.taller_id)) {
        map.set(h.taller_id, h.taller_nombre);
      }
    }
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [horarios]);

  const horas = useMemo(() => {
    const horasSet = new Set<string>();
    for (const h of horarios) {
      horasSet.add(`${h.hora_inicio}-${h.hora_fin}`);
    }
    return Array.from(horasSet).sort().map((slot) => {
      const [inicio, fin] = slot.split('-');
      return { inicio, fin, horarioId: 0 };
    });
  }, [horarios]);

  // Filtered notas (client-side)
  const filteredNotas = useMemo(() => {
    let result = [...notas];

    // Filter by nivel
    if (nivelFilter !== 'todas') {
      // For now, only "clase" level exists via getNotas; others are filtered client-side
      // This is a placeholder — API-based nivel filtering would be ideal
      if (nivelFilter === 'clase') {
        // all notas from getNotas are "clase" level by default
      } else {
        // For other levels, return empty for now (APIs not unified yet)
        return [];
      }
    }

    // Filter by taller via horarios
    if (filterState.tallerId !== null) {
      const tallerHorarioIds = horarios
        .filter((h) => h.taller_id === filterState.tallerId)
        .map((h) => h.id);
      result = result.filter((n) => tallerHorarioIds.includes(n.horario));
    }

    // Filter by hora
    if (filterState.hora) {
      const [horaInicio] = filterState.hora.split('-');
      const horaHorarioIds = horarios
        .filter((h) => h.hora_inicio === horaInicio)
        .map((h) => h.id);
      result = result.filter((n) => horaHorarioIds.includes(n.horario));
    }

    // Filter by fecha
    if (filterState.fecha) {
      result = result.filter((n) => n.fecha === filterState.fecha);
    }

    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [notas, nivelFilter, filterState, horarios]);

  const fetchData = useCallback(async () => {
    if (!cicloActivo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [notasData, horariosData, asistenciaData] = await Promise.all([
        getNotas(cicloActivo.id),
        getHorarios(cicloActivo.id),
        getAsistenciasPorHorario(cicloActivo.id),
      ]);
      setNotas(notasData);
      setHorarios(horariosData);

      // Extract unique dates from attendance data for CascadeFilters
      const dateSet = new Set<string>();
      if (asistenciaData?.horarios) {
        for (const h of asistenciaData.horarios) {
          for (const f of h.fechas) {
            dateSet.add(f);
          }
        }
      }
      setFechas(Array.from(dateSet).sort());
    } catch {
      setError('Error al cargar las notas');
    } finally {
      setLoading(false);
    }
  }, [cicloActivo]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchData();
    };
    run();
    return () => { cancelled = true; };
  }, [fetchData]);

  const handleCreate = useCallback(async (data: { horario: number; fecha: string; contenido: string }) => {
    if (!cicloActivo) return;
    setSaving(true);
    try {
      const created = await createNota(cicloActivo.id, data);
      setNotas((prev) => [created, ...prev]);
      setShowForm(false);
    } catch {
      setError('Error al crear la nota');
    } finally {
      setSaving(false);
    }
  }, [cicloActivo]);

  const handleUpdate = useCallback(async (data: { horario: number; fecha: string; contenido: string }) => {
    if (!cicloActivo || !editingNota) return;
    setSaving(true);
    try {
      const updated = await updateNota(cicloActivo.id, editingNota.id, data);
      setNotas((prev) => prev.map((n) => (n.id === editingNota.id ? updated : n)));
      setEditingNota(null);
      setShowForm(false);
    } catch {
      setError('Error al actualizar la nota');
    } finally {
      setSaving(false);
    }
  }, [cicloActivo, editingNota]);

  const handleDelete = useCallback(async (notaId: number) => {
    if (!cicloActivo) return;
    try {
      await deleteNota(cicloActivo.id, notaId);
      setNotas((prev) => prev.filter((n) => n.id !== notaId));
    } catch {
      setError('Error al eliminar la nota');
    }
  }, [cicloActivo]);

  const handleEdit = useCallback((nota: NotaClase) => {
    setEditingNota(nota);
    setShowForm(true);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingNota(null);
  }, []);

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState
          message="Selecciona un ciclo"
          description="Elige un ciclo académico para ver tus notas."
        />
      </div>
    );
  }

  if (loading) return <Loading message="Cargando notas..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div style={{
      padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
      maxWidth: 900,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-5)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
          color: 'var(--color-gold)',
          margin: 0,
        }}>
          Notas
        </h1>
        <button
          onClick={() => { setShowForm(true); setEditingNota(null); }}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
            border: 'none',
            color: '#0a0a0a',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Nota
        </button>
      </div>

      {/* CascadeFilters (replaces NotesFilterBar) */}
      <CascadeFilters
        fechas={fechas}
        talleres={talleres}
        horas={horas}
        selected={filterState}
        onChange={onFilterChange}
      />

      {/* Nivel filter dropdown */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
        marginBottom: 'var(--space-4)',
      }}>
        <select
          value={nivelFilter}
          onChange={(e) => setNivelFilter(e.target.value as NoteNivel)}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            minWidth: 160,
            minHeight: 44,
          }}
          aria-label="Filtrar por nivel"
        >
          <option value="todas">Todos los niveles</option>
          <option value="general">General</option>
          <option value="dia">Día</option>
          <option value="taller">Taller</option>
          <option value="clase">Clase</option>
          <option value="alumno">Alumno</option>
        </select>
      </div>

      {/* Inline create/edit form */}
      {showForm && (
        <NotesInlineForm
          horarios={horarios}
          initialContenido={editingNota?.contenido ?? ''}
          initialHorarioId={editingNota?.horario ?? null}
          saving={saving}
          onSave={editingNota ? handleUpdate : handleCreate}
          onCancel={handleCancelForm}
          isEditing={!!editingNota}
        />
      )}

      {/* Notes list */}
      {filteredNotas.length === 0 ? (
        <EmptyState
          message={notas.length === 0 ? 'No tienes notas' : 'No hay notas con estos filtros'}
          description="Crea una nota para registrar observaciones de tus clases."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filteredNotas.map((nota) => (
            <div
              key={nota.id}
              style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 'var(--space-2)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-2)',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    marginBottom: 'var(--space-1)',
                  }}>
                    {nota.taller_nombre && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 10,
                        fontWeight: 600,
                        background: 'var(--color-gold-glow)',
                        color: 'var(--color-gold)',
                      }}>
                        {nota.taller_nombre}
                      </span>
                    )}
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                    }}>
                      {formatDate(nota.fecha)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text)',
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5,
                  }}>
                    {nota.contenido}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, marginLeft: 'var(--space-3)' }}>
                  <button
                    onClick={() => handleEdit(nota)}
                    style={{
                      padding: 'var(--space-1)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      background: 'transparent',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 32,
                      minWidth: 32,
                    }}
                    aria-label="Editar nota"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(nota.id)}
                    style={{
                      padding: 'var(--space-1)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      background: 'transparent',
                      color: '#fca5a5',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 32,
                      minWidth: 32,
                    }}
                    aria-label="Eliminar nota"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default NotesPage;
