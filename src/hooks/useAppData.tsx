import { useEffect, useState, useCallback } from "react";
import * as Api from "../api/api";
import { useAuth } from "./useAuth";

import { TIME_PERIODS } from "../constants";
import { AccountDataDTO, UserDataDTO } from "../types";

// --- Utility functions ---
export const calculatePercentageChange = (current: number, first: number): number => {
  if (isNaN(first) || isNaN(current)) return 0;
  if (first === 0) return current === 0 ? 0 : 100;

  return Number((((current - first) / Math.abs(first)) * 100).toFixed(2));
};



export const generateTestData = (entries: number) => {
  const labels: string[] = [];
  const dataset: number[] = [];
  let currentValue = 50000;
  const dailyGrowthRate = 0.00025;
  const volatility = 0.02;

  for (let i = 0; i < entries; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (entries - 1 - i));
    labels.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
    const randomVolatility = (Math.random() - 0.5) * volatility;
    currentValue *= 1 + dailyGrowthRate + randomVolatility;
    dataset.push(Math.round(currentValue));
  }
  return { labels, dataset };
};

// --- Hook ---
export function useAppData() {
  const { isFullyAuthenticated } = useAuth();

   const [account, setAccount] = useState<{
    data: AccountDataDTO;
    error: string | null;
  }>({
    data: { investmentAccounts: [], assetAccounts: [], debtAccounts: [] },
    error: null,
  });

  const [hiddenAccounts, setHiddenAccounts] = useState<{
    data: AccountDataDTO;
    error: string | null;
  }>({
    data: { investmentAccounts: [], assetAccounts: [], debtAccounts: [] },
    error: null,
  })

  const [userData, setUserData] = useState<UserDataDTO | null>(null);

   const [netWorth, setNetWorth] = useState<{
    data: { labels: string[]; dataset: number[] };
    error: string | null;
  }>({
    data: { labels: [], dataset: [] },
    error: null,
  });

  const [ui, setUi] = useState<{
  isTestDataActive: boolean;
  selectedTimePeriod: keyof typeof TIME_PERIODS;
  numberOfGraphEntries: number;
}>({
  isTestDataActive: false,
  selectedTimePeriod: "30D",
  numberOfGraphEntries: TIME_PERIODS["30D"],
});

  const [refresh, setRefresh] = useState(false);

  const handleOverrideGraphData = useCallback(() => {
    setUi((prev) => ({ ...prev, isTestDataActive: !prev.isTestDataActive }));
    setRefresh((prev) => !prev);
  }, []);

   const handleTimePeriodChange = useCallback((period: keyof typeof TIME_PERIODS) => {
    setUi((prev) => ({
      ...prev,
      selectedTimePeriod: period,
      numberOfGraphEntries: TIME_PERIODS[period],
    }));
    setRefresh((prev) => !prev);
  }, []);

  // --- Data Fetchers ---
  const fetchAccountData = useCallback(async () => {
    try {
      const accounts = await Api.getAccountData(false);
      setAccount({ data: accounts, error: null });
    } catch {
      setAccount((prev) => ({ ...prev, error: "Failed to load account data." }));
    }
  }, []);

  const fetchHiddenAccounts = useCallback(async () => {
    try {
      const hiddenData = await Api.getAccountData(true);
      setHiddenAccounts({
        data: hiddenData, error: null
    });
    } catch {
      console.error("Failed to load hidden accounts.");
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const data = await Api.getUserData();
      setUserData(data);
    } catch {
      console.error("Failed to load user data.");
    }
  }, []);


  const fetchNetWorthData = useCallback(async () => {
    try {
      const data = ui.isTestDataActive
        ? generateTestData(ui.numberOfGraphEntries)
        : await Api.getNetWorthData(ui.numberOfGraphEntries);
      setNetWorth({ data, error: null });
    } catch {
      setNetWorth((prev) => ({ ...prev, error: "Failed to load net worth data." }));
    }
  }, [ui.isTestDataActive, ui.numberOfGraphEntries]);

  // --- Main effect ---
  useEffect(() => {
    if (isFullyAuthenticated) {
      Promise.all([fetchAccountData(), fetchUserData(), fetchNetWorthData(), fetchHiddenAccounts()]);
    }
  }, [refresh, isFullyAuthenticated, fetchAccountData, fetchNetWorthData, fetchHiddenAccounts]);

  //TODO: SEE HOW THIS METHOD BEHAVES
  // --- Refresh account check effect ---
  useEffect(() => {
    if (!isFullyAuthenticated) return;

    const interval = setInterval(async () => {
      const result = await Api.checkRefreshAccount();
      if (result === "REFRESHED") setRefresh(r => !r);
    }, (60_000 * 5)); // every 5 minutes check for refresh

    return () => clearInterval(interval);
  }, [isFullyAuthenticated]);

  return {
    accountData: account.data,
    accountError: account.error,
    hiddenAccountData: hiddenAccounts.data,
    hiddenAccountError: hiddenAccounts.error,
    userData,
    netWorthData: netWorth.data,
    netWorthError: netWorth.error,
    selectedTimePeriod: ui.selectedTimePeriod,
    isTestDataActive: ui.isTestDataActive,
    handleTimePeriodChange,
    handleOverrideGraphData,
    calculatePercentageChange,
    setRefresh,
  };
}
