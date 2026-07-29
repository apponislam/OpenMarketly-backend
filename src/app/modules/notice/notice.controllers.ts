import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { noticeServices } from "./notice.services";

const createNotice = catchAsync(async (req: Request, res: Response) => {
    const result = await noticeServices.createNotice(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Notice created successfully",
        data: result,
    });
});

const getAllNotices = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user?.role && ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
    const result = await noticeServices.getAllNotices(!!isAdmin, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notices retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getNoticeById = catchAsync(async (req: Request, res: Response) => {
    const result = await noticeServices.getNoticeById(req.params.id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notice retrieved successfully",
        data: result,
    });
});

const getDefaultNotice = catchAsync(async (req: Request, res: Response) => {
    const result = await noticeServices.getDefaultNotice();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Default notice retrieved successfully",
        data: result,
    });
});

const updateNotice = catchAsync(async (req: Request, res: Response) => {
    const result = await noticeServices.updateNotice(req.params.id as string, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notice updated successfully",
        data: result,
    });
});

const deleteNotice = catchAsync(async (req: Request, res: Response) => {
    const result = await noticeServices.deleteNotice(req.params.id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notice deleted successfully",
        data: result,
    });
});

export const noticeControllers = {
    createNotice,
    getAllNotices,
    getNoticeById,
    getDefaultNotice,
    updateNotice,
    deleteNotice,
};
