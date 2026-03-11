export interface CurrentPatientState {
  patientId: string | null;
  practiceId: string | null;
  firstName: string | null;
  lastName: string | null;
  practiceName: string | null;
  vdtAccess: string | null;
  pendingConsentFormCount: string | null;
  email: string | null;
}

import React, { createContext, useContext, useEffect, useState } from 'react';

const CurrentPatientContext = createContext<CurrentPatientState | undefined>(undefined);

const readFromLocalStorage = (): CurrentPatientState => {
  if (typeof window === 'undefined') {
    return {
      patientId: null,
      practiceId: null,
      firstName: null,
      lastName: null,
      practiceName: null,
      vdtAccess: null,
      pendingConsentFormCount: null,
      email:null,
    };
  }
  return {
    patientId: localStorage.getItem('patientID'),
    practiceId: localStorage.getItem('PracticeId'),
    firstName: localStorage.getItem('FirstName'),
    lastName: localStorage.getItem('LastName'),
    practiceName: localStorage.getItem('PracticeName'),
    vdtAccess: localStorage.getItem('vdtAccess'),
    pendingConsentFormCount: localStorage.getItem('pendingConsentFormCount'),
    email: localStorage.getItem('Email'),
  };
};

export const CurrentPatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CurrentPatientState>(readFromLocalStorage);

  // Helper to resync from localStorage
  const syncFromLocalStorage = () => {
    setState(readFromLocalStorage());
  };

  // useEffect(() => {
  //   // Initial sync is already done by useState, but harmless to call again
  //   syncFromLocalStorage();

  //   const handlePracticeChanged = () => {
  //     syncFromLocalStorage();
  //   };

  //   window.addEventListener('practiceChanged', handlePracticeChanged);
  //   return () => window.removeEventListener('practiceChanged', handlePracticeChanged);
  // }, []);

  useEffect(() => {
  const sync = () => {
    setState(readFromLocalStorage());
  };

  window.addEventListener('practiceChanged', sync);
  window.addEventListener('practiceInitialized', sync);

  return () => {
    window.removeEventListener('practiceChanged', sync);
    window.removeEventListener('practiceInitialized', sync);
  };
}, []);

  return (
    <CurrentPatientContext.Provider value={state}>
      {children}
    </CurrentPatientContext.Provider>
  );
};

export const useCurrentPatient = () => {
  const ctx = useContext(CurrentPatientContext);
  if (!ctx) {
    throw new Error('useCurrentPatient must be used inside CurrentPatientProvider');
  }
  return ctx;
};