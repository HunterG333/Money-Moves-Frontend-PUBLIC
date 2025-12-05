import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { meetsAuthRequirement } from "../utils/authUtils";
import { AuthState } from "../types";

interface AuthRouteProps {
  children: React.ReactNode;
  requiredState: AuthState; // minimum auth level
  fallbackPath?: string;
  exemptPaths?: string[];
}

const AuthRoute: React.FC<AuthRouteProps> = ({
  children,
  requiredState,
  fallbackPath = "/",
}) => {
  const { authState, isLoading, sessionExpired } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (sessionExpired) {
    return <Navigate to="/session-expired" replace />;
  }

  if (!meetsAuthRequirement(authState, requiredState)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
