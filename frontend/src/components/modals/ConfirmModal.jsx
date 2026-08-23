import React from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import Button from "../common/Button";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete Item",
  cancelText = "Cancel",
  loading = false,
  variant = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 animate-in zoom-in-95 duration-150 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-full flex-shrink-0 ${
            variant === "danger"
              ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
              : "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
          }`}>
            {variant === "danger" ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1 pr-6">
            <h3 className="text-base font-extrabold text-[#1E293B] leading-snug">
              {title}
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-xs font-bold text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <Button
            variant={variant === "danger" ? "danger" : "accent"}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="text-xs font-bold py-2 px-4"
          >
            {loading ? (
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
