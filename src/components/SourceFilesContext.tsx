import { createContext, useContext, ReactNode } from "react";
import { StoredFile } from "@/lib/storageClient";

interface SourceFilesContextType {
  sourceFiles: StoredFile[];
}

const SourceFilesContext = createContext<SourceFilesContextType>({ sourceFiles: [] });

export const useSourceFiles = () => useContext(SourceFilesContext);

interface SourceFilesProviderProps {
  children: ReactNode;
  sourceFiles: StoredFile[];
}

export const SourceFilesProvider = ({ children, sourceFiles }: SourceFilesProviderProps) => {
  return (
    <SourceFilesContext.Provider value={{ sourceFiles }}>
      {children}
    </SourceFilesContext.Provider>
  );
};
