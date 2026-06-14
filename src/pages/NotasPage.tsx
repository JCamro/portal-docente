import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getHorarios, getNotas, createNota, updateNota, deleteNota } from '../api/portalDocente';
import type { HorarioDetalle, NotaClase } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import DatePicker from '../components/ui/DatePicker';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { DIA_SEMANA_MAP, formatHora } from '../utils/constants';
import { formatDate } from '../utils/formatters';

const NotasPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [horarios, setHorarios] = useState<HorarioDetalle[]>([]);
  const [notas, setNotas] = useState<NotaClase[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(true);
  const [loadingNotas, setLoadingNotas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formHorarioId, setFormHorarioId] = useState<number | null>(null);
  const [formFecha, setFormFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [formContenido, setFormContenido] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContenido, setEditContenido] = useState('');

  // Filter state
  const [filtroHorarioId, setFiltroHorarioId] = useState<number | null>(null);
  const formHorarioIdRef = useRef(formHorarioId);
  formHorarioIdRef.current = formHorarioId;

  const fetchHorarios = useCallback(async () => {
    if (!cicloActivo) {
      setLoadingHorarios(false);
      return;
    }
    setLoadingHorarios(true);
    try {
      const data = await getHorarios(cicloActivo.id);
      setHorarios(data);
      if (data.length > 0 && formHorarioIdRef.current === null) {
        setFormHorarioId(data[0].id);
      }
    } catch {
      setError('Error al cargar horarios');
    } finally {
      setLoadingHorarios(false);
    }
  }, [cicloActivo]);

  const fetchNotas = useCallback(async () => {
    if (!cicloActivo) return;
    setLoadingNotas(true);
    setError(null);
    try {
      const params: { horario_id?: number } = {};
      if (filtroHorarioId) params.horario_id = filtroHorarioId;
      const data = await getNotas(cicloActivo.id, params);
      setNotas(data);
    } catch {
      setError('Error al cargar notas');
    } finally {
      setLoadingNotas(false);
    }
  }, [cicloActivo, filtroHorarioId]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchHorarios();
    };
    run();
    return () => { cancelled = true; };
  }, [fetchHorarios]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchNotas();
    };
    run();
    return () => { cancelled = true; };
  }, [fetchNotas]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formHorarioId) {
      setFormError('Selecciona una clase.');
      return;
    }
    if (!formContenido.trim()) {
      setFormError('Escribe el contenido de la nota.');
      return;
    }

    setFormLoading(true);
    try {
      await createNota(cicloActivo!.id, {
        horario_id: formHorarioId,
        fecha: formFecha,
        contenido: formContenido.trim(),
      });
      setFormContenido('');
      setShowForm(false);
      await fetchNotas();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const resp = (err as { response?: { status?: number; data?: Record<string, unknown> } }).response;
        if (resp?.status === 400) {
          setFormError('Ya existe una nota para esta clase y fecha.');
        } else {
          setFormError('Error al crear la nota.');
        }
      } else {
        setFormError('Error al crear la nota.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateNote = async (notaId: number) => {
    if (!editContenido.trim()) return;
    try {
      await updateNota(cicloActivo!.id, notaId, {
        contenido: editContenido.trim(),
      });
      setEditingId(null);
      setEditContenido('');
      await fetchNotas();
    } catch {
      setError('Error al actualizar la nota');
    }
  };

  const handleDeleteNote = async (notaId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta nota?')) return;
    try {
      await deleteNota(cicloActivo!.id, notaId);
      await fetchNotas();
    } catch {
      setError('Error al eliminar la nota');
    }
  };

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState message="Selecciona un ciclo" description="Elige un ciclo académico para ver tus notas." />
      </div>
    );
  }

  if (loadingHorarios) return <Loading message="Cargando..." />;
  if (error && notas.length === 0 && !showForm) return <ErrorState message={error} onRetry={fetchNotas} />;

  return (
    <div style={{
      padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-6)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
          color: 'var(--color-gold)',
          margin: 0,
        }}>
          Notas de Clase
        </h1>
        <button
          onClick={() => { setShowForm(!showForm); setFormError(''); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background: showForm ? 'transparent' : 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
            border: showForm ? '1px solid var(--color-border)' : 'none',
            color: showForm ? 'var(--color-text-secondary)' : '#0a0a0a',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            minHeight: 44,
            transition: 'all 0.15s',
          }}
        >
          {showForm ? 'Cancelar' : 'Nueva nota'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
          marginBottom: 'var(--space-6)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{
            fontSize: 'var(--text-lg)',
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text)',
            margin: 0,
            marginBottom: 'var(--space-4)',
          }}>
            Nueva Nota
          </h2>
          <form onSubmit={handleCreateNote} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 'var(--space-4)',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Clase
                </label>
                <select
                  value={formHorarioId ?? ''}
                  onChange={(e) => setFormHorarioId(e.target.value ? Number(e.target.value) : null)}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--text-sm)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-body)',
                    minHeight: 44,
                  }}
                >
                  {horarios.map((h) => (
                    <option key={h.id} value={h.id}>
                      {DIA_SEMANA_MAP[h.dia_semana]} - {h.taller_nombre}
                    </option>
                  ))}
                </select>
              </div>
              <DatePicker value={formFecha} onChange={setFormFecha} label="Fecha" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Contenido
              </label>
              <textarea
                value={formContenido}
                onChange={(e) => setFormContenido(e.target.value)}
                rows={4}
                placeholder="Escribe tus notas sobre la clase..."
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: 'var(--text-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                  resize: 'vertical',
                  minHeight: 100,
                }}
              />
            </div>
            {formError && (
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-error)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={formLoading || !formContenido.trim()}
              className="btn btn-primary"
              style={{
                alignSelf: 'flex-start',
                padding: 'var(--space-3) var(--space-6)',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                border: 'none',
                color: '#0a0a0a',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                minHeight: 44,
                opacity: formLoading || !formContenido.trim() ? 0.6 : 1,
              }}
            >
              {formLoading ? 'Guardando...' : 'Guardar nota'}
            </button>
          </form>
        </div>
      )}

      {/* Filter */}
      <div style={{
        marginBottom: 'var(--space-4)',
        display: 'flex',
        gap: 'var(--space-4)',
        alignItems: 'flex-end',
        flexDirection: isMobile ? 'column' : 'row',
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Filtrar por clase
          </label>
          <select
            value={filtroHorarioId ?? ''}
            onChange={(e) => setFiltroHorarioId(e.target.value ? Number(e.target.value) : null)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              fontSize: 'var(--text-sm)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              minHeight: 44,
            }}
          >
            <option value="">Todas las clases</option>
            {horarios.map((h) => (
              <option key={h.id} value={h.id}>
                {DIA_SEMANA_MAP[h.dia_semana]} - {h.taller_nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes List */}
      {loadingNotas ? (
        <Loading message="Cargando notas..." />
      ) : notas.length === 0 ? (
        <EmptyState
          message="No hay notas"
          description="Aún no has registrado notas. Crea la primera desde el botón 'Nueva nota'."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {notas.map((nota) => {
            const horarioNota = horarios.find(h => h.id === nota.horario);
            const isEditing = editingId === nota.id;
            return (
              <div key={nota.id} style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: isMobile ? 'var(--space-4)' : 'var(--space-5)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 'var(--space-3)',
                }}>
                  <div>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      margin: 0,
                      marginBottom: 'var(--space-1)',
                    }}>
                      {formatDate(nota.fecha)}
                    </p>
                    {horarioNota && (
                      <p style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-gold)',
                        margin: 0,
                      }}>
                        {DIA_SEMANA_MAP[horarioNota.dia_semana]} - {horarioNota.taller_nombre} ({formatHora(horarioNota.hora_inicio)})
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button
                        onClick={() => { setEditingId(nota.id); setEditContenido(nota.contenido); }}
                        style={iconBtnStyle}
                        aria-label="Editar nota"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(nota.id)}
                        style={{ ...iconBtnStyle, color: '#dc2626' }}
                        aria-label="Eliminar nota"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <textarea
                      value={editContenido}
                      onChange={(e) => setEditContenido(e.target.value)}
                      rows={3}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: 'var(--text-sm)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-body)',
                        resize: 'vertical',
                        minHeight: 80,
                      }}
                    />
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      <button
                        onClick={() => handleUpdateNote(nota.id)}
                        disabled={!editContenido.trim()}
                        style={{
                          padding: 'var(--space-2) var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                          border: 'none',
                          color: '#0a0a0a',
                          fontWeight: 600,
                          fontSize: 'var(--text-sm)',
                          cursor: 'pointer',
                          minHeight: 44,
                        }}
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditContenido(''); }}
                        style={{
                          padding: 'var(--space-2) var(--space-4)',
                          borderRadius: 'var(--radius-md)',
                          background: 'transparent',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-secondary)',
                          fontWeight: 500,
                          fontSize: 'var(--text-sm)',
                          cursor: 'pointer',
                          minHeight: 44,
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {nota.contenido}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

const iconBtnStyle: React.CSSProperties = {
  padding: 'var(--space-2)',
  borderRadius: 'var(--radius-md)',
  background: 'transparent',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 36,
  minWidth: 36,
};

export default NotasPage;
