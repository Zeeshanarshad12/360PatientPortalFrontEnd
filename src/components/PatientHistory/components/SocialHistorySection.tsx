'use client';

import React from 'react';
import CustomOptionButton from './CustomOptionButton';
import {
  groupSocialConditions,
  SOCIAL_GROUP_RANGES
} from '../types/patientHistory.types';
import type {
  SectionData,
  SavingStatus,
  SocialCondition
} from '../types/patientHistory.types';

interface Props {
  sectionData: SectionData;
  onToggle: (conditionId: number) => void;
  onAddCustom: (conditionName: string, sourceId: number) => Promise<void>;
  saving: SavingStatus;
}

const SocialHistorySection: React.FC<Props> = ({
  sectionData,
  onToggle,
  onAddCustom,
  saving
}) => {
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
          // Find the sourceId range for this group to pass to custom entries
          const range = SOCIAL_GROUP_RANGES.find((r) => r.label === group.name);
          // Use the min sourceId of the group as the custom entry's sourceId
          const customSourceId = range?.min ?? 0;

          return (
            <div key={group.name} className="ph-card" style={{ padding: 20 }}>
              {/* Group heading */}
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

              {/* 3-column checkbox grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px 24px',
                  marginBottom: 16
                }}
              >
                {group.conditions.map((c: SocialCondition) => (
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
                        if (!c.isApiChecked) onToggle(c.id);
                      }}
                      // API conditions: check-only
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

              {/* + Custom Option per group */}
              <CustomOptionButton
                onConfirm={(name) => onAddCustom(name, customSourceId)}
                loading={saving === 'saving'}
                placeholder={`Enter custom ${group.name.toLowerCase()} option`}
                popupTitle={`Add Custom ${group.name}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialHistorySection;
