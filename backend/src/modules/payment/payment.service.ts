import { prisma } from "../../config/prisma";
import { HTTP_STATUS } from "../../utils/constants";
import { ApiError } from "../../utils/response";
import { PaymentMethod } from "@prisma/client";
import { emitToUsers, SOCKET_EVENTS } from "../../socket/socket.server";
import { notificationService } from "../notification/notification.service";


export const paymentService = {
  // GET /payments/job/:jobId
  async getJobPayments(jobId: number, employerId: number) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== employerId) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Unauthorized access to job details");
    }

    return prisma.payment.findMany({
      where: { jobId },
      include: {
        worker: true,
        job: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // GET /payments/my
  async getWorkerPayments(workerId: number) {
    return prisma.payment.findMany({
      where: { workerId },
      include: {
        job: true,
        employer: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // PATCH /payments/:paymentId/mark-paid
  async markAsPaid(paymentId: number, employerId: number, method: PaymentMethod) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        worker: { select: { userId: true } },
        employer: { select: { userId: true } },
      },
    });

    if (!payment || payment.employerId !== employerId) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Payment record not found");
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentMethod: method,
        markedPaidAt: new Date(),
        employerConfirmed: true,
      },
    });

    await notificationService.createNotification({
      userId: payment.worker.userId,
      title: "Payment Sent",
      message: "Employer marked payment as paid.",
      type: "EMPLOYER_MARKED_PAID",
    });

    emitToUsers(
      [payment.employer.userId, payment.worker.userId],
      SOCKET_EVENTS.paymentPaid,
      updatedPayment,
    );

    return updatedPayment;
  },

  // PATCH /payments/:paymentId/confirm
  async confirmReceived(paymentId: number, workerId: number) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        employer: { select: { userId: true } },
        worker: { select: { userId: true } },
      },
    });

    if (!payment || payment.workerId !== workerId) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Payment transaction missing");
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "COMPLETED",
        confirmedAt: new Date(),
        workerConfirmed: true,
      },
    });

    await notificationService.createNotification({
      userId: payment.employer.userId,
      title: "Payment Completed",
      message: "Worker confirmed payment receipt.",
      type: "WORKER_CONFIRMED_PAID",
    });

    emitToUsers(
      [payment.employer.userId, payment.worker.userId],
      SOCKET_EVENTS.paymentConfirmed,
      updatedPayment,
    );

    return updatedPayment;
  }
};