import React from "react";

interface JobCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  wage: number;
  jobDate: string;
  requiredWorkers: number;
  status: "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  employerName: string;
  employerRating?: number;
  onViewDetails: (jobId: number) => void;
  onApply?: (jobId: number) => void;
  onSelectWorkers?: (jobId: number) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  description,
  category,
  wage,
  jobDate,
  requiredWorkers,
  status,
  employerName,
  employerRating,
  onViewDetails,
  onApply,
  onSelectWorkers,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800";
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-slate-500">{employerName}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
        >
          {status}
        </span>
      </div>

      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className="text-slate-500">Category</span>
          <p className="font-medium text-slate-900">{category}</p>
        </div>
        <div>
          <span className="text-slate-500">Wage</span>
          <p className="font-medium text-slate-900">₹{wage}</p>
        </div>
        <div>
          <span className="text-slate-500">Date</span>
          <p className="font-medium text-slate-900">
            {new Date(jobDate).toLocaleDateString()}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Workers Needed</span>
          <p className="font-medium text-slate-900">{requiredWorkers}</p>
        </div>
      </div>

      {employerRating !== undefined && (
        <div className="mb-4 text-sm">
          <span className="text-slate-500">Rating</span>
          <p className="font-medium text-slate-900">
            {employerRating > 0
              ? `${employerRating.toFixed(1)} ⭐`
              : "No ratings"}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(id)}
          className="flex-1 h-12 bg-brand-100 hover:bg-brand-50 text-brand-700 font-medium rounded-lg transition-colors"
        >
          View Details
        </button>
        {onApply && (
          <button
            onClick={() => onApply(id)}
            className="flex-1 h-12 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors"
          >
            Apply
          </button>
        )}
        {onSelectWorkers && (
          <button
            onClick={() => onSelectWorkers(id)}
            className="flex-1 h-12 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors"
          >
            Select Workers
          </button>
        )}
      </div>
    </div>
  );
};
