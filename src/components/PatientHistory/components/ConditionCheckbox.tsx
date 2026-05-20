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
  const { id, conditionName, isConditionSelected, isApiChecked } = condition;
  const checked = isConditionSelected === 1;
  const locked = !!isApiChecked;

  return (
    <label
      className={`ph-checkbox-label ${
        checked ? 'ph-checkbox-label--checked' : ''
      }`}
      style={{ cursor: locked ? 'default' : 'pointer' }}
    >
      <input
        type="checkbox"
        className="ph-checkbox-input"
        checked={checked}
        onChange={() => {
          if (!locked) onChange(id);
        }}
        style={{
          accentColor: checked ? '#16a34a' : '#3b82f6',
          cursor: locked ? 'default' : 'pointer'
        }}
      />
      <span className="ph-checkbox-text">{conditionName}</span>
    </label>
  );
};

export default ConditionCheckbox;
