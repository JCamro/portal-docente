import { memo, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  getNotasDia, createNotaDia, updateNotaDia, deleteNotaDia,
  getNotas,
} from '../api/portalDocente';
import { useNotasPaginated } from '../hooks/useNotasPaginated';
import { useWindowWidth } from '../hooks/useWindowWidth';
import type { NotaDia, NotaClase } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import NotaCard from '../components/domain/NotaCard';
import NotaDayGroup from '../components/domain/NotaDayGroup';
import Pagination from '../components/domain/Pagination';
import { getTodayString } from '../utils/formatters';

type Tab = 'generales' | 'clase';

const PAGE_SIZE = 20;

function groupByDate<T extends { fecha: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const arr = map.get(item.fecha) ?? [];
    arr.push(item);
    map.set(item.fecha, arr);
  }
  return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

const NotesPage = memo(() => {
  const navigate = useNavigate();
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [activeTab, setActiveTab] = useState<Tab>('generales');
  const [showForm, setShowForm] = useState(false);

  // ── Generales ──
  const [genTitulo, setGenTitulo] = useState('');
  const [genContenido, setGenContenido] = useState('');
  const [genFecha, setGenFecha] = useState(getTodayString());
  const [editingGen, setEditingGen] = useState<NotaDia | null>(null);

  const genFetch = useCallback(
    (cid: number, params?: Record<string, string | number>) => getNotasDia(cid, params),
    []
  );
  const {
    items: genItems, count: genCount, page: genPage, setPage: setGenPage,
    loading: genLoading, error: genError, refetch: genRefetch,
  } = useNotasPaginated<NotaDia>({ cicloId: cicloActivo?.id ?? null, fetchFn: genFetch });

  // ── Clase (read-only) ──
  const [notasClase, setNotasClase] = useState<NotaClase[]>([]);
  const [claseCount, setClaseCount] = useState(0);
  const [clasePage, setClasePage] = useState(1);
  const [claseLoading, setClaseLoading] = useState(false);
  const [claseError, setClaseError] = useState<string | null>(null);

  const fetchClase = useCallback(async (page: number) => {
    if (!cicloActivo) return;
    setClaseLoading(true);
    setClaseError(null);
    try {
      const notasRes = await getNotas(cicloActivo.id, { page });
      setNotasClase(notasRes.results);
      setClaseCount(notasRes.count);
    } catch {
      setClaseError('Error al cargar notas de clase');
    } finally {
      setClaseLoading(false);
    }
  }, [cicloActivo]);

  // ── Derived data ──
  const genGroups = useMemo(() => groupByDate(genItems), [genItems]);
  const claseGroups = useMemo(() => groupByDate(notasClase), [notasClase]);

  const genTotalPages = Math.max(1, Math.ceil(genCount / PAGE_SIZE));
  const claseTotalPages = Math.max(1, Math.ceil(claseCount / PAGE_SIZE));

  // ── Tab switch ──
  const switchTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setShowForm(false);
    if (tab === 'clase' && notasClase.length === 0) fetchClase(1);
  }, [notasClase.length, fetchClase]);

  // ── Create handlers ──
  const handleCreateGen = useCallback(async () => {
    if (!cicloActivo || !genTitulo.trim()) return;
    try {
      await createNotaDia(cicloActivo.id, { titulo: genTitulo.trim(), contenido: genContenido.trim() || undefined });
      setGenTitulo('');
      setGenContenido('');
      setGenFecha(getTodayString());
      setShowForm(false);
      genRefetch();
    } catch { /* */ }
  }, [cicloActivo, genTitulo, genContenido, genRefetch]);

  // ── Edit handlers ──
  const handleSaveEditGen = useCallback(async () => {
    if (!cicloActivo || !editingGen) return;
    try {
      await updateNotaDia(cicloActivo.id, editingGen.id, { titulo: editingGen.titulo, contenido: editingGen.contenido });
      setEditingGen(null);
      setShowForm(false);
      genRefetch();
    } catch { /* */ }
  }, [cicloActivo, editingGen, genRefetch]);

  // ── Delete handler ──
  const handleDeleteGen = useCallback(async (id: number, titulo: string) => {
    if (!window.confirm(`¿Eliminar nota "${titulo}"?`)) return;
    if (!cicloActivo) return;
    await deleteNotaDia(cicloActivo.id, id);
    genRefetch();
  }, [cicloActivo, genRefetch]);

  // ── Go to horarios ──
  const handleGoToHorarios = useCallback((fecha: string, horarioId: number) => {
    navigate(`/horarios?fecha=${fecha}&horario=${horarioId}`);
  }, [navigate]);

  // ── Shared input style ──
  const inputStyle: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--text-sm)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    width: '100%',
    boxSizing: 'border-box',
  };

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState message="Selecciona un ciclo" description="Elige un ciclo académico para ver tus notas." />
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'generales', label: 'Generales' },
    { key: 'clase', label: 'Clase' },
  ];

  return (
    <div style={{
      padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
      maxWidth: 900,
      margin: '0 auto',
    }}>
      {/* Header */}
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
        {activeTab === 'generales' && (
          <button
            onClick={() => { setShowForm(true); setEditingGen(null); }}
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
            Nueva
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '2px solid var(--color-border)',
        marginBottom: 'var(--space-5)',
      }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            style={{
              flex: 1,
              padding: 'var(--space-3) var(--space-4)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === t.key ? '2px solid var(--color-gold)' : '2px solid transparent',
              marginBottom: '-2px',
              color: activeTab === t.key ? 'var(--color-gold)' : 'var(--color-text-muted)',
              fontWeight: activeTab === t.key ? 600 : 400,
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              textAlign: 'center',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Create / Edit form — Generales only */}
      {showForm && activeTab === 'generales' && (
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          border: '1px solid var(--color-gold)',
          marginBottom: 'var(--space-4)',
        }}>
          <h4 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            color: 'var(--color-gold)',
            fontFamily: 'var(--font-heading)',
            margin: 0,
            marginBottom: 'var(--space-3)',
          }}>
            {editingGen ? 'Editar nota' : 'Nueva nota'}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <input
              type="date"
              value={editingGen?.fecha ?? genFecha}
              onChange={(e) => editingGen ? setEditingGen({ ...editingGen, fecha: e.target.value }) : setGenFecha(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              value={editingGen?.titulo ?? genTitulo}
              onChange={(e) => editingGen ? setEditingGen({ ...editingGen, titulo: e.target.value }) : setGenTitulo(e.target.value)}
              placeholder="Título (requerido)"
              style={inputStyle}
            />
            <textarea
              value={editingGen?.contenido ?? genContenido}
              onChange={(e) => editingGen ? setEditingGen({ ...editingGen, contenido: e.target.value }) : setGenContenido(e.target.value)}
              rows={3}
              placeholder="Contenido (opcional)"
              style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingGen(null); }}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-text-muted)',
                  fontWeight: 500,
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  minHeight: 44,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={editingGen ? handleSaveEditGen : handleCreateGen}
                disabled={!(editingGen?.titulo ?? genTitulo).trim()}
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
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {/* ── Generales ── */}
      {activeTab === 'generales' && (
        <>
          {genLoading && <Loading message="Cargando notas..." />}
          {genError && <ErrorState message={genError} onRetry={genRefetch} />}
          {!genLoading && !genError && genItems.length === 0 && (
            <EmptyState message="No tienes notas generales" description="Crea una nota para registrar observaciones del día." />
          )}
          {!genLoading && !genError && genItems.length > 0 && (
            <>
              {[...genGroups.entries()].map(([date, items]) => (
                <NotaDayGroup key={date} date={date}>
                  {items.map((n) => (
                    <NotaCard
                      key={n.id}
                      type="general"
                      titulo={n.titulo}
                      contenido={n.contenido || undefined}
                      fecha={n.fecha}
                      onEdit={() => { setEditingGen(n); setShowForm(true); }}
                      onDelete={() => handleDeleteGen(n.id, n.titulo)}
                    />
                  ))}
                </NotaDayGroup>
              ))}
              <Pagination currentPage={genPage} totalPages={genTotalPages} onPageChange={setGenPage} />
            </>
          )}
        </>
      )}

      {/* ── Clase ── */}
      {activeTab === 'clase' && (
        <>
          {claseLoading && <Loading message="Cargando notas de clase..." />}
          {claseError && <ErrorState message={claseError} onRetry={() => fetchClase(clasePage)} />}
          {!claseLoading && !claseError && notasClase.length === 0 && (
            <EmptyState message="No tienes notas de clase" description="Crea una nota para registrar observaciones de una clase." />
          )}
          {!claseLoading && !claseError && notasClase.length > 0 && (
            <>
              {[...claseGroups.entries()].map(([date, items]) => (
                <NotaDayGroup key={date} date={date}>
                  {items.map((n) => (
                    <NotaCard
                      key={n.id}
                      type="clase"
                      titulo={n.taller_nombre}
                      contenido={n.contenido}
                      fecha={n.fecha}
                      tallerNombre={n.taller_nombre}
                      onGoToHorarios={() => handleGoToHorarios(n.fecha, n.horario)}
                    />
                  ))}
                </NotaDayGroup>
              ))}
              <Pagination currentPage={clasePage} totalPages={claseTotalPages} onPageChange={(p) => { setClasePage(p); fetchClase(p); }} />
            </>
          )}
        </>
      )}
    </div>
  );
});

export default NotesPage;
