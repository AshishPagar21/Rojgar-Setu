import React from "react";
import { useTranslation } from "react-i18next";
import { HelpCircle } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-sm border border-brand-100 mb-4">
          <HelpCircle size={24} />
        </div>

        {/* Title */}
        <h3 className="text-center text-lg font-bold text-slate-900 leading-tight">
          {title}
        </h3>

        {/* Message */}
        <p className="mt-2 text-center text-sm text-slate-500 leading-relaxed">
          {message}
        </p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText || t("common.cancel", "Cancel")}
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={onConfirm}
            loading={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold"
          >
            {confirmText || t("common.confirm", "Confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
};
