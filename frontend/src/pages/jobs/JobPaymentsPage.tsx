import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { paymentService } from "../../modules/payment/payment.service";
import { getErrorMessage } from "../../utils/helpers";

export const JobPaymentsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [markingId, setMarkingId] = useState<number>();

  useEffect(() => {
    const fetchPayments = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        const data = await paymentService.getJobPayments(Number(jobId));
        setPayments(data);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [jobId]);

  const handleMarkPaid = async (paymentId: number) => {
    try {
      setMarkingId(paymentId);
      await paymentService.markPaymentSuccess(paymentId);
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: "SUCCESS" } : p)),
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
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Payments"
        subtitle="Track and manage worker payments"
      />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-panel bg-blue-50 p-4 shadow-panel">
          <p className="text-xs text-slate-600">Total Amount</p>
          <p className="text-2xl font-bold text-blue-600">₹{total}</p>
        </div>
        <div className="rounded-panel bg-green-50 p-4 shadow-panel">
          <p className="text-xs text-slate-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">₹{paidAmount}</p>
        </div>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center text-slate-600">
          <p>No payments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-panel bg-white p-4 shadow-panel"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">
                  {payment.worker.name}
                </p>
                <p className="text-sm text-slate-600">₹{payment.amount}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={payment.status} />
                {payment.status === "PENDING" && (
                  <Button
                    variant="secondary"
                    onClick={() => handleMarkPaid(payment.id)}
                    loading={markingId === payment.id}
                    className="text-xs"
                  >
                    Mark Paid
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
