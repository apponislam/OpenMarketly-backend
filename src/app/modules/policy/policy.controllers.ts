import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { policyServices } from "./policy.services";

const createOrUpdatePolicy = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const result = await policyServices.createOrUpdatePolicy(req.body, userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Policy updated successfully",
        data: result,
    });
});

const getPolicyByType = catchAsync(async (req: Request, res: Response) => {
    const { type } = req.params;
    const result = await policyServices.getPolicyByType(type as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Policy retrieved successfully",
        data: result,
    });
});

const getAllPolicies = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user?.role && ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
    const result = await policyServices.getAllPolicies(isAdmin);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Policies retrieved successfully",
        data: result,
    });
});

const deletePolicy = catchAsync(async (req: Request, res: Response) => {
    const { type } = req.params;
    const userId = req.user?._id;
    const result = await policyServices.deletePolicy(type as string, userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Policy deleted successfully",
        data: result,
    });
});

export const policyControllers = {
    createOrUpdatePolicy,
    getPolicyByType,
    getAllPolicies,
    deletePolicy,
};
