import { useAppData } from "../../hooks/useAppData";
import UpdateAccountPage from "../../pages/accounts/UpdateAccountPage";

function UpdateAccountPageWrapper(){
    const {
        accountData,
        hiddenAccountData,
        setRefresh,
      } = useAppData();

    return (
        <>
            <UpdateAccountPage
                setRefresh={setRefresh}
                investmentAccounts={accountData.investmentAccounts}
                assetAccounts={accountData.assetAccounts}
                debtAccounts={accountData.debtAccounts}
                hiddenAccounts={[
                    ...hiddenAccountData.investmentAccounts,
                    ...hiddenAccountData.assetAccounts,
                    ...hiddenAccountData.debtAccounts,
                ]}
            />
        </>
    )
}

export default UpdateAccountPageWrapper;