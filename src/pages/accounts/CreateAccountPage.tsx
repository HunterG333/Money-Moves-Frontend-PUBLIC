import React, { useState, useEffect } from "react";
import { NumericFormat } from "react-number-format";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import * as Api from "../../api/api";
import { fetchCsrfToken } from "../../api/client";
import { useToast } from "../../components/toast";
import { useAuth } from "../../hooks/useAuth";
import { AccountType } from "../../types";
import { useRefresh } from "../../components/RefreshContext";

// Map account types to icon + color + description
const accountTypeConfig: Record<
  AccountType,
  { icon: string; color: string; description: string }
> = {
  [AccountType.INVESTMENT_ACCOUNT]: {
    icon: "bi bi-graph-up",
    color: "success",
    description: "Stocks, bonds, retirement accounts, etc.",
  },
  [AccountType.ASSET_ACCOUNT]: {
    icon: "bi bi-piggy-bank",
    color: "primary",
    description: "Savings, checking, real estate, vehicles, etc.",
  },
  [AccountType.DEBT_ACCOUNT]: {
    icon: "bi bi-credit-card",
    color: "warning",
    description: "Credit cards, loans, mortgages, etc.",
  },
};

function CreateAccountPage() {
  const [formData, setFormData] = useState({
    name: "",
    value: 0,
    accountType: AccountType.INVESTMENT_ACCOUNT,
    userGivenName: "",
    valueFormatted: "0.00",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setRefresh } = useRefresh();

  const { showToast } = useToast();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "value" ? parseFloat(value) || 0 : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Account name is required");
      return false;
    }
    if (isNaN(formData.value) || formData.value < 0) {
      setError("Please enter a valid positive number for the account value");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const accountData = {
        name: formData.name.trim(),
        value: formData.value,
        accountType: formData.accountType,
        userGivenName: formData.userGivenName.trim() || undefined,
      };

      const response = await Api.createAccount(accountData);

      if (response?.status === 201) {
        showToast("Account created successfully!", "success");
        setRefresh((prev) => !prev);
        navigate("/dashboard"); 
      } else {
        const json = await response?.json();
        setError(
          json?.message || "Failed to create account. Please try again."
        );
      }
    } catch (err: any) {
      console.error("Error creating account:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "An error occurred while creating the account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h3 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                Create New Account
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

              <Form onSubmit={handleSubmit}>
                {/* Account Type Selection */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Account Type</Form.Label>
                  <Row className="g-3">
                    {Object.entries(accountTypeConfig).map(
                      ([type, { icon, color, description }]) => (
                        <Col key={type} xs={12} sm={4}>
                          <input
                            type="radio"
                            className="btn-check"
                            name="accountType"
                            id={type}
                            value={type}
                            checked={formData.accountType === type}
                            onChange={handleInputChange}
                            autoComplete="off"
                          />
                          <label
                            className={`btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 border-2 rounded ${
                              formData.accountType === type
                                ? `btn-${color}`
                                : "btn-outline-secondary"
                            }`}
                            htmlFor={type}
                          >
                            <i
                              className={`${icon} mb-2 text-${color}`}
                              style={{ fontSize: "1.5rem" }}
                            ></i>
                            <span className="fw-semibold">
                              {type.replace("_", " ")}
                            </span>
                            <small className="text-muted text-center mt-1">
                              {description}
                            </small>
                          </label>
                        </Col>
                      )
                    )}
                  </Row>
                </Form.Group>

                {/* Account Name */}
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="name" className="fw-bold">
                    Account Name <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Chase Savings, Vanguard 401k, etc."
                    required
                    disabled={isSubmitting}
                  />
                  <Form.Text className="text-muted">
                    This is the name that will be displayed in your dashboard
                  </Form.Text>
                </Form.Group>

                {/* Custom Display Name */}
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="userGivenName" className="fw-bold">
                    Custom Display Name (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    id="userGivenName"
                    name="userGivenName"
                    value={formData.userGivenName}
                    onChange={handleInputChange}
                    placeholder="e.g., Emergency Fund, Retirement, etc."
                    disabled={isSubmitting}
                  />
                  <Form.Text className="text-muted">
                    A friendly name to help you identify this account
                  </Form.Text>
                </Form.Group>

                {/* Account Value */}
                <NumericFormat
                  className="form-control"
                  id="value"
                  name="value"
                  value={formData.value || ""} // start empty
                  thousandSeparator
                  decimalScale={2}
                  fixedDecimalScale
                  placeholder="0.00"
                  onValueChange={(values) => {
                    setFormData({
                      ...formData,
                      value: values.floatValue || 0,
                    });
                  }}
                  onFocus={(e) => {
                    // If empty, cursor at start
                    if (!formData.value) {
                      e.currentTarget.setSelectionRange(0, 0);
                    } else {
                      // Optional: select all existing value
                      e.currentTarget.select();
                    }
                  }}
                  disabled={isSubmitting}
                />

                {/* Submit Buttons */}
                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Create Account
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => navigate("/account-management")}
                    disabled={isSubmitting}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Account Management
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CreateAccountPage;
