import { Link } from "react-router-dom";
import { useState } from "react";

import * as Api from "../../api/api";
import { useToast } from "../toast";
import { useAuth } from "../../hooks/useAuth";
import { HeaderButton } from "../ui/HeaderButton";
import { SettingsDropdown } from "../ui/SettingsDropdown";

interface Props {
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
  onOverrideGraphData?: () => void;
  isTestDataActive?: boolean;
}

function Header({ setRefresh, onOverrideGraphData, isTestDataActive }: Props) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCleaningUpMFA, setIsCleaningUpMFA] = useState(false);
  
  // Get access to the toast system from the context
  const { showToast } = useToast();
  
  // Get authentication state from the centralized hook
  const { isLoggedIn, isFullyAuthenticated, login, logout } = useAuth();

  const forceRefresh = async () => {
    setRefresh?.((prev) => !prev)
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(() => setRefresh?.((prev) => !prev));
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCleanup = async () => {
    setIsCleaningUpMFA(true);
    try {
      await Api.cleanupMfaTokens();
      showToast("MFA tokens cleaned up successfully!", "success");
    } catch (error) {
      console.error("Cleanup failed:", error);
      showToast("Failed to cleanup MFA tokens. Please try again.", "error");
    } finally {
      setIsCleaningUpMFA(false);
    }
  };

  const overrideGraphData = async () => {
    onOverrideGraphData?.();
    showToast(
      isTestDataActive 
        ? "Switched back to real data" 
        : "Test data activated for graph testing", 
      "success"
    );
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        {/* Logo/Brand */}
        <Link
          className="navbar-brand d-flex align-items-center"
          to={isFullyAuthenticated ? "/dashboard" : "/"}
          onClick={forceRefresh}
        >
          <i className="bi bi-graph-up me-2"></i>
          <strong>Money Moves</strong>
        </Link>

        {/* Right-aligned buttons */}
        <div className="d-flex align-items-center gap-2">
          {isFullyAuthenticated && (
            <>
              <HeaderButton to="/dashboard" icon="bi-house" label="Dashboard" />
              <HeaderButton to="/account-management" icon="bi-people" label="Account Management" />
            

              <SettingsDropdown
                isCleaningUpMFA={isCleaningUpMFA}
                onCleanup={handleCleanup}
                isTestDataActive={isTestDataActive}
                onOverrideGraphData={overrideGraphData}
                onForceRefresh={Api.checkForceRefresh}
              />
            </>
          )}


          {/* Login/Logout Button */}
          {isLoggedIn ? (
            <button 
              onClick={handleLogout} 
              disabled={isLoggingOut}
              className="btn btn-outline-light d-flex align-items-center gap-2"
              style={{ height: "40px" }}
            >
              {isLoggingOut ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span className="d-none d-sm-inline">Logging out...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-right"></i>
                  <span className="d-none d-sm-inline">Logout</span>
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={login} 
              className="btn btn-light d-flex align-items-center gap-2"
              style={{ height: "40px" }}
            >
              <i className="bi bi-box-arrow-in-right"></i>
              <span className="d-none d-sm-inline">Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
