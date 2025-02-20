import React, { createContext, useContext, useState } from 'react';

type ActivityLoadContextType = {
  isActivityLoad: boolean;
  setIsActivityLoad: (value: boolean) => void;
};

const ActivityLoadContext = createContext<ActivityLoadContextType | undefined>(undefined);

export const ActivityLoadStateCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActivityLoad, setIsActivityLoad] = useState(false);

  return (
    <ActivityLoadContext.Provider value={{ isActivityLoad, setIsActivityLoad }}>
      {children}
    </ActivityLoadContext.Provider>
  );
};

export const useActivityLoadState = () => {
  const context = useContext(ActivityLoadContext);
  if (!context) {
    throw new Error("useActivityLoadState must be used within an ActivityLoadStateCheck");
  }
  return context;
};