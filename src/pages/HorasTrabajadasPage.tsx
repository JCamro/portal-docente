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
): Promise<void> {
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
            doc.text(`•   ${a.nombre_completo}`, margin + 16, y);
            y += lineH;
          }
        } else {
          doc.text('•   Sin alumnos registrados', margin + 16, y);
          y += lineH;
        }

        // Nota en itálica
        if (slot.nota_clase) {
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

  const todayStr = getTodayString();
  const maxDateStr = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [data, setData] = useState<HoraTrabajadaDetalleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [fechaDesde, setFechaDesde] = useState(todayStr);
  const [fechaHasta, setFechaHasta] = useState(todayStr);

  const fetchData = useCallback(async () => {
    if (!cicloActivo) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params: { fecha_desde?: string; fecha_hasta?: string } = {};
      if (fechaDesde) params.fecha_desde = fechaDesde;
      if (fechaHasta) params.fecha_hasta = fechaHasta;
      const response = await getHorasTrabajadasDetalle(cicloActivo.id, params);
      setData(response);
    } catch {
      setError('Error al cargar horas trabajadas');
    } finally {
      setLoading(false);
    }
  }, [cicloActivo, fechaDesde, fechaHasta]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await fetchData();
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  const handleExportPDF = async () => {
    if (!data || data.days.length === 0) return;
    setPdfLoading(true);
    try {
      await exportToPDF(data, fechaDesde, fechaHasta, profesorNombre);
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
    return <ErrorState message={error} onRetry={fetchData} />;
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
          display: 'flex',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'flex-end',
        }}
      >
        <div style={{ flex: 1, minWidth: 150 }}>
          <DatePicker value={fechaDesde} onChange={setFechaDesde} label="Desde" maxDate={maxDateStr} />
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <DatePicker value={fechaHasta} onChange={setFechaHasta} label="Hasta" maxDate={maxDateStr} />
        </div>
        <button
          onClick={handleExportPDF}
          disabled={pdfLoading || !hasRecords}
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
            cursor: hasRecords ? 'pointer' : 'not-allowed',
            minHeight: 44,
            opacity: pdfLoading || !hasRecords ? 0.6 : 1,
            transition: 'opacity 150ms ease',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          {pdfLoading ? 'Generando PDF...' : 'Exportar PDF'}
        </button>
      </div>

      {!hasRecords ? (
        <EmptyState
          message="No tenés horas registradas en este período."
          description="Contactá a secretaría para crear tu hora trabajada."
        />
      ) : (
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
