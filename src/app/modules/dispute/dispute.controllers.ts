import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { disputeServices } from "./dispute.services";

const raiseDispute = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await disputeServices.raiseDispute(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Dispute ticket raised successfully",
        data: result,
    });
});

const resolveDispute = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminUserId = req.user._id;
    const result = await disputeServices.resolveDispute(id as string, req.body, adminUserId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Dispute resolved successfully",
        data: result,
    });
});

const getAllDisputes = catchAsync(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await disputeServices.getAllDisputes(page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All disputes retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getMyDisputes = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await disputeServices.getMyDisputes(userId, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My disputes retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

export const disputeControllers = {
    raiseDispute,
    resolveDispute,
    getAllDisputes,
    getMyDisputes,
};
