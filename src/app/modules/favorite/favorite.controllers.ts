import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { favoriteServices } from "./favorite.services";

const toggleFavorite = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { productId } = req.body;

    const result = await favoriteServices.toggleFavorite(userId, productId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: { isFavorite: result.isFavorite },
    });
});

const getMyFavorites = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await favoriteServices.getMyFavorites(userId, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Favorites retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const checkIsFavorite = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { productId } = req.params;

    const result = await favoriteServices.checkIsFavorite(userId, productId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Favorite status checked successfully",
        data: result,
    });
});

const removeFavorite = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { productId } = req.params;

    const result = await favoriteServices.removeFavorite(userId, productId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.message,
        data: null,
    });
});

export const favoriteControllers = {
    toggleFavorite,
    getMyFavorites,
    checkIsFavorite,
    removeFavorite,
};
