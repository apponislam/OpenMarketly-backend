import { Types } from "mongoose";

export type NoticeType = "TEXT" | "IMAGE";

export interface INotice {
    _id?: Types.ObjectId;
    title: string;
    type: NoticeType;
    text?: string;
    image?: string;
    redirectUrl?: string;
    isDefault: boolean;
    isActive: boolean;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
