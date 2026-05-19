import React from 'react';
import type { SavingStatus } from '../types/patientHistory.types';

interface SaveIndicatorProps {
  saving: SavingStatus;
}

const SaveIndicator: React.FC<SaveIndicatorProps> = ({ saving }) => (
  <div className="ph-save-status">
    {saving === 'saving' && <span className="ph-save-indicator">Saving…</span>}
    {saving === 'saved' && (
      <span className="ph-save-indicator ph-save-indicator--saved">
        ✓ Saved
      </span>
    )}
    {saving === 'error' && (
      <span className="ph-save-indicator ph-save-indicator--error">
        ⚠ Save failed. Your selection is recorded locally.
      </span>
    )}
  </div>
);

export default SaveIndicator;
