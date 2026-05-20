'use client';

import React from 'react';
import CustomOptionButton from './CustomOptionButton';
import type {
  SectionData,
  SavingStatus,
  SurgicalCondition
} from '../types/patientHistory.types';

interface Props {
  sectionData: SectionData;
  onToggle: (id: number) => void;
  onSetDate: (id: number, date: string) => void;
  onAddCustom: (name: string) => Promise<void>;
  saving: SavingStatus;
}

const SurgicalRow: React.FC<{
  c: SurgicalCondition;
  onToggle: (id: number) => void;
  onSetDate: (id: number, date: string) => void;
}> = ({ c, onToggle, onSetDate }) => (
  <div
    style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}
  >
    {/* Checkbox */}
    <input
      type="checkbox"
      checked={c.isConditionSelected === 1}
      onChange={() => {
        if (!c.isApiChecked) onToggle(c.id);
      }}
      style={{
        width: 16,
        height: 16,
        accentColor: c.isConditionSelected === 1 ? '#16a34a' : '#3b82f6',
        flexShrink: 0,
        cursor: c.isApiChecked ? 'default' : 'pointer'
      }}
    />

    {/* Condition name */}
    <span style={{ fontSize: 14, color: '#1f2937', flex: 1, minWidth: 0 }}>
      {c.conditionName}
    </span>

    {/* Date input
    <input
      type="date"
      value={c.surgeryDate ?? ''}
      onChange={(e) => onSetDate(c.id, e.target.value)}
      style={{
        padding: '4px 8px',
        border: '1px solid #d1d5db',
        borderRadius: 4,
        fontSize: 13,
        color: c.surgeryDate ? '#374151' : '#9ca3af',
        width: 140,
        flexShrink: 0,
        background: '#fff'
      }}
    /> */}
  </div>
);

const SurgicalHistorySection: React.FC<Props> = ({
  sectionData,
  onToggle,
  onSetDate,
  onAddCustom,
  saving
}) => {
  const conditions = sectionData.surgicalConditions;
  const half = Math.ceil(conditions.length / 2);
  const left = conditions.slice(0, half);
  const right = conditions.slice(half);

  return (
    <div className="ph-section">
      <h2 className="ph-section-title">Surgical History</h2>
      <p className="ph-section-subtitle">
        List the most recent dates for any Surgeries/Exams of the following
      </p>

      <div className="ph-card" style={{ padding: 20 }}>
        {/* 2-col grid: each cell has [checkbox  name  date] inline */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0 32px',
            marginBottom: 20
          }}
        >
          <div>
            {left.map((c) => (
              <SurgicalRow
                key={c.id}
                c={c}
                onToggle={onToggle}
                onSetDate={onSetDate}
              />
            ))}
          </div>
          <div>
            {right.map((c) => (
              <SurgicalRow
                key={c.id}
                c={c}
                onToggle={onToggle}
                onSetDate={onSetDate}
              />
            ))}
          </div>
        </div>

        <CustomOptionButton
          onConfirm={onAddCustom}
          loading={saving === 'saving'}
          placeholder="Enter surgery / procedure name"
          popupTitle="Add Custom Surgery"
        />
      </div>
    </div>
  );
};

export default SurgicalHistorySection;
