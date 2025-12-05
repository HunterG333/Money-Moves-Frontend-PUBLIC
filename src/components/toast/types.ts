// src/components/toast/types.ts

import React from "react";

export type ToastLevel = "success" | "error" | "warning" | "info";

export interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastLevel,
    duration?: number
  ) => string;

  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: "danger" | "warning" | "info";
    }
  ) => void;

  ToastContainer: () => React.ReactElement | null;
  ConfirmDialogComponent: () => React.ReactElement | null;
}

export interface ToastProviderProps {
  children: React.ReactNode;
}
