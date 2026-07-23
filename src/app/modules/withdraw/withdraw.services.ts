import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { UserModel } from "../auth/auth.model";
import { IWithdraw } from "./withdraw.interface";
import { WithdrawModel } from "./withdraw.model";
import { activityServices } from "../activity/activity.services";
import { ActivityType } from "../activity/activity.interface";
import { initiateSSLCommerzPayout } from "../order/sslcommerz.utils";

const createWithdrawRequest = async (sellerId: string, data: Partial<IWithdraw>) => {
    if (!data.amount || !data.paymentMethod || !data.paymentDetails?.accountNumber) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Amount, payment method, and account number are required");
    }

    const seller = await UserModel.findOne({ _id: sellerId, role: "SELLER", isDeleted: false });
    if (!seller) {
        throw new ApiError(httpStatus.NOT_FOUND, "Seller account not found");
    }

    const currentBalance = seller.balance || 0;

    // Check balance availability
    if (currentBalance < data.amount) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance for this withdrawal request");
    }

    // Hold balance from seller's active balance
    seller.balance = currentBalance - data.amount;
    await seller.save();

    // Generate a unique transaction ID for SSLCommerz payout
    const payoutTxnId = `PO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
        const payoutResponse = await initiateSSLCommerzPayout({
            amount: data.amount,
            tran_id: payoutTxnId,
            payment_mode: data.paymentMethod,
            receiver_name: seller.name,
            receiver_account: data.paymentDetails.accountNumber,
            bank_name: data.paymentDetails.bankName,
            branch_name: data.paymentDetails.branchName,
            routing_number: data.paymentDetails.routingNumber,
        });

        if (payoutResponse.success) {
            // Save as APPROVED since the payment was processed successfully
            const withdrawRequest = await WithdrawModel.create({
                seller: sellerId,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                paymentDetails: data.paymentDetails,
                status: "APPROVED",
                transactionId: payoutResponse.payoutRefId || payoutTxnId,
                adminNote: payoutResponse.message || "Auto-disbursed via SSLCommerz",
            });

            // Log activity
            activityServices.logActivity(
                sellerId,
                ActivityType.ORDER_PLACE, // generic billing activity
                `Completed automatic withdrawal of ${data.amount} BDT via ${data.paymentMethod}`
            );

            return withdrawRequest;
        } else {
            // Refund balance immediately if payout failed
            seller.balance = currentBalance;
            await seller.save();

            throw new ApiError(httpStatus.BAD_GATEWAY, `Automatic payout failed: ${payoutResponse.message}`);
        }
    } catch (error: any) {
        // Refund balance immediately if connection or validation error
        seller.balance = currentBalance;
        await seller.save();

        if (error instanceof ApiError) throw error;
        throw new ApiError(httpStatus.BAD_GATEWAY, `Automatic payout failed: ${error.message || "Unknown error"}`);
    }
};

const resolveWithdrawRequest = async (
    withdrawId: string,
    resolution: { status: "APPROVED" | "REJECTED"; adminNote?: string },
    adminUserId: string
) => {
    const { status, adminNote } = resolution;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Status must be APPROVED or REJECTED");
    }

    const request = await WithdrawModel.findById(withdrawId);
    if (!request) {
        throw new ApiError(httpStatus.NOT_FOUND, "Withdrawal request not found");
    }

    if (request.status !== "PENDING") {
        throw new ApiError(httpStatus.BAD_REQUEST, "This withdrawal request has already been processed");
    }

    if (status === "REJECTED") {
        // Return held funds to seller balance
        await UserModel.findByIdAndUpdate(request.seller, {
            $inc: { balance: request.amount },
        });

        request.status = "REJECTED";
        request.adminNote = adminNote || "Rejected by admin";
        await request.save();

        // Log rejection
        activityServices.logActivity(
            adminUserId,
            ActivityType.REPORT_ACTION, // administrative moderation action
            `Rejected withdrawal request ${withdrawId} for seller ${request.seller}`
        );

        return request;
    }

    // APPROVED: Deducted permanently (already deducted during request stage)
    request.status = "APPROVED";
    request.adminNote = adminNote || "Approved and disbursed by admin";
    await request.save();

    // Log approval
    activityServices.logActivity(
        adminUserId,
        ActivityType.REPORT_ACTION,
        `Approved withdrawal request ${withdrawId} for seller ${request.seller}`
    );

    return request;
};

const getMyWithdrawRequests = async (sellerId: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const list = await WithdrawModel.find({ seller: sellerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await WithdrawModel.countDocuments({ seller: sellerId });

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: list,
    };
};

const getAllWithdrawRequests = async (status?: string, page = 1, limit = 10) => {
    const filter: any = {};
    if (status) {
        filter.status = status.toUpperCase();
    }

    const skip = (page - 1) * limit;

    const list = await WithdrawModel.find(filter)
        .populate("seller", "name email balance")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await WithdrawModel.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: list,
    };
};

export const withdrawServices = {
    createWithdrawRequest,
    resolveWithdrawRequest,
    getMyWithdrawRequests,
    getAllWithdrawRequests,
};
