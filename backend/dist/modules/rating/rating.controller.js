"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingController = void 0;
const constants_1 = require("../../utils/constants");
const response_1 = require("../../utils/response");
const rating_service_1 = require("./rating.service");
exports.ratingController = {
    /**
     * POST /api/ratings - Create a rating
     */
    async createRating(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const rating = await rating_service_1.ratingService.createRating(userId, req.body);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.CREATED, "Rating created successfully", rating);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/ratings/my-received - Get ratings received by logged-in user
     */
    async getReceivedRatings(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const ratings = await rating_service_1.ratingService.getReceivedRatings(userId);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Ratings retrieved successfully", ratings);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /api/ratings/job/:jobId - Get all ratings for a job
     */
    async getJobRatings(req, res, next) {
        try {
            const jobId = parseInt(req.params.jobId, 10);
            const ratings = await rating_service_1.ratingService.getJobRatings(jobId);
            (0, response_1.sendSuccess)(res, constants_1.HTTP_STATUS.OK, "Ratings retrieved successfully", ratings);
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=rating.controller.js.map