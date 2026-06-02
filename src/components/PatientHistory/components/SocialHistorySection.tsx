'use client';

import React from 'react';
import ConditionCheckbox from './ConditionCheckbox';
import { groupSocialConditions } from '../types/patientHistory.types';
import type {
  SectionData,
  SocialCondition,
  Condition
} from '../types/patientHistory.types';

interface Props {
  sectionData: SectionData;
  onToggle: (conditionId: number) => void;
}

const SocialHistorySection: React.FC<Props> = ({ sectionData, onToggle }) => {
  const groups = groupSocialConditions(sectionData.socialConditions);

  return (
    <div className="ph-section">
      <h2 className="ph-section-title">Social History</h2>
      <p className="ph-section-subtitle">
        Do you currently have or have you ever been treated for any of the
        following?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.map((group) => {
          return (
            <div key={group.name} className="ph-card" style={{ padding: 20 }}>
              <h3
                style={{
                  margin: '0 0 14px',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#111827'
                }}
              >
                {group.name}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px 24px',
                  marginBottom: 16
                }}
              >
                {group.conditions.map((c: SocialCondition) => (
                  <ConditionCheckbox
                    key={c.id}
                    condition={c as unknown as Condition}
                    onChange={onToggle}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialHistorySection;
