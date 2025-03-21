import React from 'react';
import PatientProfile from '@/components/Profile/index';
import { PatientDataLoadStateCheck } from '@/components/Profile/contexts/patientDataLoadStates';
import { ProtectedRoute } from '@/contexts/protectedRoute';
const Profile = () => {
  return (
    <>
    <ProtectedRoute>
      <PatientDataLoadStateCheck>
        <PatientProfile /> {/* main page component */}
      </PatientDataLoadStateCheck>
      </ProtectedRoute>
    </>
  );
};

export default Profile;