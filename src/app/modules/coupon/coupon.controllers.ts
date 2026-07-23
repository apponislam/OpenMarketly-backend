import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { couponServices } from "./coupon.services";

const createCoupon = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const result = await couponServices.createCoupon(req.body, userId as string);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Coupon created successfully",
        data: result,
    });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user?.role && ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await couponServices.getAllCoupons(isAdmin, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Coupons retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const validateCoupon = catchAsync(async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const amount = Number(req.query.amount);

    const result = await couponServices.validateCoupon(code, amount);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Coupon is valid",
        data: result,
    });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;
    const result = await couponServices.updateCoupon(id as string, req.body, userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Coupon updated successfully",
        data: result,
    });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id;
    const result = await couponServices.deleteCoupon(id as string, userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Coupon deleted successfully",
        data: result,
    });
});

export const couponControllers = {
    createCoupon,
    getAllCoupons,
    validateCoupon,
    updateCoupon,
    deleteCoupon,
};
