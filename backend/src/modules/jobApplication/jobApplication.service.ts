const getJobApplicationModuleStatus = async (): Promise<{ ready: boolean }> => {
  return { ready: true };
};

export const jobApplicationService = {
  getJobApplicationModuleStatus,
};
