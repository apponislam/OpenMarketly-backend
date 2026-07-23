import mongoose, { Schema } from "mongoose";
import { IWithdraw } from "./withdraw.interface";

const withdrawSchemaDefinition: any = {
    seller: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Seller is required"],
    },
    amount: {
        type: Number,
        required: [true, "Withdrawal amount is required"],
        min: [100, "Minimum withdrawal amount is 100 BDT"],
    },
    paymentMethod: {
        type: String,
        enum: ["BANK", "BKASH", "NAGAD", "ROCKET"],
        required: [true, "Payment method is required"],
    },
    paymentDetails: {
        accountName: String,
        accountNumber: {
            type: String,
            required: [true, "Account number is required"],
        },
        bankName: String,
        branchName: String,
        routingNumber: String,
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
    },
    transactionId: {
        type: String,
        trim: true,
    },
    adminNote: {
        type: String,
        trim: true,
    },
};

const WithdrawSchema = new Schema<IWithdraw>(withdrawSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

// Indexes for quick lookups
WithdrawSchema.index({ seller: 1, status: 1 });
WithdrawSchema.index({ status: 1, createdAt: -1 });

export const WithdrawModel = mongoose.model<IWithdraw>("Withdraw", WithdrawSchema);
