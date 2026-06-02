'use client';

import React from 'react';
import CustomOptionButton from './CustomOptionButton';
import { FAMILY_RELATIONS } from '../types/patientHistory.types';
import type {
  SectionData,
  SavingStatus,
  FamilyRelation
} from '../types/patientHistory.types';

interface Props {
  sectionData: SectionData;
  familyRelations: FamilyRelation[];
  onToggleCell: (lookupId: number, relationId: number) => void;
  onAddCustomRow: (conditionName: string) => void;
  saving: SavingStatus;
}

// ── FamilyCheckbox ────────────────────────────────────────────────────────────

interface FamilyCheckboxProps {
  checked: boolean;
  locked: boolean;
  onChange: () => void;
  label: string;
}

const FamilyCheckbox: React.FC<FamilyCheckboxProps> = ({
  checked,
  locked,
  onChange,
  label
}) => {
  const bg = locked ? '#c8d0dc' : checked ? '#16a34a' : '#ffffff';
  const border = locked ? '#8a96a8' : checked ? '#16a34a' : '#8a96a8';
  const tick = locked ? '#6b7585' : '#ffffff';

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      tabIndex={locked ? -1 : 0}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!locked) onChange();
      }}
      onMouseDown={(e) => {
        e.preventDefault(); // prevents browser text selection on click
      }}
      onKeyDown={(e) => {
        if (!locked && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          onChange();
        }
      }}
      style={{
        width: 17,
        height: 17,
        minWidth: 17,
        minHeight: 17,
        borderRadius: 4,
        border: `2px solid ${border}`,
        background: bg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: locked ? 'default' : 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
        boxSizing: 'border-box',
        userSelect: 'none',
        WebkitUserSelect: 'none'
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
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const FamilyHistorySection: React.FC<Props> = ({
  sectionData,
  familyRelations,
  onToggleCell,
  onAddCustomRow
}) => {
  const { familyLookups, familyMatrix, familyDTO } = sectionData;

  const columns: FamilyRelation[] =
    familyRelations.length > 0 ? familyRelations : FAMILY_RELATIONS;

  const isChecked = (lookupId: number, relationId: number): boolean =>
    (familyMatrix[lookupId] ?? []).includes(relationId);

  const isApiLocked = (lookupId: number, relationId: number): boolean => {
    const lookup = familyLookups.find((l) => l.id === lookupId);
    if (!lookup) return false;
    return familyDTO.some(
      (dto) =>
        dto.relationId === relationId &&
        dto.familyHistoryConditions.some(
          (c) => c.conditionName === lookup.conditionName
        )
    );
  };

  return (
    <div className="ph-section">
      <h2 className="ph-section-title">Family History</h2>
      <p className="ph-section-subtitle">
        Please list the blood relatives who have been diagnosed with the
        following conditions
      </p>

      <div
        className="ph-card"
        style={{ padding: '20px 24px', overflowX: 'auto' }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  padding: '12px 16px 12px 0',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#111827',
                  borderBottom: '1px solid #d1d5db',
                  minWidth: 220,
                  whiteSpace: 'nowrap',
                  userSelect: 'none'
                }}
              >
                Condition
              </th>
              {columns.map((rel) => (
                <th
                  key={rel.id}
                  style={{
                    padding: '12px 8px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db',
                    minWidth: 80,
                    whiteSpace: 'nowrap',
                    userSelect: 'none'
                  }}
                >
                  {rel.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {familyLookups.map((lookup) => (
              <tr key={lookup.id}>
                <td
                  style={{
                    padding: '10px 16px 10px 0',
                    fontSize: 13,
                    color: '#1f2937',
                    borderBottom: '1px solid #d1d5db',
                    userSelect: 'none'
                  }}
                >
                  {lookup.conditionName}
                </td>
                {columns.map((rel) => {
                  const checked = isChecked(lookup.id, rel.id);
                  const locked = isApiLocked(lookup.id, rel.id);
                  return (
                    <td
                      key={rel.id}
                      style={{
                        textAlign: 'center',
                        padding: '10px 8px',
                        borderBottom: '1px solid #d1d5db',
                        userSelect: 'none'
                      }}
                    >
                      <FamilyCheckbox
                        checked={checked}
                        locked={locked}
                        onChange={() => onToggleCell(lookup.id, rel.id)}
                        label={`${lookup.conditionName} — ${rel.name}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 16 }}>
          <CustomOptionButton
            onConfirm={onAddCustomRow}
            popupTitle="Add Custom Condition"
          />
        </div>
      </div>
    </div>
  );
};

export default FamilyHistorySection;
