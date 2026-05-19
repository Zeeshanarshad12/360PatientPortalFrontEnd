import React, { useState } from 'react';

interface CustomConditionInputProps {
  onAdd: (entry: string) => void;
}

const CustomConditionInput: React.FC<CustomConditionInputProps> = ({
  onAdd
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter a condition name.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Condition name must be at least 2 characters.');
      return;
    }
    onAdd(trimmed);
    setValue('');
    setError('');
  };

  return (
    <div className="ph-custom-input-wrapper">
      <p className="ph-custom-label">Add Custom Condition</p>
      <div className="ph-custom-input-row">
        <input
          type="text"
          className={`ph-custom-input ${error ? 'ph-custom-input--error' : ''}`}
          placeholder="Type a condition and press Enter or click Add…"
          value={value}
          maxLength={200}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          type="button"
          className="ph-custom-add-btn"
          onClick={handleAdd}
          disabled={!value.trim()}
        >
          + Add
        </button>
      </div>
      {error && <p className="ph-custom-error">{error}</p>}
    </div>
  );
};

export default CustomConditionInput;
