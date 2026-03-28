import { useEffect, useState } from "react";

import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { paymentService } from "../../modules/payment/payment.service";

export const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getMyPayments();
        setPayments(data);
      } catch (err) {
        setError("Failed to load payments");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalReceived = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Payment History" subtitle="Track your earnings" />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-panel bg-blue-50 p-4 shadow-panel">
          <p className="text-xs text-slate-600">Total Earned</p>
          <p className="text-2xl font-bold text-blue-600">₹{totalEarnings}</p>
        </div>
        <div className="rounded-panel bg-green-50 p-4 shadow-panel">
          <p className="text-xs text-slate-600">Received</p>
          <p className="text-2xl font-bold text-green-600">₹{totalReceived}</p>
        </div>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">No payments yet</p>
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
                  {payment.job.title}
                </p>
                <p className="text-sm text-slate-600">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-900">
                  ₹{payment.amount}
                </p>
                <StatusBadge status={payment.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
