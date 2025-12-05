import { Routes, Route } from "react-router-dom";

import { ToastProvider } from "./components/toast";
import AuthRoute from "./components/AuthRoute";

import HomePage from "./pages/HomePage";
import MfaPage from "./pages/auth/MfaPage";

import AccountManagementPage from "./pages/accounts/AccountManagementPage";
import CreateAccountPage from "./pages/accounts/CreateAccountPage";
import AddPlaidAccountPage from "./pages/accounts/AddPlaidAccountPage";


import { AuthProvider } from "./hooks/useAuth";
import { AuthState } from "./types";
import PlaidLinkManagementPage from "./pages/plaid/PlaidLinkManagementPage";
import SessionExpiredPage from "./pages/auth/SessionExpiredPage";
import DashboardPageWrapper from "./components/wrappers/DashboardPageWrapper";
import UpdateAccountPageWrapper from "./components/wrappers/UpdateAccountPageWrapper";
import ProtectedLayout from "./components/ProtectedLayout";





function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

function AppContent() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/session-expired"
          element={
            <AuthRoute
              requiredState={AuthState.LOGGED_OUT}
              exemptPaths={["/session-expired"]}
            >
              <SessionExpiredPage />
            </AuthRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthRoute requiredState={AuthState.FULLY_AUTHENTICATED}>
              <ProtectedLayout>
                <DashboardPageWrapper />
              </ProtectedLayout>
            </AuthRoute>
          }
        />
        <Route
          path="/mfa"
          element={
            <AuthRoute requiredState={AuthState.LOGGED_IN}>
              <ProtectedLayout>
                <MfaPage />
              </ProtectedLayout>
            </AuthRoute>
          }
        />

        {
        /* ============================ */
        /*      Account Routes          */
        /* ============================ */
        }
        <Route
          path="/account-management"
          element={
            <AuthRoute requiredState={AuthState.FULLY_AUTHENTICATED}>
              <ProtectedLayout>
                <AccountManagementPage />
              </ProtectedLayout>
            </AuthRoute>
          }
        />
        <Route
          path="/create-account"
          element={
            <AuthRoute requiredState={AuthState.FULLY_AUTHENTICATED}>
              <ProtectedLayout>
                <CreateAccountPage />
              </ProtectedLayout>
            </AuthRoute>
          }
        />
        <Route
          path="/update-account-info"
          element={
            <AuthRoute requiredState={AuthState.FULLY_AUTHENTICATED}> 
              <ProtectedLayout>
                <UpdateAccountPageWrapper />
              </ProtectedLayout>
            </AuthRoute>
          }
        />
        <Route
          path="/create-plaid-account"
          element={
            <AuthRoute requiredState={AuthState.FULLY_AUTHENTICATED}>
              <ProtectedLayout>
                <AddPlaidAccountPage />
              </ProtectedLayout>
            </AuthRoute>
          }
        />
        <Route
          path="/manage-plaid-links"
          element={
            <AuthRoute requiredState={AuthState.FULLY_AUTHENTICATED}>
              <ProtectedLayout>
                <PlaidLinkManagementPage />
              </ProtectedLayout>
            </AuthRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
