import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { activityServices } from "./activity.services";

const getMyActivityLogs = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await activityServices.getMyActivityLogs(userId as string, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Activity logs retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getAllActivityLogs = catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;

    const result = await activityServices.getAllActivityLogs(page, limit, search);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All activity logs retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

export const activityControllers = {
    getMyActivityLogs,
    getAllActivityLogs,
};
