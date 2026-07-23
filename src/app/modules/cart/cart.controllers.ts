import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { cartServices } from "./cart.services";

const addToCart = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await cartServices.addToCart(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Item added to cart successfully",
        data: result,
    });
});

const updateCartItemQuantity = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await cartServices.updateCartItemQuantity(userId, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Cart item updated successfully",
        data: result,
    });
});

const removeFromCart = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { productId } = req.params;
    const color = req.query.color as string | undefined;
    const size = req.query.size as string | undefined;

    const result = await cartServices.removeFromCart(userId, productId as string, color, size);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Item removed from cart successfully",
        data: result,
    });
});

const getMyCart = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await cartServices.getMyCart(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Cart retrieved successfully",
        data: result,
    });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await cartServices.clearCart(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Cart cleared successfully",
        data: result,
    });
});

export const cartControllers = {
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    getMyCart,
    clearCart,
};
