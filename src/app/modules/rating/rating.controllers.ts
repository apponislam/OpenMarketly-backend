import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ratingServices } from "./rating.services";

const createOrUpdateRating = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await ratingServices.createOrUpdateRating(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Rating submitted successfully",
        data: result,
    });
});

const getProductRatings = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await ratingServices.getProductRatings(productId as string, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product ratings retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getRatingSummary = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const result = await ratingServices.getRatingSummary(productId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Rating summary retrieved successfully",
        data: result,
    });
});

const deleteRating = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const result = await ratingServices.deleteRating(id as string, userId, userRole);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Rating deleted successfully",
        data: result,
    });
});

export const ratingControllers = {
    createOrUpdateRating,
    getProductRatings,
    getRatingSummary,
    deleteRating,
};
