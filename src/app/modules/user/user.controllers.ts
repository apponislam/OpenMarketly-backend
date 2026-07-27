import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { userServices } from "./user.services";
import ApiError from "../../../errors/ApiError";

const getUserStats = catchAsync(async (req: Request, res: Response) => {
    const result = await userServices.getUserStats();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User statistics fetched successfully",
        data: result,
    });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Name, email, and password are required");
    }

    const result = await userServices.createAdmin(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Admin created successfully",
        data: result,
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    await userServices.changePassword(userId, currentPassword, newPassword);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password changed successfully",
        data: null,
    });
});

const changeUserRole = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Role is required");
    }

    const result = await userServices.changeUserRole(userId as string, role);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User role updated successfully",
        data: result,
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await userServices.getAllUsers(req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await userServices.getSingleUser(userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
});

const getUserProducts = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await userServices.getUserProducts(userId as string, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User products retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getUserOrders = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await userServices.getUserOrders(userId as string, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User orders retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getUserActivities = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await userServices.getUserActivities(userId as string, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User activity logs retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await userServices.getUserNotifications(userId as string, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User notifications retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getUserRatings = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const result = await userServices.getUserRatings(userId as string, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User ratings retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

export const userControllers = {
    getUserStats,
    createAdmin,
    changePassword,
    changeUserRole,
    getAllUsers,
    getSingleUser,
    getUserProducts,
    getUserOrders,
    getUserActivities,
    getUserNotifications,
    getUserRatings,
};
