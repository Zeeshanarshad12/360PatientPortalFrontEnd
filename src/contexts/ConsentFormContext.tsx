import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode
} from 'react';

interface ConsentFormContextType {
  pendingCount: number;
  setPendingCount: (count: number) => void;
  decrementPendingCount: () => void;
}

const ConsentFormContext = createContext<ConsentFormContextType | undefined>(
  undefined
);

export const ConsentFormProvider = ({ children }: { children: ReactNode }) => {
  const [pendingCount, setPendingCountState] = useState<number>(0);

  const setPendingCount = useCallback((count: number) => {
    setPendingCountState(count);
  }, []);

  const decrementPendingCount = useCallback(() => {
    setPendingCountState((prev) => Math.max(prev - 1, 0));
  }, []); // no deps — pure state updater

  const value = useMemo(
    () => ({
      pendingCount,
      setPendingCount,
      decrementPendingCount
    }),
    [pendingCount, setPendingCount, decrementPendingCount]
  );

  return (
    <ConsentFormContext.Provider value={value}>
      {children}
    </ConsentFormContext.Provider>
  );
};

export const useConsentFormContext = () => {
  const context = useContext(ConsentFormContext);
  if (!context) {
    throw new Error(
      'useConsentFormContext must be used within ConsentFormProvider'
    );
  }
  return context;
};
