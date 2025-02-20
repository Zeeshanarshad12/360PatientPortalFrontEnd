import React, { createContext, useContext, useState } from 'react';

type ActivityLogContextType = {
  isActivityLog: boolean;
  setIsActivityLog: (value: boolean) => void;
};

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export const ActivityLogStateCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActivityLog, setIsActivityLog] = useState(false);

  return (
    <ActivityLogContext.Provider value={{ isActivityLog, setIsActivityLog }}>
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLogState = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error("useActivityLogState must be used within an ActivityLogStateCheck");
  }
  return context;
};