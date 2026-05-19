import React from 'react';
import type { Condition } from '../types/patientHistory.types';

interface ConditionCheckboxProps {
  condition: Condition;
  onChange: (id: number) => void;
}

const ConditionCheckbox: React.FC<ConditionCheckboxProps> = ({
  condition,
  onChange
}) => {
  const { id, conditionName, isConditionSelected } = condition;
  const checked = isConditionSelected === 1;

  return (
    <label
      className={`ph-checkbox-label ${
        checked ? 'ph-checkbox-label--checked' : ''
      }`}
    >
      <input
        type="checkbox"
        className="ph-checkbox-input"
        checked={checked}
        disabled={checked}
        onChange={() => {
          if (!checked) onChange(id);
        }}
      />
      <span className="ph-checkbox-text">{conditionName}</span>
    </label>
  );
};

export default ConditionCheckbox;
