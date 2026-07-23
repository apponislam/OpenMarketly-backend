import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { recentlyViewedServices } from "./recentlyViewed.services";

const addProductToRecentlyViewed = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { productId } = req.body;

    await recentlyViewedServices.addProductToRecentlyViewed(userId as string, productId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product added to recently viewed",
        data: null,
    });
});

const getRecentlyViewedProducts = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await recentlyViewedServices.getRecentlyViewedProducts(userId as string, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Recently viewed products retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const clearRecentlyViewed = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    await recentlyViewedServices.clearRecentlyViewed(userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Recently viewed list cleared successfully",
        data: null,
    });
});

export const recentlyViewedControllers = {
    addProductToRecentlyViewed,
    getRecentlyViewedProducts,
    clearRecentlyViewed,
};
