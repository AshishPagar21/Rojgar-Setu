import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { ApplicantCard } from "../../components/common/ApplicantCard";
import { Button } from "../../components/common/Button";
import { PageHeader } from "../../components/common/PageHeader";
import { jobApplicationService } from "../../modules/jobApplication/jobApplication.service";
import { jobService } from "../../modules/job/job.service";
import { getErrorMessage } from "../../utils/helpers";
import { socketService } from "../../services/socket.service";


export const SelectWorkersPage = () => {
  const { t } = useTranslation();
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) return;
      try {
        setLoading(true);
        const jobData = await jobService.getJobById(Number(jobId));
        setJob(jobData);

        const applicantData = await jobApplicationService.getJobApplicants(
          Number(jobId),
        );
        setApplicants(applicantData);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  useEffect(() => {
    const handleJobApplied = (application: any) => {
      if (application.jobId !== Number(jobId)) return;
      setApplicants((prev) => {
        if (prev.some((a) => a.id === application.id)) return prev;
        return [...prev, application];
      });
    };

    const handleJobUpdated = async (payload: { jobId: number }) => {
      if (payload.jobId !== Number(jobId)) return;
      try {
        const applicantData = await jobApplicationService.getJobApplicants(Number(jobId));
        setApplicants(applicantData);
      } catch {}
    };

    socketService.on("job:applied", handleJobApplied);
    socketService.on("job:updated", handleJobUpdated);
    return () => {
      socketService.off("job:applied", handleJobApplied);
      socketService.off("job:updated", handleJobUpdated);
    };
  }, [jobId]);

  const handleToggleWorker = (workerId: number) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId],
    );
  };

  const handleSubmit = async () => {
    if (!jobId || selectedWorkers.length === 0) return;
    try {
      setSubmitting(true);
      await jobApplicationService.selectWorkers(Number(jobId), selectedWorkers);
      navigate(`/jobs/${jobId}`);
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">{t("common.loading")}</p>
      </div>
    );
  }

  const availableApplicants = applicants.filter((a) => a.status === "APPLIED");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("jobs.selectWorkersTitle")}
        subtitle={t("jobs.selectWorkersSubtitle", { count: job?.requiredWorkers || 0 })}
      />

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Progress */}
      <div className="rounded-panel bg-blue-50 p-4 shadow-panel">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {t("jobs.selectedWorkersProgress")}
          </span>
          <span className="text-sm font-bold text-blue-600">
            {selectedWorkers.length} / {job?.requiredWorkers || 0}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-blue-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{
              width: `${((selectedWorkers.length / (job?.requiredWorkers || 1)) * 100).toFixed(0)}%`,
            }}
          />
        </div>
      </div>

      {/* Applicants List */}
      {availableApplicants.length === 0 ? (
        <div className="text-center text-slate-600">
          <p>{t("jobs.noApplicantsYet")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {availableApplicants.map((applicant) => (
            <ApplicantCard
              key={applicant.id}
              id={applicant.worker.id}
              name={applicant.worker.name}
              age={applicant.worker.age}
              gender={applicant.worker.gender}
              rating={applicant.worker.rating ?? 0}
              totalRatings={applicant.worker.totalRatings ?? 0}
              totalJobsCompleted={applicant.worker.totalJobsCompleted ?? 0}
              isSelected={selectedWorkers.includes(applicant.worker.id)}
              onToggleSelect={handleToggleWorker}
            />
          ))}
        </div>
      )}

      {/* Submit Button */}
      <Button
        fullWidth
        onClick={handleSubmit}
        loading={submitting}
        disabled={selectedWorkers.length === 0}
      >
        {selectedWorkers.length === 1
          ? t("jobs.selectWorkersBtnCount", { count: 1 })
          : t("jobs.selectWorkersBtnCountPlural", { count: selectedWorkers.length })}
      </Button>
    </div>
  );
};
