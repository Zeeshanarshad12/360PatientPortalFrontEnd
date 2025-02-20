import React, { createContext, useContext, useState } from 'react';

type EncounterLoadContextType = {
  isEncounterLoad: boolean;
  setIsEncounterLoad: (value: boolean) => void;
};

const EncounterLoadContext = createContext<EncounterLoadContextType | undefined>(undefined);

export const EncounterLoadStateCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEncounterLoad, setIsEncounterLoad] = useState(false);

  return (
    <EncounterLoadContext.Provider value={{ isEncounterLoad, setIsEncounterLoad }}>
      {children}
    </EncounterLoadContext.Provider>
  );
};

export const useEncounterLoadState = () => {
  const context = useContext(EncounterLoadContext);
  if (!context) {
    throw new Error("useEncounterLoadState must be used within an EncounterLoadStateCheck");
  }
  return context;
};