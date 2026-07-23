import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import config from "../../config";
import { orderServices } from "./order.services";

const checkoutOrder = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { shippingAddress, couponCode } = req.body;
    const userContext = {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
    };

    const result = await orderServices.checkoutOrder(userId, shippingAddress, userContext, couponCode);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Order placed. Redirecting to payment gateway.",
        data: result,
    });
});

const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
    const { tranId } = req.params;
    const { val_id } = req.body; // val_id is sent in SSLCommerz redirect POST body

    await orderServices.handlePaymentSuccess(tranId as string, val_id as string);

    // Redirect user browser back to frontend client success page
    res.redirect(`${config.client_url}/payment/success?txnId=${tranId}`);
});

const paymentFail = catchAsync(async (req: Request, res: Response) => {
    const { tranId } = req.params;

    await orderServices.handlePaymentFail(tranId as string);

    // Redirect user browser back to frontend client fail page
    res.redirect(`${config.client_url}/payment/fail?txnId=${tranId}`);
});

const paymentCancel = catchAsync(async (req: Request, res: Response) => {
    const { tranId } = req.params;

    await orderServices.handlePaymentCancel(tranId as string);

    // Redirect user browser back to frontend client cancel page
    res.redirect(`${config.client_url}/payment/cancel?txnId=${tranId}`);
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const result = await orderServices.getMyOrders(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My orders retrieved successfully",
        data: result,
    });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const result = await orderServices.getOrderById(id as string, userId, userRole);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Order details retrieved successfully",
        data: result,
    });
});

export const orderControllers = {
    checkoutOrder,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    getMyOrders,
    getOrderById,
};
