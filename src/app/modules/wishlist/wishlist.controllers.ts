import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { wishlistServices } from "./wishlist.services";

const toggleWishlist = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { productId } = req.body;

    const result = await wishlistServices.toggleWishlist(userId as string, productId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.isWishlisted
            ? "Product added to wishlist successfully"
            : "Product removed from wishlist successfully",
        data: result,
    });
});

const getMyWishlist = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await wishlistServices.getMyWishlist(userId as string, page, limit);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Wishlist retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const checkIsWishlisted = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const productId = req.params.productId as string;

    const result = await wishlistServices.checkIsWishlisted(userId as string, productId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Wishlist status checked successfully",
        data: result,
    });
});

export const wishlistControllers = {
    toggleWishlist,
    getMyWishlist,
    checkIsWishlisted,
};
