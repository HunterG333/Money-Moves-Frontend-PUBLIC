// src/components/toast/ToastProvider.tsx
import React, { useState, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import { Toast } from "./Toast";
import { ToastContextType, ToastProviderProps, ToastLevel } from "./types";

interface ToastItem {
  id: string;
  message: string;
  type: ToastLevel;
  duration: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  onConfirm: () => void;
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastLevel = "info", duration = 5000) => {
      const id = (crypto && typeof crypto.randomUUID === "function")
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmOptions({ title, message, onConfirm });
  }, []);

  // These are the presentational components the original context expected
  const ToastContainer = (): React.ReactElement | null => (
    <div style={{ position: "fixed", top: 80, right: 20, zIndex: 1055 }}>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          duration={t.duration}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>
  );

  const ConfirmDialogComponent = (): React.ReactElement | null =>
    confirmOptions ? (
      <Modal show centered onHide={() => setConfirmOptions(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{confirmOptions.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirmOptions.message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmOptions(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              confirmOptions.onConfirm();
              setConfirmOptions(null);
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    ) : null;

  const value: ToastContextType = {
    showToast,
    showConfirm,
    ToastContainer,
    ConfirmDialogComponent,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* keep in DOM so toasts and confirm modal are visible without extra imports */}
      <ToastContainer />
      <ConfirmDialogComponent />
    </ToastContext.Provider>
  );
}
