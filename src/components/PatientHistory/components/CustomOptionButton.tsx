'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CustomOptionButtonProps {
  onConfirm: (value: string) => void | Promise<void>;
  loading?: boolean;
  placeholder?: string;
  popupTitle?: string;
}

const CustomOptionButton: React.FC<CustomOptionButtonProps> = ({
  onConfirm,
  loading = false,
  placeholder = 'Enter condition name',
  popupTitle = 'Add Custom Condition'
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleConfirm = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    await onConfirm(trimmed);
    setValue('');
    setOpen(false);
  };

  const handleCancel = () => {
    setValue('');
    setOpen(false);
  };

  return (
    <div style={{ display: 'inline-block' }}>
      {/* Dashed pill button — matches design screenshot */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 18px',
          border: '1.5px dashed #60a5fa', // blue dashed border
          borderRadius: 999, // pill shape
          background: 'transparent',
          color: '#3b82f6', // blue text
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          letterSpacing: 0.1
        }}
      >
        + Custom Option
      </button>

      {/* Inline popup — appears directly below the button, not a modal */}
      {open && (
        <div
          style={{
            marginTop: 12,
            padding: '20px 20px 16px',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            width: 280,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          {/* Title */}
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: '#111827'
            }}
          >
            {popupTitle}
          </h3>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
              if (e.key === 'Escape') handleCancel();
            }}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #374151',
              borderRadius: 4,
              fontSize: 14,
              color: '#374151',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          {/* Buttons row */}
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Cancel — plain text grey */}
            <button
              type="button"
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: '8px 0',
                background: 'transparent',
                border: 'none',
                fontSize: 14,
                color: '#6b7280',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Cancel
            </button>

            {/* Add — blue/periwinkle fill matching design */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!value.trim() || loading}
              style={{
                flex: 1,
                padding: '8px 0',
                background: !value.trim() || loading ? '#a5b4fc' : '#6366f1',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                cursor: !value.trim() || loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s'
              }}
            >
              {loading ? '…' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomOptionButton;
