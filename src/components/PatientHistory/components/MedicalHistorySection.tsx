'use client';

import React from 'react';
import CustomOptionButton from './CustomOptionButton';
import type { SectionData, SavingStatus } from '../types/patientHistory.types';

interface Props {
  sectionData: SectionData;
  onCheck: (id: number) => void;
  onAddCustom: (name: string) => Promise<void>;
  saving: SavingStatus;
}

const MedicalHistorySection: React.FC<Props> = ({
  sectionData,
  onCheck,
  onAddCustom,
  saving
}) => (
  <div className="ph-section">
    <h2 className="ph-section-title">Medical History</h2>
    <p className="ph-section-subtitle">
      Do you currently have or have you ever been treated for any of the
      following?
    </p>

    <div className="ph-card" style={{ padding: 20 }}>
      {/* 3-column checkbox grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px 24px',
          marginBottom: 20
        }}
      >
        {sectionData.conditions.map((c) => (
          <label
            key={c.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: c.isApiChecked ? 'default' : 'pointer',
              userSelect: 'none',
              fontSize: 14,
              color: '#1f2937'
            }}
          >
            <input
              type="checkbox"
              checked={c.isConditionSelected === 1}
              onChange={() => {
                if (!c.isApiChecked) onCheck(c.id);
              }}
              style={{
                width: 16,
                height: 16,
                accentColor:
                  c.isConditionSelected === 1 ? '#16a34a' : '#3b82f6',
                cursor: 'inherit',
                flexShrink: 0
              }}
            />
            {c.conditionName}
          </label>
        ))}
      </div>

      <CustomOptionButton
        onConfirm={onAddCustom}
        loading={saving === 'saving'}
        placeholder="Enter condition name"
        popupTitle="Add Custom Condition"
      />
    </div>
  </div>
);

export default MedicalHistorySection;
