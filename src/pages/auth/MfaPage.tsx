import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import * as Api from "../../api/api";
import { fetchCsrfToken } from "../../api/client";
import { useToast } from "../../components/toast";
import { useAuth } from "../../hooks/useAuth";
import { AuthState } from "../../types";
import { useRefresh } from "../../components/RefreshContext";

function MfaPage() {
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const {setRefresh} = useRefresh();
  const navigate = useNavigate();
  
  // Get access to the toast system from the context
  const { showToast } = useToast();
  
  // Get authentication functions from the centralized hook
  const { refreshAuthState } = useAuth();

  // Check if user should be on MFA page
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authState = await Api.getAuthState();
        
        if (authState.state === AuthState.LOGGED_OUT) {
          // User not logged in, redirect to home
          navigate("/");
          return;
        }

        if (authState.state === AuthState.FULLY_AUTHENTICATED) {
          // User is fully authenticated, redirect to dashboard
          navigate("/dashboard");
          return;
        }

        // User is logged in but needs MFA - this is correct state
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth state:", error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      const response = await Api.verifyMfaCode(code);
      if (response.status === 200) {
        // Refresh the centralized authentication state first
        await refreshAuthState();
        
        // Then refresh the app data
        setRefresh((prev) => !prev);

        navigate("/dashboard");
      } else {
        setErrorMessage("Invalid or expired code. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage("");
    
    try {
      await Api.resendMfaCode();
      // Show a success toast notification instead of using alert()
      showToast("MFA code has been resent!", "success");
    } catch (error) {
      setErrorMessage("Failed to resend MFA code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: "400px", width: "90%" }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h3 className="mb-0">
            <i className="bi bi-shield-check me-2"></i>
            Two-Factor Authentication
          </h3>
        </div>
        
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div className="mb-3">
              <i className="bi bi-phone fa-3x text-muted"></i>
            </div>
            <p className="text-muted mb-0">
              Enter the verification code sent to your email
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="mfaCode" className="form-label fw-bold">
                Verification Code
              </label>
              <input
                type="text"
                id="mfaCode"
                autoFocus
                className={`form-control form-control-lg text-center ${errorMessage ? 'is-invalid' : ''}`}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                disabled={isSubmitting}
                style={{ fontSize: "1.5rem", letterSpacing: "0.5rem" }}
              />
              {errorMessage && (
                <div className="invalid-feedback d-block">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="d-grid gap-2">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={isSubmitting || !code.trim()}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-check me-2"></i>
                    Verify Code
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Resending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Resend Code
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MfaPage;
