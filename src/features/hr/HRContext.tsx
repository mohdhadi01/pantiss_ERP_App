import React, { createContext, useContext } from 'react';
import { useHRStore, HRStore } from './store';

const HRContext = createContext<HRStore | null>(null);

export const HRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useHRStore();
  return <HRContext.Provider value={store}>{children}</HRContext.Provider>;
};

export function useHR(): HRStore {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
}
