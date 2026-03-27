const getWorkerModuleStatus = async (): Promise<{ ready: boolean }> => {
  return { ready: true };
};

export const workerService = {
  getWorkerModuleStatus,
};
