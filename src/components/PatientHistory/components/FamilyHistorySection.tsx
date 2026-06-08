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
        e.preventDefault();
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

const sortColumns = (relations: FamilyRelation[]): FamilyRelation[] => {
  const others = relations.filter((r) => r.name.toLowerCase() === 'other');
  const rest = relations.filter((r) => r.name.toLowerCase() !== 'other');
  return [...rest, ...others];
};

const FamilyHistorySection: React.FC<Props> = ({
  sectionData,
  familyRelations,
  onToggleCell,
  onAddCustomRow
}) => {
  const { familyLookups, familyMatrix, familyDTO } = sectionData;

  const columns: FamilyRelation[] = sortColumns(
    familyRelations.length > 0 ? familyRelations : FAMILY_RELATIONS
  );

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
        style={{
          padding: '0',
          overflowX: 'auto',
          overflowY: 'auto',
          maxHeight: 720
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'auto'
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  position: 'sticky',
                  top: 0,
                  left: 0,
                  zIndex: 3,
                  textAlign: 'left',
                  padding: '8px 16px 8px 20px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#111827',
                  borderBottom: '1px solid #d1d5db',
                  minWidth: 220,
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  background: '#E6F0FB'
                }}
              >
                Condition
              </th>

              {columns.map((rel) => (
                <th
                  key={rel.id}
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    padding: '8px 8px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    textAlign: 'center',
                    borderBottom: '1px solid #d1d5db',
                    minWidth: 80,
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    background: '#E6F0FB'
                  }}
                >
                  {rel.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {familyLookups.map((lookup, idx) => (
              <tr
                key={lookup.id}
                style={{
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)'
                }}
              >
                <td
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    padding: '7px 16px 7px 20px',
                    fontSize: 13,
                    color: '#1f2937',
                    borderBottom: '1px solid #d1d5db',
                    userSelect: 'none',
                    background: idx % 2 === 0 ? '#E6F0FB' : '#dfe8f5',
                    whiteSpace: 'nowrap'
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
                        padding: '7px 8px',
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

        {/* Custom option sits below the scrollable table */}
        <div style={{ padding: '16px 20px' }}>
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
