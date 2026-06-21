import { Button } from "./Button";
import { RatingForm } from "./RatingForm";

interface RatingPopupProps {
  open: boolean;
  title: string;
  subtitle?: string;
  jobId: number;
  toUserId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RatingPopup = ({
  open,
  title,
  subtitle,
  jobId,
  toUserId,
  onClose,
  onSuccess,
}: RatingPopupProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Rating</p>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            ) : null}
          </div>

          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <RatingForm
          jobId={jobId}
          toUserId={toUserId}
          onSuccess={onSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};