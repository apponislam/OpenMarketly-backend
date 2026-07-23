import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { reportServices } from "./report.services";

const createReport = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await reportServices.createReport(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Report ticket submitted successfully",
        data: result,
    });
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
    const { type, status } = req.query;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await reportServices.getAllReports(type as string, status as string, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Report tickets retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getReportById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const result = await reportServices.getReportById(id as string, userId, userRole);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Report ticket details retrieved successfully",
        data: result,
    });
});

const resolveReport = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminUserId = req.user._id;
    const result = await reportServices.resolveReport(id as string, req.body, adminUserId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Report ticket resolved successfully",
        data: result,
    });
});

export const reportControllers = {
    createReport,
    getAllReports,
    getReportById,
    resolveReport,
};
