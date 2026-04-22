import React, { createContext, useContext, useEffect, useState } from 'react';
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

const CurrentPatientContext = createContext<CurrentPatientState | undefined>(
  undefined
);

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
      email: null
    };
  }
  return {
    patientId: localStorage.getItem('PatientId'),
    practiceId: localStorage.getItem('PracticeId'),
    firstName: localStorage.getItem('FirstName'),
    lastName: localStorage.getItem('LastName'),
    practiceName: localStorage.getItem('PracticeName'),
    vdtAccess: localStorage.getItem('vdtAccess'),
    pendingConsentFormCount: localStorage.getItem('pendingConsentFormCount'),
    email: localStorage.getItem('Email')
  };
};

export const CurrentPatientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [state, setState] = useState<CurrentPatientState>(readFromLocalStorage);

  // Helper to resync from localStorage
  const syncFromLocalStorage = () => {
    setState(readFromLocalStorage());
  };

  useEffect(() => {
    window.addEventListener('practiceChanged', syncFromLocalStorage);
    window.addEventListener('practiceInitialized', syncFromLocalStorage);

    window.addEventListener('userLoggedIn', syncFromLocalStorage);

    window.addEventListener('storage', syncFromLocalStorage);

    return () => {
      window.removeEventListener('practiceChanged', syncFromLocalStorage);
      window.removeEventListener('practiceInitialized', syncFromLocalStorage);
      window.removeEventListener('userLoggedIn', syncFromLocalStorage);
      window.removeEventListener('storage', syncFromLocalStorage);
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
    throw new Error(
      'useCurrentPatient must be used inside CurrentPatientProvider'
    );
  }
  return ctx;
};
