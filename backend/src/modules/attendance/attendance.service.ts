const getAttendanceModuleStatus = async (): Promise<{ ready: boolean }> => {
  return { ready: true };
};

export const attendanceService = {
  getAttendanceModuleStatus,
};
