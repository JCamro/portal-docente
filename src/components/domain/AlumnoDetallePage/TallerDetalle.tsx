import { memo } from 'react';
import AlumnoDetalleProgreso from './AlumnoDetalleProgreso';
import AlumnoDetalleStats from './AlumnoDetalleStats';
import AlumnoDetalleAsistencias from './AlumnoDetalleAsistencias';
import type { AlumnoDetalle } from '../../../types';

interface Props {
  detalle: AlumnoDetalle;
  selectedTallerId: number | null;
  onSelectTaller: (id: number) => void;
}

const TallerDetalle = memo(({ detalle, selectedTallerId, onSelectTaller }: Props) => {
  const ma = detalle.matricula_activa;

  return (
    <>
      {ma && (
        <AlumnoDetalleProgreso
          sesionesConsumidas={ma.sesiones_consumidas}
          sesionesContratadas={ma.sesiones_contratadas}
          sesionesDisponibles={ma.sesiones_disponibles}
        />
      )}
      <AlumnoDetalleStats
        estadisticas={detalle.estadisticas}
        estadisticasPorTaller={detalle.estadisticas_por_taller}
        selectedTallerId={selectedTallerId}
        onSelectTaller={onSelectTaller}
      />
      {selectedTallerId && ma && (
        <AlumnoDetalleAsistencias
          asistencias={ma.asistencias}
        />
      )}
    </>
  );
});

export default TallerDetalle;
