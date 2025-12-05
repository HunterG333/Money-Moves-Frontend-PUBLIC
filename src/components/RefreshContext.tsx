import { createContext, useContext, Dispatch, SetStateAction } from "react";

interface RefreshContextType {
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

export const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const useRefresh = () => {
  const ctx = useContext(RefreshContext);
  if (!ctx) throw new Error("useRefresh must be used inside a <RefreshContext.Provider>");
  return ctx;
};
