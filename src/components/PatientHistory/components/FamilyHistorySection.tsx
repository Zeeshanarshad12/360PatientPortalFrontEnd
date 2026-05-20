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

const FamilyHistorySection: React.FC<Props> = ({
  sectionData,
  familyRelations,
  onToggleCell,
  onAddCustomRow
}) => {
  const { familyLookups, familyMatrix, familyDTO } = sectionData;

  // Always show ALL relations from getfamilyrelation API — fallback to FAMILY_RELATIONS
  const columns: FamilyRelation[] =
    familyRelations.length > 0 ? familyRelations : FAMILY_RELATIONS;

  const isChecked = (lookupId: number, relationId: number) =>
    (familyMatrix[lookupId] ?? []).includes(relationId);

  // Lock only cells that came from API (in familyDTO)
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
        style={{
          background: '#eef2f7',
          borderRadius: 8,
          padding: '20px 24px',
          overflowX: 'auto'
        }}
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
                  whiteSpace: 'nowrap'
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
                    whiteSpace: 'nowrap'
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
                    borderBottom: '1px solid #d1d5db'
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
                        borderBottom: '1px solid #d1d5db'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          if (!locked) onToggleCell(lookup.id, rel.id);
                        }}
                        aria-label={`${lookup.conditionName} — ${rel.name}`}
                        style={{
                          width: 17,
                          height: 17,
                          accentColor: checked ? '#16a34a' : '#3b82f6',
                          cursor: locked ? 'default' : 'pointer'
                        }}
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
