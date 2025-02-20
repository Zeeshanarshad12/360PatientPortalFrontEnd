import React, { createContext, useContext, useState } from 'react';

type PatientDataLoadContextType = {
  isPatientDataLoad: boolean;
  setIsPatientDataLoad: (value: boolean) => void;
};

const PatientDataLoadContext = createContext<PatientDataLoadContextType | undefined>(undefined);

export const PatientDataLoadStateCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPatientDataLoad, setIsPatientDataLoad] = useState(false);

  return (
    <PatientDataLoadContext.Provider value={{ isPatientDataLoad, setIsPatientDataLoad }}>
      {children}
    </PatientDataLoadContext.Provider>
  );
};

export const usePatientDataLoadState = () => {
  const context = useContext(PatientDataLoadContext);
  if (!context) {
    throw new Error("usePatientDataLoadState must be used within an PatientDataLoadStateCheck");
  }
  return context;
};