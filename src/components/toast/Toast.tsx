import { useState, useEffect } from "react";
import "./Toast.css";

export interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  const close = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300); // wait for animation
  };

  useEffect(() => {
    const timer = setTimeout(close, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`custom-toast custom-toast-${type}`}
      role="alert"
      aria-live="assertive"
    >
      <span>{message}</span>
      <button onClick={close}>×</button>
    </div>
  );
}
