import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { notificationServices } from "./notification.services";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await notificationServices.getMyNotifications(userId as string, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notifications retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { id } = req.params;
    const result = await notificationServices.markAsRead(id as string, userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notification marked as read successfully",
        data: result,
    });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await notificationServices.markAllAsRead(userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All notifications marked as read successfully",
        data: result,
    });
});

const getNotificationCount = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await notificationServices.getNotificationCount(userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Notification count retrieved successfully",
        data: result,
    });
});

export const notificationControllers = {
    getMyNotifications,
    getNotificationCount,
    markAsRead,
    markAllAsRead,
};
