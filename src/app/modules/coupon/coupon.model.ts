import mongoose, { Schema } from "mongoose";
import { ICoupon } from "./coupon.interface";

const couponSchemaDefinition: any = {
    code: {
        type: String,
        required: [true, "Coupon code is required"],
        unique: true,
        trim: true,
        uppercase: true,
    },
    discountType: {
        type: String,
        enum: ["PERCENTAGE", "FIXED"],
        required: [true, "Discount type is required"],
    },
    discountValue: {
        type: Number,
        required: [true, "Discount value is required"],
        min: [0, "Discount value cannot be negative"],
    },
    maxDiscountAmount: {
        type: Number,
        min: [0, "Max discount amount cannot be negative"],
    },
    minOrderAmount: {
        type: Number,
        min: [0, "Min order amount cannot be negative"],
        default: 0,
    },
    expiryDate: {
        type: Date,
        required: [true, "Expiry date is required"],
    },
    usageLimit: {
        type: Number,
        min: [1, "Usage limit must be at least 1"],
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
};

const CouponSchema = new Schema<ICoupon>(couponSchemaDefinition, {
    timestamps: true,
    versionKey: false,
});

// Force uppercase code on pre-save hook
CouponSchema.pre("save", function () {
    if (this.code) {
        this.code = this.code.toUpperCase().trim();
    }
});

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1, isDeleted: 1 });

export const CouponModel = mongoose.model<ICoupon>("Coupon", CouponSchema);
