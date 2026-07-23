import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { bannerServices } from "./banner.services";

const createBanner = catchAsync(async (req: Request, res: Response) => {
    const result = await bannerServices.createBanner(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Banner created successfully",
        data: result,
    });
});

const getAllBanners = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user?.role && ["SUPER_ADMIN", "ADMIN"].includes(req.user.role);
    const result = await bannerServices.getAllBanners(!!isAdmin, req.query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Banners retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getBannerById = catchAsync(async (req: Request, res: Response) => {
    const result = await bannerServices.getBannerById(req.params.id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Banner retrieved successfully",
        data: result,
    });
});

const updateBanner = catchAsync(async (req: Request, res: Response) => {
    const result = await bannerServices.updateBanner(req.params.id as string, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Banner updated successfully",
        data: result,
    });
});

const deleteBanner = catchAsync(async (req: Request, res: Response) => {
    const result = await bannerServices.deleteBanner(req.params.id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Banner deleted successfully",
        data: result,
    });
});

export const bannerControllers = {
    createBanner,
    getAllBanners,
    getBannerById,
    updateBanner,
    deleteBanner,
};
