export interface CreateJobPayload {
  title: string;
  description: string;
  category: string;
  wage: number;
  jobDate: string; // ISO date string
  requiredWorkers: number;
  latitude: number;
  longitude: number;
}

export interface JobFilters {
  category?: string;
  date?: string;
}
