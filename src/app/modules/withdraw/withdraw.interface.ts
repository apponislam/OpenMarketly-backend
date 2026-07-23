import { Types } from "mongoose";

export type WithdrawStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IWithdraw {
    _id?: Types.ObjectId;
    seller: Types.ObjectId;
    amount: number;
    paymentMethod: "BANK" | "BKASH" | "NAGAD" | "ROCKET";
    paymentDetails: {
        accountName?: string;
        accountNumber: string;
        bankName?: string;
        branchName?: string;
        routingNumber?: string;
    };
    status: WithdrawStatus;
    adminNote?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
