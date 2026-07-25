import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { dashboardServices } from "./dashboard.services";

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
    const data = await dashboardServices.getAdminStats();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin dashboard statistics retrieved successfully",
        data,
    });
});

const getSellerStats = catchAsync(async (req: Request, res: Response) => {
    const sellerId = req.user._id;
    const data = await dashboardServices.getSellerStats(sellerId as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Seller dashboard statistics retrieved successfully",
        data,
    });
});

const getCustomerStats = catchAsync(async (req: Request, res: Response) => {
    const customerId = req.user._id;
    const data = await dashboardServices.getCustomerStats(customerId as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Customer dashboard statistics retrieved successfully",
        data,
    });
});

export const dashboardControllers = {
    getAdminStats,
    getSellerStats,
    getCustomerStats,
};
