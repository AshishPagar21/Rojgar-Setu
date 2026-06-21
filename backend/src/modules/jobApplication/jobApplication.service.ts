import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";
import { emitToUser, SOCKET_EVENTS } from "../../socket/socket.server";
import { notificationService } from "../notification/notification.service";


export const jobApplicationService = {
  /**
   * Worker applies to a job
   */
  async applyToJob(jobId: number, workerId: number) {
    // Check if job exists and is OPEN
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
    }

    if (job.status !== "OPEN") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Job is not open for applications",
      );
    }

    // Check if worker is already selected for any job on the same day
    const selectedApplicationsOnSameDay = await prisma.jobApplication.findFirst({
      where: {
        workerId,
        status: "SELECTED",
        job: {
          jobDate: job.jobDate,
        },
      },
      include: {
        job: true,
      },
    });

    if (selectedApplicationsOnSameDay) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `You cannot apply to this job because you are already selected for another job ("${selectedApplicationsOnSameDay.job.title}") on this day.`,
      );
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        workerId,
        status: "APPLIED",
      },
      include: {
        job: true,
        worker: true,
      },
    });

    // Real-time: Send notification and emit job:applied to employer
    const employerUser = await prisma.employer.findUnique({
      where: { id: job.employerId },
      select: { userId: true },
    });

    if (employerUser) {
      void notificationService.createNotification({
        userId: employerUser.userId,
        title: "New Job Applicant",
        message: `${application.worker.name} has applied for your job: "${job.title}".`,
        type: "WORKER_APPLIED",
      });

      emitToUser(employerUser.userId, SOCKET_EVENTS.jobApplied, application);
    }

    return application;
  },

  /**
   * Get worker's applications
   */
  async getWorkerApplications(workerId: number) {
    return prisma.jobApplication.findMany({
      where: { workerId },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                rating: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });
  },

  /**
   * Get worker's assigned jobs
   */
  async getWorkerAssignedJobs(workerId: number) {
    return prisma.jobApplication.findMany({
      where: { workerId, status: { in: ["SELECTED", "COMPLETED"] } },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                rating: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  /**
   * Get all applicants for a job
   */
  async getJobApplicants(jobId: number, employerId: number) {
    // Verify job belongs to employer
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
    }

    if (job.employerId !== employerId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only view applicants for your own jobs",
      );
    }

    return prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        worker: {
          select: {
            id: true,
            userId: true,
            name: true,
            age: true,
            gender: true,
            rating: true,
            totalRatings: true,
            totalJobsCompleted: true,
            reliabilityScore: true,
          },
        },
      },
      orderBy: [
        { worker: { reliabilityScore: "desc" } },
        { worker: { rating: "desc" } },
        { appliedAt: "desc" },
      ],
    });
  },

  /**
   * Employer selects workers for a job
   */
  async selectWorkersForJob(
    jobId: number,
    employerId: number,
    workerIds: number[],
  ) {
    const result = await prisma.$transaction(async (tx) => {
      // Verify job exists and belongs to employer
      const job = await tx.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
      }

      if (job.employerId !== employerId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "You can only select workers for your own jobs",
        );
      }

      if (job.status !== "OPEN") {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Job must be in OPEN status to select workers",
        );
      }

      // Verify worker IDs count doesn't exceed required workers
      if (workerIds.length > job.requiredWorkers) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Cannot select more than ${job.requiredWorkers} workers`,
        );
      }

      // Get current APPLIED applications
      const currentApplications = await tx.jobApplication.findMany({
        where: { jobId },
        include: {
          worker: {
            select: {
              userId: true,
            },
          },
        },
      });

      const selectedCount = currentApplications.filter(
        (application) => application.status === "SELECTED",
      ).length;

      // Verify all worker IDs are in APPLIED status
      for (const workerId of workerIds) {
        const app = currentApplications.find(
          (a) => a.workerId === workerId && a.status === "APPLIED",
        );
        if (!app) {
          throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `Worker ${workerId} has not applied or is not in APPLIED status`,
          );
        }
      }

      if (selectedCount + workerIds.length > job.requiredWorkers) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Cannot select more than ${job.requiredWorkers} workers`,
        );
      }

      // Update selected workers to SELECTED
      await tx.jobApplication.updateMany({
        where: { jobId, workerId: { in: workerIds } },
        data: { status: "SELECTED", selectedAt: new Date() },
      });

      const autoWithdrawNotifications = [];
      const otherEmployerEmits: { userId: number; jobId: number; status: string }[] = [];

      // Auto-withdraw other APPLIED applications on the same day for selected workers
      for (const workerId of workerIds) {
        const otherApps = await tx.jobApplication.findMany({
          where: {
            workerId,
            status: "APPLIED",
            jobId: { not: jobId },
            job: {
              jobDate: job.jobDate,
            },
          },
          include: {
            job: true,
            worker: { select: { userId: true } },
          },
        });

        if (otherApps.length > 0) {
          const otherAppIds = otherApps.map((a) => a.id);
          await tx.jobApplication.updateMany({
            where: { id: { in: otherAppIds } },
            data: { status: "REJECTED" },
          });

          for (const app of otherApps) {
            // Notify worker that their application was automatically withdrawn
            const notif1 = await tx.notification.create({
              data: {
                userId: app.worker.userId,
                title: "Application Withdrawn",
                message: `Your application for "${app.job.title}" was automatically withdrawn because you were selected for "${job.title}" on this day.`,
                type: "APPLICATION_WITHDRAWN",
              },
            });
            autoWithdrawNotifications.push(notif1);

            // Notify the employer of the other job that the worker withdrew
            const otherEmployer = await tx.employer.findUnique({
              where: { id: app.job.employerId },
              select: { userId: true },
            });

            if (otherEmployer) {
              const notif2 = await tx.notification.create({
                data: {
                  userId: otherEmployer.userId,
                  title: "Applicant Withdrew",
                  message: `An applicant for your job "${app.job.title}" has been selected for another job today and was withdrawn.`,
                  type: "APPLICANT_WITHDRAWN",
                },
              });
              autoWithdrawNotifications.push(notif2);

              otherEmployerEmits.push({
                userId: otherEmployer.userId,
                jobId: app.jobId,
                status: app.job.status,
              });
            }
          }
        }
      }

      const notifications = [];
      const selectedApps = currentApplications.filter((application) =>
        workerIds.includes(application.workerId),
      );

      for (const app of selectedApps) {
        const notif = await tx.notification.create({
          data: {
            userId: app.worker.userId,
            title: "Job Selection",
            message: `You have been selected for the job: ${job.title}.`,
            type: "WORKER_SELECTED",
          },
        });
        notifications.push(notif);
      }

      await tx.job.update({
        where: { id: jobId },
        data: { status: "ASSIGNED" },
      });

      // Fetch updated applications
      const updatedApplications = await tx.jobApplication.findMany({
        where: { jobId },
        include: {
          worker: {
            select: {
              id: true,
              userId: true,
              name: true,
              rating: true,
              reliabilityScore: true,
            },
          },
        },
      });

      return { updatedApplications, selectedApps, notifications, autoWithdrawNotifications, otherEmployerEmits };
    });

    // Real-time: Emit notification:new and job:updated for selected workers
    result.notifications.forEach((notif) => {
      emitToUser(notif.userId, SOCKET_EVENTS.notificationNew, {
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        createdAt: notif.createdAt.toISOString(),
      });
    });

    result.selectedApps.forEach((app) => {
      emitToUser(app.worker.userId, SOCKET_EVENTS.jobUpdated, {
        jobId,
        status: "ASSIGNED",
      });
    });

    // Real-time: Emit auto-withdraw notifications to workers and other employers
    result.autoWithdrawNotifications.forEach((notif) => {
      emitToUser(notif.userId, SOCKET_EVENTS.notificationNew, {
        id: notif.id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        createdAt: notif.createdAt.toISOString(),
      });
    });

    // Emit job updates to other employers who lost an applicant, and workers who were withdrawn
    result.otherEmployerEmits.forEach((item) => {
      emitToUser(item.userId, SOCKET_EVENTS.jobUpdated, {
        jobId: item.jobId,
        status: item.status,
      });
    });

    result.selectedApps.forEach((app) => {
      emitToUser(app.worker.userId, SOCKET_EVENTS.jobUpdated, {
        jobId,
        status: "ASSIGNED",
      });
    });

    return result.updatedApplications;
  },

  /**
   * Worker withdraws their application or selection
   */
  async withdrawApplication(jobId: number, workerId: number) {
    const application = await prisma.jobApplication.findUnique({
      where: { jobId_workerId: { jobId, workerId } },
      include: {
        job: true,
        worker: { select: { userId: true, name: true } },
      },
    });

    if (!application) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Application not found");
    }

    if (application.status !== "APPLIED" && application.status !== "SELECTED") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "You can only withdraw applied or selected applications",
      );
    }

    // Helper to construct starting date time
    const getJobStartDateTime = (jobDate: Date, expectedStartTime: string): Date => {
      const start = new Date(jobDate);
      const [hours, minutes] = expectedStartTime.split(":").map(Number);
      start.setHours(hours || 0, minutes || 0, 0, 0);
      return start;
    };

    const jobStart = getJobStartDateTime(application.job.jobDate, application.job.expectedStartTime);
    const now = new Date();
    const hoursRemaining = (jobStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 10) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "You can only withdraw your application at least 10 hours before the job starts",
      );
    }

    const wasSelected = application.status === "SELECTED";

    await prisma.$transaction(async (tx) => {
      // Delete the application
      await tx.jobApplication.delete({
        where: { id: application.id },
      });

      if (wasSelected) {
        // Check if there are other SELECTED/COMPLETED applications left for this job
        const remainingSelected = await tx.jobApplication.findMany({
          where: {
            jobId,
            status: { in: ["SELECTED", "COMPLETED"] },
          },
        });

        if (remainingSelected.length === 0) {
          await tx.job.update({
            where: { id: jobId },
            data: { status: "OPEN" },
          });
        }
      }
    });

    // Notify the employer
    const employerUser = await prisma.employer.findUnique({
      where: { id: application.job.employerId },
      select: { userId: true },
    });

    if (employerUser) {
      const title = wasSelected ? "Selected Worker Withdrew" : "Applicant Withdrew";
      const message = `${application.worker.name} has withdrawn their ${wasSelected ? "selection" : "application"} for your job: "${application.job.title}".`;
      
      await notificationService.createNotification({
        userId: employerUser.userId,
        title,
        message,
        type: "WORKER_WITHDREW",
      });

      emitToUser(employerUser.userId, SOCKET_EVENTS.jobUpdated, {
        jobId,
        status: wasSelected ? "OPEN" : application.job.status,
      });
    }

    return { success: true };
  },
};
