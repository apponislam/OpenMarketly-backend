import { Types } from "mongoose";

export type DisputeType = "RETURN" | "REFUND" | "COMPLAINT";
export type DisputeStatus = "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED";

export interface IDispute {
    _id?: Types.ObjectId;
    order: Types.ObjectId;
    user: Types.ObjectId;
    type: DisputeType;
    reason: string;
    description: string;
    images?: string[];
    status?: DisputeStatus;
    refundDetails?: {
        refundAmount?: number;
        refundTxnId?: string;
        refundedAt?: Date;
        remarks?: string;
    };
    adminNote?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
