import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";

export const disputeService = {
  async createDispute(
    userId: number,
    payload: { jobId: number; reason: string; description: string },
  ) {
    const [job, user, employerProfile, workerProfile] = await Promise.all([
      prisma.job.findUnique({
        where: { id: payload.jobId },
        include: { jobApplications: true },
      }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.employer.findUnique({ where: { userId } }),
      prisma.worker.findUnique({ where: { userId } }),
    ]);

    if (!job || !user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
    }

    const isEmployer =
      user.role === "EMPLOYER" && job.employerId === employerProfile?.id;
    const isWorker =
      user.role === "WORKER" &&
      !!workerProfile &&
      job.jobApplications.some(
        (application) => application.workerId === workerProfile.id,
      );

    if (!isEmployer && !isWorker) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You can only raise disputes for your own jobs",
      );
    }

    return prisma.dispute.create({
      data: {
        jobId: payload.jobId,
        raisedById: userId,
        reason: payload.reason,
        description: payload.description,
      },
    });
  },

  async getMyDisputes(userId: number) {
    return prisma.dispute.findMany({
      where: { raisedById: userId },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getAllDisputes() {
    return prisma.dispute.findMany({
      include: {
        job: true,
        raisedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async resolveDispute(disputeId: number, status: "RESOLVED" | "REJECTED") {
    return prisma.dispute.update({
      where: { id: disputeId },
      data: { status },
    });
  },
};
