import { Types } from "mongoose";

export type BannerType = "HERO" | "PROMO" | "CATEGORY" | "SIDEBAR" | "POPUP";
export type BannerPosition = "TOP" | "MIDDLE" | "BOTTOM";

export interface IBanner {
    _id?: Types.ObjectId;
    title: string;
    subtitle?: string;
    image: string;
    link?: string;
    type: BannerType;
    position: BannerPosition;
    sortOrder: number;
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
