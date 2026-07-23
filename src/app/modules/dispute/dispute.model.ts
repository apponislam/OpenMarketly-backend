import mongoose, { Schema } from "mongoose";
import { IDispute } from "./dispute.interface";

const disputeSchemaDefinition: any = {
    order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: [true, "Order ID is required"],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
    },
    type: {
        type: String,
        enum: ["RETURN", "REFUND", "COMPLAINT"],
        required: [true, "Dispute type is required"],
    },
    reason: {
        type: String,
        required: [true, "Reason is required"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Detailed description is required"],
        trim: true,
    },
    images: {
        type: [String],
        default: [],
    },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED", "REFUNDED"],
        default: "PENDING",
    },
    refundDetails: {
        refundAmount: Number,
        refundTxnId: String,
        refundedAt: Date,
        remarks: String,
    },
    adminNote: {
        type: String,
        trim: true,
    },
};

const DisputeSchema = new Schema<IDispute>(disputeSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

DisputeSchema.index({ order: 1 });
DisputeSchema.index({ user: 1, type: 1 });
DisputeSchema.index({ status: 1 });

export const DisputeModel = mongoose.model<IDispute>("Dispute", DisputeSchema);
