import React from 'react';
import PatientProfile from '@/components/Profile/index';
import { PatientDataLoadStateCheck } from '@/components/Profile/contexts/patientDataLoadStates';

const Profile = () => {
  return (
    <>
      <PatientDataLoadStateCheck>
        <PatientProfile /> {/* main page component */}
      </PatientDataLoadStateCheck>
    </>
  );
};

export default Profile;