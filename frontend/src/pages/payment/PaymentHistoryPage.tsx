import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { paymentService } from "../../modules/payment/payment.service";
import { socketService } from "../../services/socket.service";


export const PaymentHistoryPage = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getMyPayments();
      setPayments(data);
    } catch (err) {
      setError(t("payment.failedToLoad"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    const handlePaymentUpdate = (updatedPayment: any) => {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === updatedPayment.id ? { ...p, ...updatedPayment } : p
        )
      );
    };

    socketService.on("payment:paid", handlePaymentUpdate);
    socketService.on("payment:confirmed", handlePaymentUpdate);

    return () => {
      socketService.off("payment:paid", handlePaymentUpdate);
      socketService.off("payment:confirmed", handlePaymentUpdate);
    };
  }, []);

  const handleConfirmReceived = async (paymentId: number) => {
    try {
      setProcessingId(paymentId);
      await paymentService.confirmPaymentReceived(paymentId);
      // Refresh listing data to capture structural status modifications
      const updatedData = await paymentService.getMyPayments();
      setPayments(updatedData);
    } catch (err) {
      alert(t("payment.failedToConfirm"));
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">{t("common.loading")}</p>
      </div>
    );
  }

  const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalReceived = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title={t("payment.historyTitle")} subtitle={t("payment.historySubtitle")} />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Panels */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-panel bg-blue-50 p-4 shadow-panel">
          <p className="text-xs text-slate-600">{t("payment.totalEarned")}</p>
          <p className="text-2xl font-bold text-blue-600">₹{totalEarnings}</p>
        </div>
        <div className="rounded-panel bg-green-50 p-4 shadow-panel">
          <p className="text-xs text-slate-600">{t("payment.totalReceived")}</p>
          <p className="text-2xl font-bold text-green-600">₹{totalReceived}</p>
        </div>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">{t("payment.noPayments")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const isWaitingConfirmation =
              payment.employerConfirmed && payment.status !== "COMPLETED";

            return (
              <div
                key={payment.id}
                className="rounded-panel bg-white p-4 shadow-panel space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {payment.job.title}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                    {payment.paymentMethod && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t("payment.paidVia")}:{" "}
                        <span className="font-semibold text-slate-700">
                          {payment.paymentMethod === "CASH"
                            ? t("payment.cash")
                            : t("payment.onlineUpi")}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">
                      ₹{payment.amount}
                    </p>
                    <StatusBadge status={payment.status} />
                  </div>
                </div>

                {/* Confirm Receipt Action Block */}
                {isWaitingConfirmation && (
                  <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between gap-4 bg-yellow-50/50 p-2.5 rounded-lg">
                    <p className="text-xs text-amber-800">
                      {t("payment.receiptPrompt")}
                    </p>
                    <button
                      onClick={() => handleConfirmReceived(payment.id)}
                      disabled={processingId === payment.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium text-xs rounded transition whitespace-nowrap"
                    >
                      {processingId === payment.id
                        ? t("payment.confirming")
                        : t("payment.confirmReceived")}
                    </button>
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
