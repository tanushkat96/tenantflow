import { useState } from "react";
import Toast from "./Toast";
import ToastContext from "./ToastContext";

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (title, message) => {
    showToast({ type: "success", title, message });
  };

  const error = (title, message) => {
    showToast({ type: "error", title, message });
  };

  const info = (title, message) => {
    showToast({ type: "info", title, message });
  };

  const notification = (title, message) => {
    showToast({ type: "notification", title, message });
  };

  const value = {
    success,
    error,
    info,
    notification,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-20 right-6 z-[100] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
              duration={toast.duration || 5000}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
