import { createContext, useContext } from "react";

interface LoadingContextType {
  setActiveRequests: React.Dispatch<React.SetStateAction<number>>;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};