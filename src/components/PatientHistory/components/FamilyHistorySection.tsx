'use client';

import React from 'react';
import CustomOptionButton from './CustomOptionButton';
import { FAMILY_RELATIONS } from '@/slices/patientHistorySlice';
import type { SectionData, SavingStatus } from '../types/patientHistory.types';

interface Props {
  sectionData: SectionData;
  onToggleCell: (lookupId: number, relationId: number) => void;
  onAddCustomRow: (conditionName: string) => void;
  saving: SavingStatus;
}

const FamilyHistorySection: React.FC<Props> = ({
  sectionData,
  onToggleCell,
  onAddCustomRow,
  saving
}) => {
  const { familyLookups, familyMatrix } = sectionData;

  const isChecked = (lookupId: number, relationId: number) =>
    (familyMatrix[lookupId] ?? []).includes(relationId);

  return (
    <div className="ph-section">
      <h2 className="ph-section-title">Family History</h2>
      <p className="ph-section-subtitle">
        Please list the blood relatives who have been diagnosed with the
        following conditions
      </p>

      <div className="ph-card ph-family-card">
        <div className="ph-family-table-wrapper">
          <table className="ph-family-table">
            <thead>
              <tr>
                {/* Condition column header */}
                <th className="ph-family-th ph-family-th--condition" />
                {FAMILY_RELATIONS.map((rel) => (
                  <th
                    key={rel.id}
                    className="ph-family-th ph-family-th--relation"
                  >
                    <span className="ph-relation-label">{rel.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {familyLookups.map((lookup) => (
                <tr key={lookup.id} className="ph-family-row">
                  <td className="ph-family-td ph-family-td--name">
                    {lookup.conditionName}
                  </td>
                  {FAMILY_RELATIONS.map((rel) => (
                    <td
                      key={rel.id}
                      className="ph-family-td ph-family-td--cell"
                    >
                      <input
                        type="checkbox"
                        className="ph-checkbox"
                        checked={isChecked(lookup.id, rel.id)}
                        onChange={() => onToggleCell(lookup.id, rel.id)}
                        aria-label={`${lookup.conditionName} — ${rel.name}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CustomOptionButton
          onConfirm={onAddCustomRow}
          popupTitle="Add Custom Condition"
        />
      </div>
    </div>
  );
};

export default FamilyHistorySection;
