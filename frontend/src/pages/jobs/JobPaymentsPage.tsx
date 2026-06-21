import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { paymentService } from "../../modules/payment/payment.service";
import { getErrorMessage } from "../../utils/helpers";

export const JobPaymentsPage = () => {
  const { t } = useTranslation();
  const { jobId } = useParams<{ jobId: string }>();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [markingId, setMarkingId] = useState<number>();

  // Track selected payment methods dynamically per payment row ID
  const [selectedMethods, setSelectedMethods] = useState<
    Record<number, "CASH" | "ONLINE_UPI">
  >({});

  useEffect(() => {
    const fetchPayments = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        const data = await paymentService.getJobPayments(Number(jobId));
        setPayments(data);
      } catch (err) {
        setError(t("payment.failedToLoad"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [jobId]);

  const handleMethodChange = (
    paymentId: number,
    method: "CASH" | "ONLINE_UPI",
  ) => {
    setSelectedMethods((prev) => ({ ...prev, [paymentId]: method }));
  };

  const handleMarkPaid = async (paymentId: number) => {
    const method = selectedMethods[paymentId] || "CASH"; // Fallback default safety check
    try {
      setMarkingId(paymentId);
      await paymentService.markPaymentSuccess(paymentId, method);

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                employerConfirmed: true,
                status: "PENDING",
                paymentMethod: method,
              }
            : p,
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    } finally {
      setMarkingId(undefined);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">{t("common.loading")}</p>
      </div>
    );
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("payment.jobPaymentsTitle")}    
        subtitle={t("payment.jobPaymentsSubtitle")}
      />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-panel bg-blue-50 p-4 shadow-panel">
          <p className="text-xs text-slate-600">{t("payment.totalAmount")}</p>
          <p className="text-2xl font-bold text-blue-600">₹{total}</p>
        </div>
        <div className="rounded-panel bg-green-50 p-4 shadow-panel">
          <p className="text-xs text-slate-600">{t("payment.paid")}</p>
          <p className="text-2xl font-bold text-green- green-600">
            ₹{paidAmount}
          </p>
        </div>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center text-slate-600">
          <p>{t("payment.noPayments")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const currentMethod = selectedMethods[payment.id] || "CASH";
            const isPendingAction =
              payment.status === "PENDING" && !payment.employerConfirmed;

            return (
              <div
                key={payment.id}
                className="rounded-panel bg-white p-4 shadow-panel space-y-4"
              >
                {/* Info Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {payment.worker.name}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">
                      ₹{payment.amount}
                    </p>
                    {payment.paymentMethod && (
                      <p className="text-xs text-slate-500 mt-1">
                        {t("payment.markedVia")}:{" "}
                        <span className="font-medium text-slate-700">
                          {payment.paymentMethod === "CASH"
                            ? t("payment.cash")
                            : t("payment.onlineUpi")}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={payment.status} />
                  </div>
                </div>

                {/* Method Input Form & Button Section */}
                {isPendingAction && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name={`method-${payment.id}`}
                          checked={currentMethod === "CASH"}
                          onChange={() =>
                            handleMethodChange(payment.id, "CASH")
                          }
                          className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        {t("payment.cash")}
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name={`method-${payment.id}`}
                          checked={currentMethod === "ONLINE_UPI"}
                          onChange={() =>
                            handleMethodChange(payment.id, "ONLINE_UPI")
                          }
                          className="text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                        {t("payment.onlineUpi")}
                      </label>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => handleMarkPaid(payment.id)}
                      loading={markingId === payment.id}
                      className="text-xs px-4 py-2"
                    >
                      {currentMethod === "CASH" ? t("payment.markPaidCash") : t("payment.markPaidUpi")}
                    </Button>
                  </div>
                )}

                {/* Verification Progress Message */}
                {payment.employerConfirmed && payment.status === "PENDING" && (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 p-2.5 rounded-lg text-center font-medium">
                    {t("payment.waitingWorkerConfirmation")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
