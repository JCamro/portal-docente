import { memo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getAlumnoDetalle, getNotasAlumno, createNotaAlumno, updateNotaAlumno } from '../api/portalDocente';
import Loading from '../components/ui/Loading';
import {
  AlumnoDetalleHeader,
  AlumnoDetalleHorario,
  AlumnoDetalleNotas,
  AlumnoDetalleHistoricas,
  AlumnoDetalleTallerSelector,
  TallerDetalle,
} from '../components/domain/AlumnoDetallePage';
import type { AlumnoDetalle, TallerActivo, NotaAlumno } from '../types';

const backBtnStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-4)',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--color-border)',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  minHeight: 40,
  marginBottom: 'var(--space-4)',
  display: 'inline-flex',
  alignItems: 'center',
};

const arrowLeft: React.CSSProperties = {
  width: 0,
  height: 0,
  borderTop: '4px solid transparent',
  borderBottom: '4px solid transparent',
  borderRight: '5px solid currentColor',
  display: 'inline-block',
  marginRight: 'var(--space-2)',
};

const AlumnoDetallePage = memo(() => {
  const { alumnoId } = useParams<{ alumnoId: string }>();
  const navigate = useNavigate();
  const cicloActivo = useAuthStore((s) => s.cicloActivo);

  const [detalle, setDetalle] = useState<AlumnoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTallerId, setSelectedTallerId] = useState<number | null>(null);
  const [talleresActivosCache, setTalleresActivosCache] = useState<TallerActivo[] | null>(null);
  const [notasAlumno, setNotasAlumno] = useState<NotaAlumno[]>([]);

  const id = alumnoId ? Number(alumnoId) : null;

  // Initial fetch (once on mount)
  useEffect(() => {
    if (!id || !cicloActivo) { setLoading(false); return; }

    let cancelled = false;
    const fetchDetalle = async () => {
      setLoading(true);
      try {
        const data = await getAlumnoDetalle(cicloActivo.id, id);
        if (cancelled) return;
        setDetalle(data);
        if (data.talleres_activos) {
          const seen = new Map<number, TallerActivo>();
          for (const t of data.talleres_activos) {
            if (!seen.has(t.taller_id)) seen.set(t.taller_id, t);
          }
          setTalleresActivosCache(Array.from(seen.values()));
        }
      } catch {
        if (!cancelled) setDetalle(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetalle();
    return () => { cancelled = true; };
  }, [id, cicloActivo]);

  // Re-fetch focused data when taller is selected (no full-page loading)
  useEffect(() => {
    if (!id || !cicloActivo || !selectedTallerId) return;

    let cancelled = false;
    const fetchFocused = async () => {
      try {
        const data = await getAlumnoDetalle(cicloActivo.id, id, selectedTallerId);
        if (cancelled) return;
        // Merge focused stats into existing detalle
        setDetalle((prev) => prev ? { ...prev, estadisticas: data.estadisticas } : prev);
      } catch {
        // ignore — keep existing data
      }
    };
    fetchFocused();
    return () => { cancelled = true; };
  }, [id, cicloActivo, selectedTallerId]);

  useEffect(() => {
    if (!id || !cicloActivo) return;
    let cancelled = false;
    const fetchNotas = async () => {
      try {
        const res = await getNotasAlumno(cicloActivo.id, { alumno_id: id });
        if (!cancelled) setNotasAlumno(res.results);
      } catch { /* ignore */ }
    };
    fetchNotas();
    return () => { cancelled = true; };
  }, [id, cicloActivo]);

  // Auto-select when only one taller exists
  useEffect(() => {
    if (detalle?.estadisticas_por_taller?.length === 1 && !selectedTallerId) {
      setSelectedTallerId(detalle.estadisticas_por_taller[0].taller_id);
    }
  }, [detalle, selectedTallerId]);

  const existingNota = notasAlumno.length > 0 ? notasAlumno[0] : null;

  const handleSaveNotaAlumno = async (content: string) => {
    if (!id || !detalle || !cicloActivo) return;
    if (existingNota) {
      await updateNotaAlumno(cicloActivo.id, existingNota.id, { contenido: content });
    } else {
      await createNotaAlumno(cicloActivo.id, {
        horario: detalle.matricula_activa?.horario_id ?? detalle.matricula_activa?.id ?? 0,
        alumno: id,
        fecha: new Date().toISOString().split('T')[0],
        contenido: content,
      });
    }
    const updated = await getNotasAlumno(cicloActivo.id, { alumno_id: id });
    setNotasAlumno(updated.results);
  };

  if (loading) return <Loading message="Cargando detalle..." />;
  if (!detalle) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 900, margin: '0 auto' }}>
        <button onClick={() => navigate('/alumnos')} style={backBtnStyle}>
          <span style={arrowLeft} />
          Volver a Mis Alumnos
        </button>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
          Alumno no encontrado.
        </p>
      </div>
    );
  }

  const handleSelectTaller = (id: number) => setSelectedTallerId(id);
  const handleClearTaller = () => setSelectedTallerId(null);

  return (
    <div style={{
      padding: 'var(--space-6)',
      maxWidth: 900,
      margin: '0 auto',
    }}>
      <button onClick={() => navigate('/alumnos')} style={backBtnStyle}>
        <span style={arrowLeft} />
        Volver a Mis Alumnos
      </button>

      {detalle.alumno && <AlumnoDetalleHeader alumno={detalle.alumno} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <AlumnoDetalleNotas
          content={existingNota?.contenido || ''}
          onSave={handleSaveNotaAlumno}
        />

        {talleresActivosCache && (
          <AlumnoDetalleTallerSelector
            talleres={talleresActivosCache}
            selectedTallerId={selectedTallerId}
            onSelect={(val) => setSelectedTallerId(val)}
          />
        )}

        {selectedTallerId && talleresActivosCache && talleresActivosCache.length > 1 && (
          <button
            onClick={handleClearTaller}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-gold)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              minHeight: 40,
              alignSelf: 'flex-start',
            }}
          >
            Ver todos los talleres
          </button>
        )}

        {detalle.matricula_activa && (
          <AlumnoDetalleHorario
            tallerNombre={detalle.matricula_activa.taller_nombre}
            horarios={detalle.matricula_activa.horarios}
          />
        )}

        <TallerDetalle
          detalle={detalle}
          selectedTallerId={selectedTallerId}
          onSelectTaller={handleSelectTaller}
        />

        <AlumnoDetalleHistoricas matriculasHistoricas={detalle.matriculas_historicas} />
      </div>
    </div>
  );
});

export default AlumnoDetallePage;
