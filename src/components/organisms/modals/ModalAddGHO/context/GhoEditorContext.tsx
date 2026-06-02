import React, { createContext, useContext } from 'react';

import { useAddGho } from '../hooks/useAddGho';

export type GhoEditorContextValue = ReturnType<typeof useAddGho>;

const GhoEditorContext = createContext<GhoEditorContextValue | null>(null);

export const GhoEditorProvider = ({ children }: { children: React.ReactNode }) => {
  const value = useAddGho();
  return (
    <GhoEditorContext.Provider value={value}>{children}</GhoEditorContext.Provider>
  );
};

export const useGhoEditor = () => {
  const context = useContext(GhoEditorContext);
  if (!context) {
    throw new Error('useGhoEditor must be used within GhoEditorProvider');
  }
  return context;
};

export const useGhoEditorOptional = () => useContext(GhoEditorContext);
