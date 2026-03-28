import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";
import type { CreateRatingPayload } from "./rating.types";

export const ratingService = {
  /**
   * Create a rating
   */
  async createRating(fromUserId: number, payload: CreateRatingPayload) {
    const { jobId, toUserId, ratingValue, reviewText } = payload;

    // Validate rating value
    if (ratingValue < 1 || ratingValue > 5) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Rating value must be between 1 and 5",
      );
    }

    // Verify job exists and is completed
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        jobApplications: true,
      },
    });

    if (!job) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Job not found");
    }

    if (job.status !== "COMPLETED") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Job must be COMPLETED to add rating",
      );
    }

    // Verify rater and ratee have relationship in the job
    const fromUserRecord = await prisma.user.findUnique({
      where: { id: fromUserId },
    });
    const toUserRecord = await prisma.user.findUnique({
      where: { id: toUserId },
    });

    if (!fromUserRecord || !toUserRecord) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    // Employer rating worker: check if worker is selected for job
    // Worker rating employer: check if worker is selected for job
    if (fromUserRecord.role === "EMPLOYER" && toUserRecord.role === "WORKER") {
      const workerApplication = job.jobApplications.find(
        (app) => app.status === "SELECTED",
      );
      if (!workerApplication) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "Worker was not selected for this job",
        );
      }
    } else if (
      fromUserRecord.role === "WORKER" &&
      toUserRecord.role === "EMPLOYER"
    ) {
      if (job.employerId !== toUserId) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "Invalid rating relationship",
        );
      }
    } else {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Invalid rating relationship");
    }

    // Check for duplicate rating
    const existingRating = await prisma.rating.findFirst({
      where: {
        jobId,
        fromUserId,
        toUserId,
      },
    });

    if (existingRating) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "You have already rated this user for this job",
      );
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        jobId,
        fromUserId,
        toUserId,
        ratingValue,
        reviewText,
      },
    });

    // Update average rating and totalRatings for the rated user
    const targetUser = await prisma.user.findUnique({
      where: { id: toUserId },
    });

    if (targetUser?.role === "EMPLOYER") {
      const employer = await prisma.employer.findUnique({
        where: { userId: toUserId },
      });

      if (employer) {
        const allRatings = await prisma.rating.findMany({
          where: { toUserId },
          select: { ratingValue: true },
        });

        const newCount = allRatings.length;
        const sum = allRatings.reduce((acc, r) => acc + r.ratingValue, 0);
        const newAverage = newCount > 0 ? sum / newCount : 0;

        await prisma.employer.update({
          where: { id: employer.id },
          data: {
            rating: newAverage,
            totalRatings: newCount,
          },
        });
      }
    } else if (targetUser?.role === "WORKER") {
      const worker = await prisma.worker.findUnique({
        where: { userId: toUserId },
      });

      if (worker) {
        const allRatings = await prisma.rating.findMany({
          where: { toUserId },
          select: { ratingValue: true },
        });

        const newCount = allRatings.length;
        const sum = allRatings.reduce((acc, r) => acc + r.ratingValue, 0);
        const newAverage = newCount > 0 ? sum / newCount : 0;

        await prisma.worker.update({
          where: { id: worker.id },
          data: {
            rating: newAverage,
            totalRatings: newCount,
          },
        });
      }
    }

    return rating;
  },

  /**
   * Get ratings received by a user
   */
  async getReceivedRatings(userId: number) {
    return prisma.rating.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: {
          select: {
            id: true,
            role: true,
            employer: {
              select: {
                id: true,
                name: true,
              },
            },
            worker: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            jobDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get all ratings for a job
   */
  async getJobRatings(jobId: number) {
    return prisma.rating.findMany({
      where: { jobId },
      include: {
        fromUser: {
          select: {
            id: true,
            role: true,
            employer: {
              select: {
                name: true,
              },
            },
            worker: {
              select: {
                name: true,
              },
            },
          },
        },
        toUser: {
          select: {
            id: true,
            role: true,
            employer: {
              select: {
                name: true,
              },
            },
            worker: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
