import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";

const getDayKey = (date: Date) => date.toISOString().slice(0, 10);

export const adminService = {
  async getDashboard() {
    const [jobs, users, disputes, payments] = await Promise.all([
      prisma.job.findMany({ select: { createdAt: true, status: true } }),
      prisma.user.findMany({
        select: { role: true, status: true, createdAt: true },
      }),
      prisma.dispute.findMany({ select: { status: true, createdAt: true } }),
      prisma.payment.findMany({ select: { status: true, createdAt: true } }),
    ]);

    const totalJobs = jobs.length;
    const activeWorkers = users.filter(
      (user) => user.role === "WORKER" && user.status === "ACTIVE",
    ).length;
    const activeEmployers = users.filter(
      (user) => user.role === "EMPLOYER" && user.status === "ACTIVE",
    ).length;
    const completedJobs = jobs.filter(
      (job) => job.status === "COMPLETED",
    ).length;
    const pendingDisputes = disputes.filter(
      (dispute) => dispute.status === "OPEN",
    ).length;
    const paymentsPending = payments.filter(
      (payment) => payment.status === "PENDING",
    ).length;

    const jobsPerDay = Object.entries(
      jobs.reduce<Record<string, number>>((accumulator, job) => {
        const key = getDayKey(job.createdAt);
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      }, {}),
    ).map(([date, count]) => ({ date, count }));

    const registrations = Object.entries(
      users.reduce<Record<string, number>>((accumulator, user) => {
        const key = getDayKey(user.createdAt);
        accumulator[key] = (accumulator[key] || 0) + 1;
        return accumulator;
      }, {}),
    ).map(([date, count]) => ({ date, count }));

    return {
      totalJobs,
      activeWorkers,
      activeEmployers,
      completedJobs,
      pendingDisputes,
      paymentsPending,
      charts: {
        jobsPerDay,
        registrations,
        completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
      },
    };
  },

  async listUsers() {
    return prisma.user.findMany({
      include: {
        employer: true,
        worker: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async listJobs() {
    return prisma.job.findMany({
      include: {
        employer: true,
        jobApplications: true,
        payments: true,
        attendance: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async listDisputes() {
    return prisma.dispute.findMany({
      include: {
        job: true,
        raisedBy: true,
        attendance: {
          include: {
            worker: {
              include: {
                user: true,
              },
            },
            job: {
              include: {
                employer: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        worker: {
          include: {
            user: true,
          },
        },
        employer: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async suspendUser(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: "SUSPENDED", isActive: false },
    });
  },

  async reactivateUser(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE", isActive: true },
    });
  },

  async resolveDispute(disputeId: number, status: "RESOLVED" | "REJECTED") {
    return prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.findUnique({
        where: { id: disputeId },
        include: {
          attendance: true,
        },
      });

      if (!dispute) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Dispute not found");
      }

      const updatedDispute = await tx.dispute.update({
        where: { id: disputeId },
        data: { status },
      });

      const workerId = dispute.workerId || dispute.attendance?.workerId;
      const jobId = dispute.jobId || dispute.attendance?.jobId;

      if (workerId && jobId) {
        if (status === "RESOLVED") {
          await tx.payment.updateMany({
            where: { jobId, workerId },
            data: { status: "COMPLETED", paidAt: new Date() },
          });
        } else if (status === "REJECTED") {
          await tx.payment.updateMany({
            where: { jobId, workerId },
            data: { status: "DISPUTED" },
          });
        }
      }

      return updatedDispute;
    });
  },
};
