import { Router } from "express";

import { adminRoutes } from "../modules/admin/admin.routes";
import { attendanceRoutes } from "../modules/attendance/attendance.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { disputeRoutes } from "../modules/dispute/dispute.routes";
import { employerRoutes } from "../modules/employer/employer.routes";
import { jobApplicationRoutes } from "../modules/jobApplication/jobApplication.routes";
import { jobRoutes } from "../modules/job/job.routes";
import { notificationRoutes } from "../modules/notification/notification.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { ratingRoutes } from "../modules/rating/rating.routes";
import { userRoutes } from "../modules/user/user.routes";
import { workerRoutes } from "../modules/worker/worker.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/employers", employerRoutes);
router.use("/workers", workerRoutes);
router.use("/jobs", jobRoutes);
router.use("/job-applications", jobApplicationRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/payments", paymentRoutes);
router.use("/ratings", ratingRoutes);
router.use("/notifications", notificationRoutes);
router.use("/disputes", disputeRoutes);
router.use("/admin", adminRoutes);

export const apiRoutes = router;
