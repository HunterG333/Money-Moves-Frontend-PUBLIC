import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import * as AppHelper from "../api/api";
import { UserDataDTO } from "../types";
import { useToast } from "./toast";

interface TutorialModalProps {
  show: boolean;
  onClose: () => void;
  onNavigateToAccounts?: () => void;
}

export default function TutorialModal({ show, onClose, onNavigateToAccounts, }: TutorialModalProps) {
  const [userData, setUserData] = useState<UserDataDTO>({
    email: "",
    name: "",
    completedTutorial: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1); // <-- step 1 = info, step 2 = about, step 3 = dashboard, step 4 = Accounts
  const [infoConfirmed, setInfoConfirmed] = useState(false);
  
  const { showToast } = useToast();

  const totalSteps = 4;

  const dotStyle = (active: boolean) => ({
  width: 10,
  height: 10,
  borderRadius: "50%",
  margin: "0 4px",
  backgroundColor: active ? "#0d6efd" : "#dee2e6",
  transition: "background-color 0.3s ease",
});

  useEffect(() => {
    if (show) {
      setLoading(true);
      AppHelper.getUserData()
        .then((data) => {
          setUserData(data);
          // if user already confirmed info, skip step 1
          if (data.completedTutorial) {
            setInfoConfirmed(true);
            setStep(2);
          } else {
            setInfoConfirmed(false);
            setStep(1);
          }
        })
        .catch((err) => console.error("Failed to load user data:", err))
        .finally(() => setLoading(false));
    }
  }, [show]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleConfirmInfo = async () => {
    if (!userData.name.trim()) {
      showToast("Please enter your name.");
      return;
    }
    if (!userData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      showToast("Please enter a valid email address.");
      return;
    }



    setSaving(true);
    try {
      await AppHelper.updateUserData({
        ...userData,
        completedTutorial: false, // not done yet, just confirmed info
      });
      setInfoConfirmed(true);
      setStep(2);
    } catch (err) {
      console.error("Failed to confirm info:", err);
    } finally {
      setSaving(false);
    }
  };

   const handleNext = () => setStep((prev) => Math.min(totalSteps, prev + 1));
  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  const handleSkip = async() => {
    setSaving(true);
    try {
      await AppHelper.updateUserData({
        ...userData,
        completedTutorial: true,
      });
      onClose();
    }catch (err) {
      console.error("Failed to finish tutorial:", err);
    }finally {
      setSaving(false);
    }
  };

  const finishTutorial = async (navigateTo?: "dashboard" | "accounts") => {
    setSaving(true);
    try {
      await AppHelper.updateUserData({
        ...userData,
        completedTutorial: true,
      });
      onClose();
      if (navigateTo === "accounts" && onNavigateToAccounts) {
        onNavigateToAccounts();
      }
    } catch (err) {
      console.error("Failed to finish tutorial:", err);
    } finally {
      setSaving(false);
    }
  };

  const renderDots = () => (
  <div className="d-flex justify-content-center mb-3">
    {Array.from({ length: totalSteps }, (_, i) => {
      const stepNumber = i + 1;
      const clickable =
        infoConfirmed || stepNumber === 1 || userData.completedTutorial; 

      return (
        <div
          key={i}
          onClick={() => clickable && setStep(stepNumber)}
          style={{
            ...dotStyle(stepNumber === step),
            cursor: clickable ? "pointer" : "not-allowed",
            opacity: clickable ? 1 : 0.5,
          }}
        />
      );
    })}
  </div>
);


  const renderContent = () => {
    if (loading) return <p>Loading your info...</p>;

    switch (step) {
      case 1:
        return (
          <>
            <p>Before we begin, please confirm your info.</p>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  type="text"
                  value={userData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </Form.Group>
            </Form>
          </>
        );

      case 2:
        return (
          <>
            <p>
              <strong>Welcome to Money Moves!</strong> This app helps you
              visualize and manage your financial life.
            </p>
            <ul>
              <li>Connect your accounts securely via Plaid</li>
              <li>Track your net worth over time</li>
              <li>Manage assets, investments, and debts balances easily</li>
            </ul>
          </>
        );

      case 3:
        return (
          <>
            <h5>Dashboard Overview</h5>
            <p>Your dashboard gives you a snapshot of your financial health.</p>
            <ul>
              <li>View net worth charts and growth trends</li>
              <li>Track investment, asset, and debt account totals</li>
            </ul>
          </>
        );

      case 4:
        return (
          <>
            <h5>Account Management</h5>
            <p>Here you can connect, refresh, or hide your financial accounts.</p>
            <ul>
              <li>Link accounts via Plaid or create manual ones</li>
              <li>Update account information on the fly</li>
              <li>Hide unused or duplicate accounts</li>
            </ul>
            <p>Ready to take control of your finances?</p>
          </>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 1:
        return "Confirm Your Info";
      case 2:
        return "About Money Moves";
      case 3:
        return "Dashboard Overview";
      case 4:
        return "Account Management";
      default:
        return "";
    }
  };

  return (
    <Modal
      show={show}
      onHide={infoConfirmed ? onClose : undefined}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton={false}>
        <Modal.Title>{getTitle()}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {renderDots()}
        {renderContent()}
      </Modal.Body>

      <Modal.Footer>
        {step === 1 && (
          <Button variant="primary" onClick={handleConfirmInfo} disabled={saving}>
            {saving ? "Saving..." : "Next"}
          </Button>
        )}

        {step === 2 && (
          <>
            <Button variant="outline-danger" size="sm" onClick={handleSkip}>
              Skip Tutorial
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Continue
            </Button>
          </>
        )}

        {step > 2 && step < totalSteps && (
          <>
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Next
            </Button>
          </>
        )}

        {step === totalSteps && (
          <>
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => finishTutorial("dashboard")}
              disabled={saving}
            >
              {saving ? "Saving..." : "Explore Dashboard"}
            </Button>
            <Button
              variant="primary"
              onClick={() => finishTutorial("accounts")}
              disabled={saving}
            >
              {saving ? "Saving..." : "Go to Account Management"}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
