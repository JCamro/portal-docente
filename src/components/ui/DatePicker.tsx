import React from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  maxDate?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, maxDate }) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {label && (
        <label style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {label}
        </label>
      )}
      <input
        type="date"
        value={value}
        max={maxDate || today}
        onChange={(e) => onChange(e.target.value)}
        className="form-input"
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
      />
    </div>
  );
};

export default React.memo(DatePicker);
