import React, { createContext, useContext, useState } from 'react';

type HealthRecordLoadContextType = {
  isHealthRecordLoad: boolean;
  setIsHealthRecordLoad: (value: boolean) => void;
};

const HealthRecordLoadContext = createContext<HealthRecordLoadContextType | undefined>(undefined);

export const HealthRecordLoadStateCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHealthRecordLoad, setIsHealthRecordLoad] = useState(false);

  return (
    <HealthRecordLoadContext.Provider value={{ isHealthRecordLoad, setIsHealthRecordLoad }}>
      {children}
    </HealthRecordLoadContext.Provider>
  );
};

export const useHealthRecordLoadState = () => {
  const context = useContext(HealthRecordLoadContext);
  if (!context) {
    throw new Error("useHealthRecordLoadState must be used within an HealthRecordLoadStateCheck");
  }
  return context;
};