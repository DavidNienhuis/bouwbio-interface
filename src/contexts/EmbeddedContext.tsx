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
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Detect embedded mode via:
    // 1. URL parameter: ?embedded=true
    // 2. window !== window.parent (running in iframe)
    const params = new URLSearchParams(window.location.search);
    const embeddedParam = params.get('embedded') === 'true';
    const inIframe = window !== window.parent;
    
    setIsEmbedded(embeddedParam || inIframe);
  }, []);

  return (
    <EmbeddedContext.Provider value={{ isEmbedded }}>
      {children}
    </EmbeddedContext.Provider>
  );
}
