'use client';

import { ProtectedRoute } from '@/contexts/protectedRoute';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import PatientHistoryPage from '@/components/PatientHistory';

const PatientHistory = () => {
  const { patientId, practiceId } = useCurrentPatient(); // same context used across your portal

  return (
    <>
      <ProtectedRoute>
        <PatientHistoryPage
          patientId={Number(patientId)}
          practiceId={Number(practiceId)}
        />
      </ProtectedRoute>
    </>
  );
};

export default PatientHistory;
