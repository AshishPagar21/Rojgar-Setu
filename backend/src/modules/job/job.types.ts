export interface CreateJobPayload {
  title: string;
  description: string;
  category: string;
  wage: number;
  jobDate: string; // ISO date string
  requiredWorkers: number;
  locationLine1: string;
  city: string;
  landmark: string;
  latitude: number;
  longitude: number;
}

export interface JobFilters {
  category?: string;
  date?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
}
