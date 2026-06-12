'use client';

import React, { useState, useEffect } from 'react';
import { usePatientHistory } from '@/components/PatientHistory/hooks/usePatientHistory';
import HistoryNav from './components/HistoryNav';
import MedicalHistorySection from './components/MedicalHistorySection';
import SurgicalHistorySection from './components/SurgicalHistorySection';
import SmokingStatusSection from './components/SmokingStatusSection';
import FamilyHistorySection from './components/FamilyHistorySection';
import SocialHistorySection from './components/SocialHistorySection';
import { ENABLED_SECTION_IDS } from '@/slices/patientHistorySlice';
import type { SectionData, SectionStatus } from './types/patientHistory.types';
import HeartProgressLoader from '@/components/ProgressLoaders/components/HeartLoader';

interface PatientHistoryPageProps {
  patientId: number;
  practiceId: number;
  onComplete?: () => void;
}

const PatientHistoryPage: React.FC<PatientHistoryPageProps> = ({
  patientId,
  practiceId,
  onComplete
}) => {
  const [heartLoading, setHeartLoading] = useState(true);
  const {
    sections,
    sectionsLoading,
    isSectionLoading,
    activeSection,
    data,
    saving,
    isFirstSection,
    isLastSection,
    handleTabChange,
    handlePrev,
    handleSave,
    handleSaveAndNext,
    handleToggleCondition,
    handleAddCustomEntry,
    handleToggleSurgicalCondition,
    handleSetSurgicalDate,
    handleAddCustomSurgical,
    handleSmokingSelect,
    handleToggleFamilyCell,
    handleAddCustomFamilyRow,
    familyRelations,
    handleToggleSocialCondition,
    handleAddCustomSocial
  } = usePatientHistory({ patientId, practiceId });

  useEffect(() => {
    const timer = setTimeout(() => setHeartLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (heartLoading) return <HeartProgressLoader />;

  const activeSectionData = data[activeSection] as SectionData | undefined;
  const activeSectionItem = sections.find((s) => s.id === activeSection);
  const enabledSections = sections.filter((s) =>
    ENABLED_SECTION_IDS.includes(s.id)
  );
  const sorted = [...ENABLED_SECTION_IDS].sort((a, b) => a - b);
  const progressPercent =
    ((sorted.indexOf(activeSection) + 1) / sorted.length) * 100;
  const isSaving = saving[activeSection] === 'saving';

  const sectionStatus: Record<number, SectionStatus> = Object.keys(data).reduce(
    (acc, key) => {
      const id = Number(key);
      acc[id] = (data as Record<number, SectionData>)[id].status;
      return acc;
    },
    {} as Record<number, SectionStatus>
  );

  const renderSection = () => {
    if (!activeSectionData || !activeSectionItem) return null;

    switch (activeSectionItem.name) {
      case 'Medical History':
        return (
          <MedicalHistorySection
            sectionData={activeSectionData}
            onCheck={handleToggleCondition}
            onAddCustom={handleAddCustomEntry}
            saving={saving[activeSection]}
          />
        );
      case 'Surgical History':
        return (
          <SurgicalHistorySection
            sectionData={activeSectionData}
            onToggle={handleToggleSurgicalCondition}
            onSetDate={handleSetSurgicalDate}
            onAddCustom={handleAddCustomSurgical}
            saving={saving[activeSection]}
          />
        );
      case 'Smoking Status':
        return (
          <SmokingStatusSection
            sectionData={activeSectionData}
            onSelect={handleSmokingSelect}
            saving={saving[activeSection]}
          />
        );
      case 'Family History':
        return (
          <FamilyHistorySection
            sectionData={activeSectionData}
            familyRelations={familyRelations}
            onToggleCell={handleToggleFamilyCell}
            onAddCustomRow={handleAddCustomFamilyRow}
            saving={saving[activeSection]}
          />
        );
      case 'Social History':
        return (
          <SocialHistorySection
            sectionData={activeSectionData}
            onToggle={handleToggleSocialCondition}
          />
        );
      default:
        return (
          <div className="ph-section ph-coming-soon">
            <p>This section is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="ph-page">
      <aside className="ph-sidebar">
        {/* Search + nav + header is self-contained inside HistoryNav */}
        <HistoryNav
          sections={enabledSections}
          activeSection={activeSection}
          onSelect={handleTabChange}
          sectionStatus={sectionStatus}
          loading={sectionsLoading || isSectionLoading}
          totalCount={enabledSections.length}
        />

        <div className="ph-progress">
          <div className="ph-progress-label">
            Section {sorted.indexOf(activeSection) + 1} of {sorted.length}
          </div>
          <div className="ph-progress-bar">
            <div
              className="ph-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </aside>

      <div className="ph-main">
        <div className="ph-content">
          {activeSectionData?.status === 'loading' && <HeartProgressLoader />}
          {activeSectionData?.status === 'error' && (
            <div className="ph-error">Failed to load. Please refresh.</div>
          )}
          {activeSectionData?.status === 'success' && renderSection()}
        </div>

        {/* Footer */}
        <div className="ph-footer">
          <button
            type="button"
            className="ph-btn ph-btn--secondary"
            onClick={handlePrev}
            disabled={isFirstSection || isSaving}
          >
            Previous
          </button>

          <div className="ph-footer-right">
            {saving[activeSection] === 'error' && (
              <span className="ph-footer-error">⚠ Last save failed</span>
            )}
            {saving[activeSection] === 'saved' && (
              <span className="ph-footer-saved">✓ Saved</span>
            )}

            {/* Save — always shown */}
            <button
              type="button"
              className="ph-btn ph-btn--secondary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </button>

            {/* Save & Next — shown for all sections except the last */}
            {!isLastSection && (
              <button
                type="button"
                className="ph-btn ph-btn--primary"
                onClick={handleSaveAndNext}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save & Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryPage;
