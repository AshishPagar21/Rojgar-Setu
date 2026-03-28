import React from "react";

interface ApplicantCardProps {
  id: number;
  name: string;
  age?: number;
  gender?: string;
  rating: number;
  totalRatings: number;
  totalJobsCompleted: number;
  isSelected?: boolean;
  onToggleSelect?: (workerId: number) => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({
  id,
  name,
  age,
  gender,
  rating,
  totalRatings,
  totalJobsCompleted,
  isSelected = false,
  onToggleSelect,
}) => {
  return (
    <div
      className={`bg-white rounded-lg border-2 p-4 transition-all ${
        isSelected ? "border-brand-600 bg-brand-50" : "border-slate-200"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
          <div className="flex gap-2 text-sm text-slate-500 mt-1">
            {age && <span>Age: {age}</span>}
            {gender && <span>{gender}</span>}
          </div>
        </div>
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(id)}
            className="w-5 h-5 rounded border-slate-300 text-brand-600 cursor-pointer mt-2"
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div>
          <span className="text-slate-500">Rating</span>
          <p className="font-medium text-slate-900">
            {rating > 0 ? `${rating.toFixed(1)} ⭐` : "New"}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Reviews</span>
          <p className="font-medium text-slate-900">{totalRatings}</p>
        </div>
        <div>
          <span className="text-slate-500">Jobs Done</span>
          <p className="font-medium text-slate-900">{totalJobsCompleted}</p>
        </div>
      </div>

      {isSelected && (
        <div className="bg-brand-100 text-brand-700 px-3 py-2 rounded text-sm font-medium text-center">
          ✓ Selected
        </div>
      )}
    </div>
  );
};
