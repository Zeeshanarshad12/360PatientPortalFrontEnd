import React from 'react';
import HealthSharingData from '@/components/HealthSharing/index';
import { ActivityLogStateCheck } from '@/components/HealthSharing/contexts/activityLogStates';
import { ActivityLoadStateCheck } from '@/components/HealthSharing/contexts/activityLoadStates';
import { HealthRecordLoadStateCheck } from '@/components/HealthSharing/contexts/healthRecordLoadStates';
import { EncounterLoadStateCheck } from '@/components/HealthSharing/contexts/encounterLoadStates';
import { ProtectedRoute } from '@/contexts/protectedRoute';

const HealthSharing = () => {
  return (
    <>
    <ProtectedRoute>
    <ActivityLogStateCheck>
        <HealthRecordLoadStateCheck>
          <ActivityLoadStateCheck>
            <EncounterLoadStateCheck>
              <HealthSharingData /> {/* main page component */}
            </EncounterLoadStateCheck>
          </ActivityLoadStateCheck>
        </HealthRecordLoadStateCheck>
      </ActivityLogStateCheck>
    </ProtectedRoute>
   
    </>
  );
};

export default HealthSharing;