import { Types } from "mongoose";

export type CouponDiscountType = "PERCENTAGE" | "FIXED";

export interface ICoupon {
    _id?: Types.ObjectId;
    code: string;
    discountType: CouponDiscountType;
    discountValue: number;
    maxDiscountAmount?: number;
    minOrderAmount?: number;
    expiryDate: Date;
    usageLimit?: number;
    usageCount: number;
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
