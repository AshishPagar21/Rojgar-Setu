import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { attendanceService } from "../../modules/attendance/attendance.service";

export const AttendanceHistoryPage = () => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getMyAttendance();
        setRecords(data);
      } catch (err) {
        setError(t("attendance.failedToLoad"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">{t("common.loading")}</p>
      </div>
    );
  }

  const calculateHours = (checkIn: string, checkOut: string) => {
    const inTime = new Date(checkIn).getTime();
    const outTime = new Date(checkOut).getTime();
    return ((outTime - inTime) / (1000 * 60 * 60)).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("attendance.historyTitle")} subtitle={t("attendance.historySubtitle")} />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {records.length === 0 ? (
        <div className="rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">{t("attendance.noRecords")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="rounded-panel bg-white p-4 shadow-panel"
            >
              <p className="font-medium text-slate-900">{record.job.title}</p>
              <div className="mt-2 space-y-1 text-sm">
                <p className="text-slate-600">
                  {t("attendance.status")}: <StatusBadge status={record.status} />
                </p>
                {record.checkInTime && (
                  <p className="text-slate-600">
                    {t("attendance.checkIn")}:{" "}
                    {new Date(record.checkInTime).toLocaleTimeString()}
                  </p>
                )}
                {record.checkOutTime && (
                  <>
                    <p className="text-slate-600">
                      {t("attendance.checkOut")}:{" "}
                      {new Date(record.checkOutTime).toLocaleTimeString()}
                    </p>
                    <p className="font-semibold text-slate-900">
                      {t("attendance.hoursWorked")}:{" "}
                      {calculateHours(record.checkInTime, record.checkOutTime)}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
