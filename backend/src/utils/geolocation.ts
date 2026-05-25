/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * SQL formula for calculating distance between coordinates
 * Used in Prisma raw queries
 * Returns distance in kilometers
 */
export const getDistanceSQL = (
  workerLat: string | number,
  workerLon: string | number,
  jobLat: string | number,
  jobLon: string | number,
): string => {
  return `
    6371 * acos(
      cos(radians(${workerLat})) * 
      cos(radians(${jobLat})) * 
      cos(radians(${jobLon}) - radians(${workerLon})) + 
      sin(radians(${workerLat})) * 
      sin(radians(${jobLat}))
    )
  `;
};
