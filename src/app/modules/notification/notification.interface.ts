import { Types } from "mongoose";

export type NotificationType = "ORDER" | "PAYMENT" | "WITHDRAW" | "SYSTEM";

export interface INotification {
    user: Types.ObjectId;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
