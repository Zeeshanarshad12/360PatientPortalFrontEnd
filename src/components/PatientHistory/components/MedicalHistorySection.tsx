'use client';

import React from 'react';
import CustomOptionButton from './CustomOptionButton';
import ConditionCheckbox from './ConditionCheckbox';
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

    <div className="ph-card">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px 16px',
          marginBottom: 20
        }}
      >
        {sectionData.conditions.map((c) => (
          <ConditionCheckbox key={c.id} condition={c} onChange={onCheck} />
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
