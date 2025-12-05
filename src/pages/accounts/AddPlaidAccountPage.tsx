import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";
import { useToast } from "../../components/toast";
import { useAuth } from "../../hooks/useAuth";
import { LinkPlaidAccountButton } from "../../components/LinkPlaidAccountButton";
import { useRefresh } from "../../components/RefreshContext";


function AddPlaidAccountPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setRefresh } = useRefresh();

  const { showToast } = useToast();
  const { isLoggedIn } = useAuth();

  // redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleSuccess = () => {
    showToast("Bank account connected successfully!", "success");
    setRefresh((prev) => !prev);
    navigate("/dashboard");
  };

  const handleError = (message: string) => {
    setError(message);
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h3 className="mb-0">
                <i className="bi bi-bank me-2"></i>
                Connect Bank Account
              </h3>
            </Card.Header>

            <Card.Body className="p-4">
              {error && (
                <Alert
                  variant="danger"
                  onClose={() => setError(null)}
                  dismissible
                >
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {/* Intro / info content */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-bank fa-3x text-primary"></i>
                </div>
                <h5>Securely Connect Your Bank</h5>
                <p className="text-muted">
                  Link your bank accounts using Plaid's secure platform to
                  automatically sync your financial data and keep your dashboard
                  up to date.
                </p>
              </div>

              <div className="d-grid gap-2">
                <LinkPlaidAccountButton
                  onSuccess={handleSuccess}
                  onError={handleError}
                />

                <Button
                  variant="outline-secondary"
                  onClick={() => navigate("/account-management")}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Account Management
                </Button>
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AddPlaidAccountPage;
