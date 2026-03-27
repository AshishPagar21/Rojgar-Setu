const getRatingModuleStatus = async (): Promise<{ ready: boolean }> => {
  return { ready: true };
};

export const ratingService = {
  getRatingModuleStatus,
};
