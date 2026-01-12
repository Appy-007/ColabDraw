import { useState, useMemo, type ReactNode } from "react";
import { LoadingContext } from "./LoadingContext";
import Loader from "../components/Loader";

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [activeRequests, setActiveRequests] = useState(0);

  const isLoading = activeRequests > 0;

  const value = useMemo(() => ({ setActiveRequests }), []);

  return (
    <LoadingContext.Provider value={value}>
      <Loader isLoading={isLoading} />
      {children}
    </LoadingContext.Provider>
  );
};