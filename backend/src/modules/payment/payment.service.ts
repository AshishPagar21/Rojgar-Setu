const getPaymentModuleStatus = async (): Promise<{ ready: boolean }> => {
  return { ready: true };
};

export const paymentService = {
  getPaymentModuleStatus,
};
