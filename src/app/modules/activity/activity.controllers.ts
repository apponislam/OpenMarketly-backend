import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { activityServices } from "./activity.services";

const getMyActivityLogs = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const query = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        search: req.query.search as string | undefined,
        action: req.query.action as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
    };

    const result = await activityServices.getMyActivityLogs(userId as string, query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Activity logs retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getAllActivityLogs = catchAsync(async (req: Request, res: Response) => {
    const query = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        search: req.query.search as string | undefined,
        action: req.query.action as string | undefined,
        userId: req.query.userId as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
    };

    const result = await activityServices.getAllActivityLogs(query);

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
