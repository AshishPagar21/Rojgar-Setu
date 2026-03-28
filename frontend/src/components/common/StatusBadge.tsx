import React from "react";

interface StatusBadgeProps {
  status:
    | "OPEN"
    | "ASSIGNED"
    | "COMPLETED"
    | "CANCELLED"
    | "APPLIED"
    | "SELECTED"
    | "REJECTED"
    | "PENDING"
    | "SUCCESS"
    | "FAILED";
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const getStyles = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800";
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "APPLIED":
        return "bg-yellow-100 text-yellow-800";
      case "SELECTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-orange-100 text-orange-800";
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return "px-2 py-1 text-xs";
      case "lg":
        return "px-4 py-2 text-base";
      default:
        return "px-3 py-1 text-sm";
    }
  };

  return (
    <span
      className={`rounded-full font-medium inline-block ${getSizeClasses(size)} ${getStyles(status)}`}
    >
      {status}
    </span>
  );
};
