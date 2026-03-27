const getEmployerModuleStatus = async (): Promise<{ ready: boolean }> => {
  return { ready: true };
};

export const employerService = {
  getEmployerModuleStatus,
};
