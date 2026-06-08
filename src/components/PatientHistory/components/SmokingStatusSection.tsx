'use client';

import React from 'react';
import ConditionCheckbox from './ConditionCheckbox';
import type { SectionData, SavingStatus } from '../types/patientHistory.types';
import type { Condition } from '../types/patientHistory.types';

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

      <div className="ph-card" style={{ padding: '10px 16px' }}>
        {options.length === 0 && (
          <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
            No smoking status options available.
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {options.map((c) => (
            <ConditionCheckbox
              key={c.id}
              condition={c as unknown as Condition}
              onChange={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmokingStatusSection;
