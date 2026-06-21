import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { JobCard } from "../../components/common/JobCard";
import { PageHeader } from "../../components/common/PageHeader";
import { Select } from "../../components/common/Select";
import { jobService } from "../../modules/job/job.service";
import { getCurrentLocation } from "../../utils/geolocation";

const extractLocation = (description?: string | null) => {
  if (!description) {
    return undefined;
  }

  const match = description.match(/Location:\s*([^\n]+)/i);
  return match?.[1]?.trim();
};

const cleanDescription = (description?: string | null) =>
  (description ?? "").replace(/\n*\n*Location:\s*[^\n]+/i, "").trim();

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
  const { t } = useTranslation();
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
          err instanceof Error ? err.message : t("jobs.locationErrorMsg");
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

       
          data = await jobService.getOpenJobs({
            category: category || undefined,
            latitude: workerLocation?.latitude,
            longitude: workerLocation?.longitude,
            radius,
          });
        

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
        setError(t("jobs.failedToLoad"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [category, workerLocation, radius, t]);

  const categories = [
    { label: t("jobs.categories.All"), value: "" },
    { label: t("jobs.categories.Construction"), value: "Construction" },
    { label: t("jobs.categories.Repairs"), value: "Repairs" },
    { label: t("jobs.categories.Cleaning"), value: "Cleaning" },
    { label: t("jobs.categories.Plumbing"), value: "Plumbing" },
    { label: t("jobs.categories.Electrical"), value: "Electrical" },
    { label: t("jobs.categories.Carpentry"), value: "Carpentry" },
    { label: t("jobs.categories.Painting"), value: "Painting" },
    { label: t("jobs.categories.Masonry"), value: "Masonry" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("jobs.findWorkTitle")} subtitle={t("jobs.findWorkSubtitle")} />

      {workerLocation && (
        <div className="rounded bg-blue-50 p-3 text-sm text-blue-700">
          📍 {t("jobs.showingJobsWithin", { radius })}
        </div>
      )}

      {locationError && (
        <div className="rounded bg-yellow-50 p-3 text-sm text-yellow-700">
          ⚠️ {locationError} - {t("jobs.showingAllJobs")}
        </div>
      )}

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Select
        label={t("jobs.filterByCategory")}
        options={categories}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <Select
        label={t("jobs.radiusKm")}
        options={[
          { label: `10 ${t("jobs.radiusUnit", "km")}`, value: "10" },
          { label: `20 ${t("jobs.radiusUnit", "km")}`, value: "20" },
          { label: `30 ${t("jobs.radiusUnit", "km")}`, value: "30" },
          { label: `50 ${t("jobs.radiusUnit", "km")}`, value: "50" },
        ]}
        value={String(radius)}
        onChange={(e) => setRadius(parseInt(e.target.value, 10))}
      />

      {jobs.length === 0 ? (
        <div className="rounded-panel bg-white p-8 text-center shadow-panel">
          <p className="text-slate-600">
            {workerLocation
              ? t("jobs.noJobsWithin", { radius })
              : t("jobs.noJobsAvailable")}
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
                  📍 {t("jobs.away", { distance: job.distance.toFixed(1) })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
