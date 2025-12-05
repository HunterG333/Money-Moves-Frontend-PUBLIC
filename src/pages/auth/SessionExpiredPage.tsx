import { handleLogin } from "../../api/api";

export default function SessionExpiredPage() {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: "450px", width: "90%" }}>
        <div className="card-header bg-danger text-white text-center py-3">
          <h3 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Session Expired
          </h3>
        </div>

        <div className="card-body p-4 text-center">
          <p className="text-muted mb-4">
            Your session has timed out for security reasons.  
            Please log in again to continue.
          </p>

          <div className="d-grid gap-2">
            <button className="btn btn-primary btn-lg" onClick={handleLogin}>
              <i className="bi bi-box-arrow-in-right me-1"></i>
              Log In Again
            </button>

            <button
              className="btn btn-outline-secondary"
              onClick={() => (window.location.href = "/")}
            >
              <i className="bi bi-house me-1"></i>
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
