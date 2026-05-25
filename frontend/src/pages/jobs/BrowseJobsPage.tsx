import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { JobCard } from "../../components/common/JobCard";
import { PageHeader } from "../../components/common/PageHeader";
import { Select } from "../../components/common/Select";
import { jobService } from "../../modules/job/job.service";
import { getCurrentLocation } from "../../utils/geolocation";

const extractLocation = (description: string) => {
  const match = description.match(/Location:\s*([^\n]+)/i);
  return match?.[1]?.trim();
};

const cleanDescription = (description: string) =>
  description.replace(/\n*\n*Location:\s*[^\n]+/i, "").trim();

const calculateDistance = (
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

export const BrowseJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [category, setCategory] = useState("");
  const [workerLocation, setWorkerLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [radius, setRadius] = useState<number>(10);
  const [locationError, setLocationError] = useState<string>();

  // Get worker's current location on mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setWorkerLocation(location);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not access location";
        setLocationError(message);
        console.log("Location access denied, showing all jobs");
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        let data;

        if (workerLocation) {
          // Use nearby API when we have worker coordinates
          data = await jobService.getNearbyJobs({
            latitude: workerLocation.latitude,
            longitude: workerLocation.longitude,
            radius,
          });
        } else {
          data = await jobService.getOpenJobs({
            category: category || undefined,
          });
        }

        // If backend returned distances, use them. Otherwise compute client-side.
        const jobsWithDistance = data.map((job: any) => ({
          ...job,
          distance:
            job.distance ??
            (workerLocation
              ? calculateDistance(
                  workerLocation.latitude,
                  workerLocation.longitude,
                  job.latitude,
                  job.longitude,
                )
              : null),
        }));

        setJobs(jobsWithDistance);
      } catch (err) {
        setError("Failed to load jobs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [category, workerLocation]);

  const categories = [
    { label: "All Categories", value: "" },
    { label: "Construction", value: "Construction" },
    { label: "Repairs", value: "Repairs" },
    { label: "Cleaning", value: "Cleaning" },
    { label: "Plumbing", value: "Plumbing" },
    { label: "Electrical", value: "Electrical" },
    { label: "Carpentry", value: "Carpentry" },
    { label: "Painting", value: "Painting" },
    { label: "Masonry", value: "Masonry" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Find Work" subtitle="Browse available jobs" />

      {workerLocation && (
        <div className="rounded bg-blue-50 p-3 text-sm text-blue-700">
          📍 Showing jobs within {radius}km of your location.
        </div>
      )}

      {locationError && (
        <div className="rounded bg-yellow-50 p-3 text-sm text-yellow-700">
          ⚠️ {locationError} - Showing all available jobs.
        </div>
      )}

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Select
        label="Filter by Category"
        options={categories}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <Select
        label="Radius (km)"
        options={[
          { label: "10 km", value: "10" },
          { label: "20 km", value: "20" },
          { label: "30 km", value: "30" },
          { label: "50 km", value: "50" },
        ]}
        value={String(radius)}
        onChange={(e) => setRadius(parseInt(e.target.value, 10))}
      />

      {jobs.length === 0 ? (
        <div className="rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">
              {workerLocation
                ? `No jobs available within ${radius}km of your location`
                : "No jobs available"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="flex flex-col">
              <JobCard
                id={job.id}
                title={job.title}
                description={cleanDescription(job.description)}
                location={extractLocation(job.description)}
                category={job.category}
                wage={job.wage}
                jobDate={job.jobDate}
                requiredWorkers={job.requiredWorkers}
                status={job.status}
                employerName={
                  job.employerName || job.employer?.name || "Employer"
                }
                onViewDetails={(jobId) => navigate(`/jobs/open/${jobId}`)}
                onApply={(jobId) => navigate(`/jobs/open/${jobId}`)}
              />
              {job.distance !== null && (
                <div className="px-4 pb-2 text-xs text-slate-500">
                  📍 {job.distance.toFixed(1)}km away
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
