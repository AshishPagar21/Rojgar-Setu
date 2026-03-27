const getJobModuleStatus = async (): Promise<{ ready: boolean }> => {
  return { ready: true };
};

export const jobService = {
  getJobModuleStatus,
};
