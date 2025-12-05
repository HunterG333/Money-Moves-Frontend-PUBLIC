import { useEffect } from "react";
import * as AppHelper from "../api/api";
import { AuthState } from "../types";
import { useAuth } from "../hooks/useAuth";

function HomePage() {
  const { sessionExpired } = useAuth();
  
  // Check if user is in MFA state and log them out if they are
  useEffect(() => {
    if (sessionExpired) return;

    const checkAndLogout = async () => {
      try {
        const authState = await AppHelper.getAuthState();
        if (authState.state ===  AuthState.LOGGED_IN) {
          // User is logged in but not MFA verified - log them out
          await AppHelper.handleLogout();
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      }
    };

    checkAndLogout();
  }, [sessionExpired]);

  return (
    <div className="min-vh-100 bg-light">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                <i className="bi bi-graph-up me-3"></i>
                Money Moves
              </h1>
              <p className="lead mb-4">
                Take control of your financial future with our money management platform. 
                Track your net worth, manage accounts, and make informed financial decisions.
              </p>
              <button 
                onClick={AppHelper.handleLogin} 
                className="btn btn-light btn-lg d-flex align-items-center gap-2"
              >
                <i className="bi bi-box-arrow-in-right"></i>
                Get Started
              </button>
            </div>
            <div className="col-lg-6 text-center">
              <div className="bg-white bg-opacity-10 rounded p-4">
                <i className="bi bi-shield-check display-1"></i>
                <h3 className="mt-3">Secure & Protected</h3>
                <p className="mb-0">Bank-level security with multi-factor authentication</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-5">
        <div className="container">
          <div className="row text-center mb-5">
            <div className="col-12">
              <h2 className="fw-bold mb-3">Why Choose Money Moves?</h2>
              <p className="text-muted">Everything you need to manage your finances in one place</p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                    <i className="bi bi-graph-up text-primary fs-3"></i>
                  </div>
                  <h5 className="card-title fw-bold">Net Worth Tracking</h5>
                  <p className="card-text text-muted">
                    Monitor your financial progress with detailed net worth graphs and analytics.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                    <i className="bi bi-bank text-success fs-3"></i>
                  </div>
                  <h5 className="card-title fw-bold">Bank Integration</h5>
                  <p className="card-text text-muted">
                    Securely connect your bank accounts via Plaid for automatic data synchronization.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                    <i className="bi bi-shield-check text-warning fs-3"></i>
                  </div>
                  <h5 className="card-title fw-bold">Multi-Factor Security</h5>
                  <p className="card-text text-muted">
                    Enhanced security with two-factor authentication to protect your financial data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-dark text-white py-5">
        <div className="container text-center">
          <h3 className="fw-bold mb-3">Ready to take control of your finances?</h3>
          <p className="lead mb-4">Join thousands of users who are already managing their money smarter.</p>
          <button 
            onClick={AppHelper.handleLogin} 
            className="btn btn-primary btn-lg d-flex align-items-center gap-2 mx-auto"
          >
            <i className="bi bi-box-arrow-in-right"></i>
            Start Your Financial Journey
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 