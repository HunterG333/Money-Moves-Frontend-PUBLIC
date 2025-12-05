import { useAppData } from "../../hooks/useAppData";
import DashboardPage from "../../pages/dashboard/DashboardPage";

function DashboardPageWrapper() {
  const {
    accountData,
    netWorthData,
    accountError,
    netWorthError,
    selectedTimePeriod,
    handleTimePeriodChange,
    calculatePercentageChange,
    setRefresh,
  } = useAppData();

  return (
    <>
      <DashboardPage
        accountData={accountData}
        netWorthData={netWorthData}
        selectedTimePeriod={selectedTimePeriod}
        accountError={accountError}
        netWorthError={netWorthError}
        setRefresh={setRefresh}
        handleTimePeriodChange={handleTimePeriodChange}
        calculatePercentageChange={calculatePercentageChange}
      />
    </>
    
  );
}

export default DashboardPageWrapper;