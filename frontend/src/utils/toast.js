import toast from "react-hot-toast";

/**
 * Show custom styled success toast notification
 * @param {string} message - Notification text
 */
export const notifySuccess = (message) => {
  return toast.success(message, {
    style: {
      border: "1px solid #10B981",
      padding: "12px 16px",
      color: "#065F46",
      background: "#ECFDF5",
      fontWeight: "600",
      fontSize: "13px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
    },
    iconTheme: {
      primary: "#10B981",
      secondary: "#FFFFFF",
    },
    duration: 4000,
  });
};

/**
 * Show custom styled error toast notification
 * @param {string} message - Notification text
 */
export const notifyError = (message) => {
  return toast.error(message, {
    style: {
      border: "1px solid #EF4444",
      padding: "12px 16px",
      color: "#991B1B",
      background: "#FEF2F2",
      fontWeight: "600",
      fontSize: "13px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
    },
    iconTheme: {
      primary: "#EF4444",
      secondary: "#FFFFFF",
    },
    duration: 5000,
  });
};

/**
 * Show custom styled info toast notification
 * @param {string} message - Notification text
 */
export const notifyInfo = (message) => {
  return toast(message, {
    icon: "ℹ️",
    style: {
      border: "1px solid #3B82F6",
      padding: "12px 16px",
      color: "#1E40AF",
      background: "#EFF6FF",
      fontWeight: "600",
      fontSize: "13px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
    },
    duration: 3500,
  });
};

/**
 * Show custom loading toast notification
 * @param {string} message - Loading message
 */
export const notifyLoading = (message) => {
  return toast.loading(message, {
    style: {
      border: "1px solid #6366F1",
      padding: "12px 16px",
      color: "#3730A3",
      background: "#EEF2FF",
      fontWeight: "600",
      fontSize: "13px",
      borderRadius: "12px",
    },
  });
};

/**
 * Dismiss an active toast notification
 * @param {string} toastId
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export default toast;
