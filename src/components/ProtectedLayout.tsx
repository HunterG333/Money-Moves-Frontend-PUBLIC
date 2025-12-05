import React from "react";
import Header from "./layout/Header";
import { useAppData } from "../hooks/useAppData";
import { RefreshContext } from "./RefreshContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { setRefresh, handleOverrideGraphData, isTestDataActive } = useAppData();

  const refreshContextValue = React.useMemo(
    () => ({ setRefresh }),
    [setRefresh]
  );

  return (
    <RefreshContext.Provider value={refreshContextValue}>
      <div className="protected-layout">
        <Header
          setRefresh={setRefresh}
          onOverrideGraphData={handleOverrideGraphData}
          isTestDataActive={isTestDataActive}
        />
        <main>{children}</main>
      </div>
    </RefreshContext.Provider>
  );
}
