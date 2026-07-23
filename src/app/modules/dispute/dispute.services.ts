import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { DisputeModel } from "./dispute.model";
import { OrderModel } from "../order/order.model";
import { IDispute, DisputeStatus, DisputeType } from "./dispute.interface";
import { refundSSLCommerzPayment } from "../order/sslcommerz.utils";
import mongoose from "mongoose";

const raiseDispute = async (userId: string, data: Partial<IDispute>) => {
    if (!data.order || !data.type || !data.reason || !data.description) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Order ID, type, reason, and description are required");
    }

    const order = await OrderModel.findOne({ _id: data.order, user: userId });
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Order not found or access denied");
    }

    if (order.paymentStatus !== "PAID") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Disputes can only be raised for paid orders");
    }

    // Check if duplicate dispute for this order exists
    const existing = await DisputeModel.findOne({ order: data.order, user: userId, status: "PENDING" });
    if (existing) {
        throw new ApiError(httpStatus.BAD_REQUEST, "You already have an active dispute pending for this order");
    }

    const disputeData = {
        order: data.order as mongoose.Types.ObjectId,
        user: new mongoose.Types.ObjectId(userId),
        type: data.type as DisputeType,
        reason: data.reason,
        description: data.description,
        images: data.images || [],
        status: "PENDING" as DisputeStatus,
    };

    return await DisputeModel.create(disputeData);
};

const resolveDispute = async (disputeId: string, resolution: { status: "APPROVED" | "REJECTED"; adminNote?: string }) => {
    const { status, adminNote } = resolution;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Resolution status must be APPROVED or REJECTED");
    }

    const dispute = await DisputeModel.findById(disputeId).populate("order");
    if (!dispute) {
        throw new ApiError(httpStatus.NOT_FOUND, "Dispute not found");
    }

    if (dispute.status !== "PENDING") {
        throw new ApiError(httpStatus.BAD_REQUEST, "This dispute has already been resolved");
    }

    const order: any = dispute.order;
    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, "Associated order not found");
    }

    if (status === "REJECTED") {
        dispute.status = "REJECTED";
        dispute.adminNote = adminNote || "Request rejected by admin";
        await dispute.save();
        return dispute;
    }

    // Processing APPROVED status
    dispute.adminNote = adminNote || "Request approved by admin";

    // Handle refund triggers if the dispute type asks for money back
    if (dispute.type === "REFUND" || dispute.type === "RETURN") {
        const bankTranId = order.paymentDetails?.bankTranId;

        if (!bankTranId) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "Cannot issue refund: SSLCommerz bank transaction ID is missing for this order"
            );
        }

        const refundAmount = order.totalPrice;
        const refundRemarks = adminNote || `Dispute ID: ${disputeId} Approved Refund`;

        // Call SSLCommerz refund API helper
        const refundResult = await refundSSLCommerzPayment(bankTranId, refundAmount, refundRemarks);

        if (!refundResult.success) {
            throw new ApiError(
                httpStatus.BAD_GATEWAY,
                `SSLCommerz refund gateway failed: ${refundResult.message || "Unknown gateway error"}`
            );
        }

        // Store refund transaction details
        dispute.status = "REFUNDED";
        dispute.refundDetails = {
            refundAmount,
            refundTxnId: refundResult.refundTxnId || `REF-${Date.now()}`,
            refundedAt: new Date(),
            remarks: refundRemarks,
        };

        // Cancel order statuses
        await OrderModel.findByIdAndUpdate(order._id, {
            $set: {
                paymentStatus: "CANCELLED",
                orderStatus: "CANCELLED",
            },
        });
    } else {
        // Simple COMPLAINT approval
        dispute.status = "APPROVED";
    }

    await dispute.save();
    return dispute;
};

const getAllDisputes = async () => {
    return await DisputeModel.find()
        .populate("user", "name email phone profileImage")
        .populate({
            path: "order",
            populate: { path: "items.product", select: "name price thumbnail" },
        })
        .sort({ createdAt: -1 });
};

const getMyDisputes = async (userId: string) => {
    return await DisputeModel.find({ user: userId })
        .populate({
            path: "order",
            populate: { path: "items.product", select: "name price thumbnail" },
        })
        .sort({ createdAt: -1 });
};

export const disputeServices = {
    raiseDispute,
    resolveDispute,
    getAllDisputes,
    getMyDisputes,
};
