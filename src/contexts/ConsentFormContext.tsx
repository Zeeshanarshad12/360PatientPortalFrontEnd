import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConsentFormContextType {
  pendingCount: number;
  setPendingCount: (count: number) => void;
  decrementPendingCount: () => void;
}

const ConsentFormContext = createContext<ConsentFormContextType | undefined>(undefined);

export const ConsentFormProvider = ({ children }: { children: ReactNode }) => {
  const [pendingCount, setPendingCountState] = useState<number>(0);

  const setPendingCount = (count: number) => {
    setPendingCountState(count);
  };

  const decrementPendingCount = () => {
    setPendingCountState(prev => Math.max(prev - 1, 0));
  };

  return (
    <ConsentFormContext.Provider value={{ pendingCount, setPendingCount, decrementPendingCount }}>
      {children}
    </ConsentFormContext.Provider>
  );
};

export const useConsentFormContext = () => {
  const context = useContext(ConsentFormContext);
  if (!context) {
    throw new Error('useConsentFormContext must be used within ConsentFormProvider');
  }
  return context;
};
