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

      <div className="ph-card">
        {options.length === 0 && (
          <p className="ph-empty">No smoking status options available.</p>
        )}
        <div className="ph-smoking-list">
          {options.map((c) => (
            <label key={c.id} className="ph-radio-label">
              <input
                type="radio"
                name="smokingStatus"
                checked={c.isConditionSelected === 1}
                onChange={() => onSelect(c.id)}
                className="ph-radio"
              />
              <span>{c.conditionName}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmokingStatusSection;
