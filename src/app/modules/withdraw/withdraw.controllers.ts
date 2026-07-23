import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { withdrawServices } from "./withdraw.services";

const createWithdrawRequest = catchAsync(async (req: Request, res: Response) => {
    const sellerId = req.user?._id;
    const result = await withdrawServices.createWithdrawRequest(sellerId as string, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Withdrawal request submitted successfully",
        data: result,
    });
});

const resolveWithdrawRequest = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminUserId = req.user?._id;
    const result = await withdrawServices.resolveWithdrawRequest(id as string, req.body, adminUserId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Withdrawal request ${req.body.status.toLowerCase()} successfully`,
        data: result,
    });
});

const getMyWithdrawRequests = catchAsync(async (req: Request, res: Response) => {
    const sellerId = req.user?._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await withdrawServices.getMyWithdrawRequests(sellerId as string, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your withdrawal requests retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getAllWithdrawRequests = catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string | undefined;
    const result = await withdrawServices.getAllWithdrawRequests(status, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All withdrawal requests retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

export const withdrawControllers = {
    createWithdrawRequest,
    resolveWithdrawRequest,
    getMyWithdrawRequests,
    getAllWithdrawRequests,
};
