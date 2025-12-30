import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EmbeddedContextType {
  isEmbedded: boolean;
}

const EmbeddedContext = createContext<EmbeddedContextType>({ isEmbedded: false });

export function useEmbedded() {
  return useContext(EmbeddedContext);
}

interface EmbeddedProviderProps {
  children: ReactNode;
}

export function EmbeddedProvider({ children }: EmbeddedProviderProps) {
  // App is always in embedded mode (used exclusively as iframe)
  const isEmbedded = true;

  return (
    <EmbeddedContext.Provider value={{ isEmbedded }}>
      {children}
    </EmbeddedContext.Provider>
  );
}
