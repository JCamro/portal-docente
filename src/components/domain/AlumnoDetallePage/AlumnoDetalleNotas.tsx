import { memo } from 'react';
import { cardStyle, sectionLabel } from './utils';
import NoteEditor from '../NoteEditor';

interface Props {
  content: string;
  onSave: (content: string) => Promise<void>;
}

const AlumnoDetalleNotas = memo(({ content, onSave }: Props) => {
  return (
    <div style={cardStyle}>
      <div style={{ ...sectionLabel, marginBottom: 'var(--space-3)' }}>
        Nota del alumno
      </div>
      <NoteEditor
        value={content}
        onSave={onSave}
        placeholder="Escribe una nota sobre este alumno..."
      />
    </div>
  );
});

export default AlumnoDetalleNotas;
