import httpStatus from "http-status";
import mongoose from "mongoose";
import ApiError from "../../../errors/ApiError";
import { UserModel } from "../auth/auth.model";
import { IWithdraw } from "./withdraw.interface";
import { WithdrawModel } from "./withdraw.model";
import { activityServices } from "../activity/activity.services";
import { ActivityType } from "../activity/activity.interface";
import { initiateSSLCommerzPayout } from "../order/sslcommerz.utils";
import { notificationServices } from "../notification/notification.services";

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

    // Generate a unique transaction ID for withdrawal request
    const payoutTxnId = `PO-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the withdraw request in PENDING state first
    const withdrawRequest = await WithdrawModel.create({
        seller: sellerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paymentDetails: data.paymentDetails,
        status: "PENDING",
        transactionId: payoutTxnId,
    });

    // Notify seller about request submission
    notificationServices.createNotification(
        sellerId,
        "Withdrawal Requested",
        `Your withdrawal request of ${data.amount} BDT has been submitted and is pending approval.`,
        "WITHDRAW"
    );

    // Log creation activity
    activityServices.logActivity(
        sellerId,
        ActivityType.ORDER_PLACE,
        `Created withdrawal request of ${data.amount} BDT via ${data.paymentMethod}`
    );

    // Attempt automatic SSLCommerz payout if available, but do not fail the request if auto-payout is unsupported/404
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
            withdrawRequest.status = "APPROVED";
            withdrawRequest.adminNote = payoutResponse.message || "Auto-disbursed via SSLCommerz";
            if (payoutResponse.payoutRefId) {
                withdrawRequest.transactionId = payoutResponse.payoutRefId;
            }
            await withdrawRequest.save();

            notificationServices.createNotification(
                sellerId,
                "Withdrawal Approved",
                `Your automatic withdrawal of ${data.amount} BDT was processed successfully.`,
                "WITHDRAW"
            );
        }
    } catch (error) {
        // Auto-payout endpoint unavailable or gateway returned 404 - keep request in PENDING state for admin review
    }

    return withdrawRequest;
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

        // Notify seller
        notificationServices.createNotification(
            request.seller.toString(),
            "Withdrawal Rejected",
            `Your withdrawal request of ${request.amount} BDT has been rejected. Reason: ${request.adminNote}`,
            "WITHDRAW"
        );

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

    // Notify seller
    notificationServices.createNotification(
        request.seller.toString(),
        "Withdrawal Approved",
        `Your withdrawal request of ${request.amount} BDT has been approved.`,
        "WITHDRAW"
    );

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

const getWithdrawStats = async (sellerId: string) => {
    const seller = await UserModel.findById(sellerId);
    if (!seller) {
        throw new ApiError(httpStatus.NOT_FOUND, "Seller account not found");
    }

    const availableBalance = seller.balance || 0;
    const sellerObjId = new mongoose.Types.ObjectId(sellerId);

    const pendingStats = await WithdrawModel.aggregate([
        { $match: { seller: sellerObjId, status: "PENDING" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const pendingCashout = pendingStats[0]?.total || 0;

    const completedStats = await WithdrawModel.aggregate([
        { $match: { seller: sellerObjId, status: "APPROVED" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const completedPayouts = completedStats[0]?.total || 0;

    return {
        availableBalance,
        pendingCashout,
        completedPayouts,
    };
};

export const withdrawServices = {
    createWithdrawRequest,
    resolveWithdrawRequest,
    getMyWithdrawRequests,
    getAllWithdrawRequests,
    getWithdrawStats,
};
