'use client';

import React from 'react';
import CustomOptionButton from './CustomOptionButton';
import ConditionCheckbox from './ConditionCheckbox';
import type {
  SectionData,
  SavingStatus,
  SurgicalCondition,
  Condition
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
}> = ({ c, onToggle }) => (
  <ConditionCheckbox
    condition={c as unknown as Condition}
    onChange={onToggle}
  />
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

      <div className="ph-card" style={{ padding: '10px 16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0 24px',
            marginBottom: 10
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
