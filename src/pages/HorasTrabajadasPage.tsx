import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getHorasTrabajadasDetalle } from '../api/portalDocente';
import type { HoraTrabajadaDetalleResponse } from '../types';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import DatePicker from '../components/ui/DatePicker';
import SummaryBar from '../components/domain/horarios/SummaryBar';
import HoursWorkedSheet from '../components/domain/horarios/HoursWorkedSheet';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { getTodayString } from '../utils/formatters';
import { DIA_SEMANA_MAP, jsDayToBackendDay } from '../utils/constants';

// ── Session Storage for filter persistence ──
const STORAGE_KEY = 'horas-trabajadas-filtros';

interface StoredFilters {
  fechaDesde: string;
  fechaHasta: string;
  mostrarTodos: boolean;
  incluirNotas: boolean;
}

function loadStoredFilters(): StoredFilters {
  const todayStr = getTodayString();
  const defaults: StoredFilters = { fechaDesde: todayStr, fechaHasta: todayStr, mostrarTodos: false, incluirNotas: true };
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaults, ...parsed };
    }
  } catch { /* ignore parse errors */ }
  return defaults;
}

function saveStoredFilters(filters: StoredFilters): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch { /* ignore storage errors */ }
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDayHeaderPdf(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const backendDay = jsDayToBackendDay(date.getDay());
  const weekday = DIA_SEMANA_MAP[backendDay];
  const monthName = date.toLocaleDateString('es-PE', {
    month: 'long',
    timeZone: 'America/Lima',
  });
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${weekday.toUpperCase()} ${day} DE ${monthName.toUpperCase()} ${year}`;
}

async function exportToPDF(
  data: HoraTrabajadaDetalleResponse,
  _fechaDesde: string,
  _fechaHasta: string,
  profesorNombre: string,
  options: { incluirNotas?: boolean; mostrarEstadoAsistencia?: boolean } = {},
): Promise<void> {
  const { incluirNotas = true, mostrarEstadoAsistencia = false } = options;
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const FONT = 'helvetica';

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const center = pageWidth / 2;
  const maxWidth = pageWidth - margin * 2;
  const lineH = 14;
  let y = 50;

  const checkPage = (needed = 40) => {
    if (y + needed > 780) { doc.addPage(); y = margin; }
  };

  // ── Header centrado ──
  doc.setFont(FONT, 'bold');
  doc.setFontSize(20);
  doc.text('TALLER DE MÚSICA ELGUERA', center, y, { align: 'center' });
  y += 24;
  doc.setFontSize(11);
  doc.setFont(FONT, 'normal');
  doc.text('CONTABILIZACIÓN DE HORAS TRABAJADAS', center, y, { align: 'center' });
  y += 30;

  // ── Info block ──
  doc.setFontSize(11);
  doc.setFont(FONT, 'bold');
  doc.text('DOCENTE:', margin, y);
  doc.setFont(FONT, 'normal');
  doc.text(`  ${profesorNombre}`, margin + 62, y);
  y += lineH + 2;

  doc.setFont(FONT, 'bold');
  doc.text('TALLER:', margin, y);
  // nombres únicos de talleres
  const talleresSet = new Set<string>();
  for (const day of data.days) {
    for (const w of day.talleres) talleresSet.add(w.taller_nombre);
  }
  doc.setFont(FONT, 'normal');
  doc.text(`  ${[...talleresSet].join(', ')}`, margin + 62, y);
  y += lineH + 2;

  // Resumen: solo horas propias
  let totalHorasPropias = 0;
  for (const day of data.days) {
    for (const w of day.talleres) {
      for (const s of w.slots) {
        if (!s.es_sustituto) {
          const [h1, m1] = s.hora_inicio.split(':').map(Number);
          const [h2, m2] = s.hora_fin.split(':').map(Number);
          if (!isNaN(h1) && !isNaN(h2)) {
            totalHorasPropias += (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
          }
        }
      }
    }
  }

  doc.setFont(FONT, 'bold');
  doc.text('RESUMEN DEL PERIODO:', margin, y);
  doc.setFont(FONT, 'normal');
  doc.text(`  ${totalHorasPropias.toFixed(1)} Horas trabajadas en total`, margin + 155, y);
  y += lineH + 20;

  // ── Días ──
  for (const day of data.days) {
    checkPage(60);

    doc.setFontSize(12);
    doc.setFont(FONT, 'bold');
    doc.text(formatDayHeaderPdf(day.fecha), margin, y);
    y += lineH + 6;

    for (const workshop of day.talleres) {
      for (const slot of workshop.slots) {
        checkPage(50);

        const timeLabel = `${slot.hora_inicio}–${slot.hora_fin}`;
        doc.setFontSize(10);
        doc.setFont(FONT, 'bold');
        doc.text(timeLabel, margin, y);

        if (slot.es_sustituto) {
          doc.setFont(FONT, 'normal');
          doc.setFontSize(9);
          const sustText = `  (DICTADA POR ${slot.profesor_que_trabajo} — No contabilizada)`;
          doc.text(sustText, margin + doc.getTextWidth(timeLabel) + 4, y);
        }
        y += lineH;

        // Alumnos con viñetas
        doc.setFontSize(10);
        doc.setFont(FONT, 'normal');
        if (slot.alumnos.length > 0) {
          for (const a of slot.alumnos) {
            if (mostrarEstadoAsistencia) {
              const status = a.estado === 'asistio' ? 'ASISTIO' : 'FALTO';
              doc.text(`\u2022  ${a.nombre_completo} [${status}]`, margin + 16, y);
            } else {
              doc.text(`\u2022  ${a.nombre_completo}`, margin + 16, y);
            }
            y += lineH;
          }
        } else {
          doc.text('\u2022  Sin alumnos registrados', margin + 16, y);
          y += lineH;
        }

        // Nota en itálica (solo si incluirNotas está habilitado)
        if (incluirNotas && slot.nota_clase) {
          checkPage(30);
          doc.setFont(FONT, 'italic');
          doc.setFontSize(9);
          const noteWrapped = doc.splitTextToSize(`NOTA: ${slot.nota_clase}`, maxWidth - 20);
          doc.text(noteWrapped, margin + 16, y);
          y += noteWrapped.length * lineH + 4;
          doc.setFont(FONT, 'normal');
        }

        y += 6;
      }
    }

    y += 10;
  }

  doc.save('horas-trabajadas.pdf');
}

const HorasTrabajadasPage = memo(() => {
  const cicloActivo = useAuthStore((s) => s.cicloActivo);
  const profesor = useAuthStore((s) => s.profesor);
  const profesorNombre = profesor ? `${profesor.nombre} ${profesor.apellido}` : '';
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // ── Filter state with sessionStorage persistence ──
  const [storedFilters] = useState<StoredFilters>(() => loadStoredFilters());
  const [data, setData] = useState<HoraTrabajadaDetalleResponse | null>(null);
  const [loading, setLoading] = useState(false); // Start false, no auto-fetch
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [fechaDesde, setFechaDesde] = useState(storedFilters.fechaDesde);
  const [fechaHasta, setFechaHasta] = useState(storedFilters.fechaHasta);
  const [mostrarTodos, setMostrarTodos] = useState(storedFilters.mostrarTodos);
  const [hasSearched, setHasSearched] = useState(false); // Track if user has clicked Calcular

  // ── Calcular button handler ──
  const handleCalcular = useCallback(async () => {
    if (!cicloActivo) return;

    // Save filters to sessionStorage
    saveStoredFilters({ fechaDesde, fechaHasta, mostrarTodos, incluirNotas: pdfIncluirNotas });

    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const params: { fecha_desde?: string; fecha_hasta?: string; mostrar_todos?: boolean } = {};
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      if (mostrarTodos) params.mostrar_todos = true;
      const response = await getHorasTrabajadasDetalle(cicloActivo.id, params);
      setData(response);
    } catch {
      setError('Error al cargar horas trabajadas');
    } finally {
      setLoading(false);
    }
  }, [cicloActivo, fechaDesde, fechaHasta, mostrarTodos]);

  // ── Limpiar button handler ──
  const handleLimpiar = useCallback(() => {
    const today = getTodayString();
    setFechaDesde(today);
    setFechaHasta(today);
    setMostrarTodos(false);
    setData(null);
    setHasSearched(false);
    setError(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  // ── Auto-fetch on first load if stored filters exist ──
  useEffect(() => {
    if (cicloActivo && !hasSearched && data === null) {
      // Only auto-fetch if we have stored filters different from defaults
      const today = getTodayString();
      const hasStoredFilters = storedFilters.fechaDesde !== today ||
        storedFilters.fechaHasta !== today ||
        storedFilters.mostrarTodos;
      if (hasStoredFilters) {
        handleCalcular();
      }
    }
  }, [cicloActivo, hasSearched, data, storedFilters, handleCalcular]);

  // ── Re-fetch when mostrarTodos changes (if data already loaded) ──
  useEffect(() => {
    if (hasSearched && data !== null) {
      handleCalcular();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarTodos]);

  // ── PDF options ──
  const [pdfIncluirNotas, setPdfIncluirNotas] = useState(storedFilters.incluirNotas);

  // Save incluirNotas to sessionStorage when it changes
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      const current = stored ? JSON.parse(stored) : {};
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, incluirNotas: pdfIncluirNotas }));
    } catch { /* ignore */ }
  }, [pdfIncluirNotas]);

  const handleExportPDF = async () => {
    if (!data || data.days.length === 0) return;
    setPdfLoading(true);
    try {
      await exportToPDF(data, fechaDesde, fechaHasta, profesorNombre, {
        incluirNotas: pdfIncluirNotas,
        mostrarEstadoAsistencia: mostrarTodos,
      });
    } finally {
      setPdfLoading(false);
    }
  };

  if (!cicloActivo) {
    return (
      <div style={{ padding: 'var(--space-lg)' }}>
        <EmptyState
          message="Selecciona un ciclo"
          description="Elige un ciclo académico para ver tus horas trabajadas."
        />
      </div>
    );
  }

  if (loading && !data) {
    return <Loading message="Cargando horas trabajadas..." />;
  }

  if (error && !data) {
    return <ErrorState message={error} onRetry={handleCalcular} />;
  }

  const hasRecords = data && data.days.length > 0;

  return (
    <div
      style={{
        padding: isMobile ? 'var(--space-4)' : 'var(--space-6)',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
          color: 'var(--color-gold)',
          margin: 0,
          marginBottom: 'var(--space-6)',
        }}
      >
        Horas Trabajadas
      </h1>

      {/* Filters */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: isMobile ? 'var(--space-4)' : 'var(--space-5)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 150 }}>
            <DatePicker value={fechaDesde} onChange={setFechaDesde} label="Desde" maxDate={maxDateStr} />
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <DatePicker value={fechaHasta} onChange={setFechaHasta} label="Hasta" maxDate={maxDateStr} />
          </div>

          {/* Toggle: Mostrar todos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Opciones
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                minHeight: 44,
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={mostrarTodos}
                onChange={(e) => setMostrarTodos(e.target.checked)}
                style={{
                  width: 16,
                  height: 16,
                  accentColor: 'var(--color-gold)',
                  cursor: 'pointer',
                }}
              />
              <span>Mostrar faltantes</span>
            </label>
          </div>

          {/* Calcular button */}
          <button
            onClick={handleCalcular}
            disabled={loading || !cicloActivo}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-5)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: loading || !cicloActivo ? 'var(--color-border)' : 'var(--color-gold)',
              color: loading || !cicloActivo ? 'var(--color-text-muted)' : '#0a0a0a',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: loading || !cicloActivo ? 'not-allowed' : 'pointer',
              minHeight: 44,
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Cargando...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                Calcular
              </>
            )}
          </button>

          {/* Limpiar button */}
          <button
            onClick={handleLimpiar}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-5)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              minHeight: 44,
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 150ms ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Limpiar
          </button>
        </div>
      </div>

      {/* Export PDF options - only show when there are records */}
      {hasRecords && (
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: isMobile ? 'var(--space-3)' : 'var(--space-4)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: isMobile ? 'var(--space-3)' : 'var(--space-4)',
            alignItems: isMobile ? 'stretch' : 'center',
          }}
        >
          {isMobile ? (
            <>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={pdfIncluirNotas}
                  onChange={(e) => setPdfIncluirNotas(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--color-gold)', cursor: 'pointer' }}
                />
                Incluir notas en el PDF
              </label>
              <button
                onClick={handleExportPDF}
                disabled={pdfLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-gold)',
                  background: 'transparent',
                  color: 'var(--color-gold)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: pdfLoading ? 'not-allowed' : 'pointer',
                  opacity: pdfLoading ? 0.6 : 1,
                  width: '100%',
                }}
              >
                {pdfLoading ? 'Generando...' : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                      <path d="M12 17v-6" />
                      <path d="M9.5 14.5 12 17l2.5-2.5" />
                    </svg>
                    Exportar PDF
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Opciones PDF:
              </span>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={pdfIncluirNotas}
                  onChange={(e) => setPdfIncluirNotas(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--color-gold)', cursor: 'pointer' }}
                />
                Incluir notas
              </label>
              {mostrarTodos && (
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    fontStyle: 'italic',
                  }}
                >
                  (asistencia ✓/✗ se muestra automáticamente)
                </span>
              )}
              <button
                onClick={handleExportPDF}
                disabled={pdfLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3) var(--space-5)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-gold)',
                  background: 'transparent',
                  color: 'var(--color-gold)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  cursor: pdfLoading ? 'not-allowed' : 'pointer',
                  opacity: pdfLoading ? 0.6 : 1,
                  marginLeft: 'auto',
                }}
              >
                {pdfLoading ? 'Generando...' : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                      <path d="M12 17v-6" />
                      <path d="M9.5 14.5 12 17l2.5-2.5" />
                    </svg>
                    Exportar PDF
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Empty state - show different message based on whether user has searched */}
      {!hasRecords && !loading && (
        <EmptyState
          message={hasSearched ? "No hay horas en este período." : "Seleccioná fechas y hacé clic en Calcular."}
          description={hasSearched ? "Probá con otras fechas o activá 'Mostrar faltantes'." : "Usá los filtros de arriba para buscar tus horas trabajadas."}
        />
      )}

      {hasRecords && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}
        >
          <SummaryBar summary={data.summary} />
          <HoursWorkedSheet data={data} cicloId={cicloActivo.id} />
        </div>
      )}
    </div>
  );
});

export default HorasTrabajadasPage;
