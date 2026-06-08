import React from 'react';
import type { Condition } from '../types/patientHistory.types';

interface ConditionCheckboxProps {
  condition: Condition;
  onChange: (id: number) => void;
}

const ConditionCheckbox: React.FC<ConditionCheckboxProps> = ({
  condition,
  onChange
}) => {
  const { id, conditionName, isConditionSelected, isApiChecked } = condition;
  const checked = isConditionSelected === 1;
  const locked = !!isApiChecked;

  const bg = locked ? '#c8d0dc' : checked ? '#16a34a' : '#ffffff';
  const border = locked ? '#8a96a8' : checked ? '#16a34a' : '#8a96a8';
  const tick = locked ? '#6b7585' : '#ffffff';
  const text = locked ? '#6b7585' : '#1a2030';

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '3px 0', // ← just vertical spacing, no bg
        cursor: locked ? 'default' : 'pointer',
        userSelect: 'none',
        fontSize: 14,
        color: text,
        minHeight: 28
      }}
    >
      {/* Hidden native checkbox for form/a11y */}
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {
          if (!locked) onChange(id);
        }}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Custom visual checkbox */}
      <div
        role="checkbox"
        aria-checked={checked}
        aria-label={conditionName}
        tabIndex={locked ? -1 : 0}
        onKeyDown={(e) => {
          if (!locked && (e.key === ' ' || e.key === 'Enter')) onChange(id);
        }}
        style={{
          width: 17,
          height: 17,
          borderRadius: 4,
          border: `2px solid ${border}`,
          background: bg,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 0.15s, border-color 0.15s'
        }}
      >
        <svg
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
          style={{ visibility: checked ? 'visible' : 'hidden' }}
        >
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke={tick}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <span style={{ lineHeight: 1.4 }}>{conditionName}</span>
    </label>
  );
};

export default ConditionCheckbox;
