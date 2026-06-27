import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { TIMEZONES, getStoredTimezone, setTimezone } from '../api';

interface TimezoneSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onTimezoneChange: (tz: string) => void;
}

export default function TimezoneSettings({ isOpen, onClose, onTimezoneChange }: TimezoneSettingsProps) {
  const [selected, setSelected] = useState(getStoredTimezone);

  useEffect(() => {
    setSelected(getStoredTimezone());
  }, [isOpen]);

  function handleSelect(tzId: string) {
    setSelected(tzId);
    setTimezone(tzId);
    onTimezoneChange(tzId);
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      {/* Modal */}
      <div
        style={{
          position: 'relative',
          background: '#1E1E1E',
          borderRadius: 12,
          width: '90%',
          maxWidth: 420,
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #333',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #333',
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Timezone</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={22} />
          </button>
        </div>
        {/* Timezone list */}
        <div
          style={{
            overflowY: 'auto',
            padding: '8px 0',
            flex: 1,
          }}
        >
          {TIMEZONES.map((tz) => {
            const isSelected = tz.id === selected;
            return (
              <button
                key={tz.id}
                onClick={() => handleSelect(tz.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  background: isSelected ? 'rgba(0, 210, 106, 0.1)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: 15,
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#2A2A2A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSelected ? 'rgba(0, 210, 106, 0.1)' : 'transparent';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>{tz.label}</span>
                  <span style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{tz.id}</span>
                </div>
                {isSelected && <Check size={20} color="#00D26A" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
