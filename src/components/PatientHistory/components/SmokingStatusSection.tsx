'use client';

import React from 'react';
import type { SectionData, SavingStatus } from '../types/patientHistory.types';

interface Props {
  sectionData: SectionData;
  onSelect: (id: number) => void;
  saving: SavingStatus;
}

const SmokingStatusSection: React.FC<Props> = ({ sectionData, onSelect }) => {
  const options = sectionData.smokingConditions;

  return (
    <div className="ph-section">
      <h2 className="ph-section-title">Smoking Status</h2>
      <p className="ph-section-subtitle">
        Please select your current smoking status
      </p>

      <div className="ph-card" style={{ padding: 20 }}>
        {options.length === 0 && (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>
            No smoking status options available.
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {options.map((c) => {
            const isSelected = c.isConditionSelected === 1;

            return (
              <label
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  cursor: c.isApiChecked ? 'default' : 'pointer',
                  userSelect: 'none',
                  fontSize: 14,
                  color: '#1f2937',
                  lineHeight: 1.5
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    if (!c.isApiChecked) onSelect(c.id);
                  }}
                  style={{
                    width: 17,
                    height: 17,
                    marginTop: 2,
                    flexShrink: 0,
                    accentColor: isSelected ? '#16a34a' : '#3b82f6',
                    cursor: 'inherit'
                  }}
                />
                {c.conditionName}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SmokingStatusSection;
