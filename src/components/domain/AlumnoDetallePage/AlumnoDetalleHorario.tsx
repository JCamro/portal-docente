import { memo } from 'react';
import { cardStyle, sectionLabel, DIA_SEMANA_MAP } from './utils';

interface HorarioItem {
  horario_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

interface Props {
  tallerNombre: string;
  horarios: HorarioItem[] | null;
}

const AlumnoDetalleHorario = memo(({ tallerNombre, horarios }: Props) => {
  return (
    <div style={cardStyle}>
      <div style={sectionLabel}>Horario Activo</div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
        <strong style={{ color: 'var(--color-text)' }}>Taller:</strong> {tallerNombre}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {horarios && horarios.length > 0 ? (
          horarios.map((h) => (
            <div
              key={h.horario_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg)',
              }}
            >
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', minWidth: 90 }}>
                {DIA_SEMANA_MAP[h.dia_semana] ?? '—'}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                {h.hora_inicio?.slice(0, 5) ?? '—'} – {h.hora_fin?.slice(0, 5) ?? '—'}
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>Sin horario asignado</div>
        )}
      </div>
    </div>
  );
});

export default AlumnoDetalleHorario;
