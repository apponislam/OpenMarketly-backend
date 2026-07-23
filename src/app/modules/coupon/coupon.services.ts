import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { ICoupon } from "./coupon.interface";
import { CouponModel } from "./coupon.model";

const createCoupon = async (data: Partial<ICoupon>) => {
    if (!data.code || !data.discountType || data.discountValue === undefined || !data.expiryDate) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Code, discountType, discountValue, and expiryDate are required");
    }

    const uppercaseCode = data.code.toUpperCase().trim();
    const existing = await CouponModel.findOne({ code: uppercaseCode, isDeleted: false });
    if (existing) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Coupon code already exists");
    }

    return await CouponModel.create(data);
};

const getAllCoupons = async (isAdmin = false) => {
    const filter: any = { isDeleted: false };
    if (!isAdmin) {
        filter.isActive = true;
        filter.expiryDate = { $gt: new Date() };
    }

    return await CouponModel.find(filter).sort({ createdAt: -1 });
};

const validateCoupon = async (code: string, orderAmount: number) => {
    if (!code) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Coupon code is required");
    }

    const uppercaseCode = code.toUpperCase().trim();
    const coupon = await CouponModel.findOne({ code: uppercaseCode, isDeleted: false, isActive: true });

    if (!coupon) {
        throw new ApiError(httpStatus.NOT_FOUND, "Invalid or inactive coupon code");
    }

    // Expiry check
    if (new Date(coupon.expiryDate) < new Date()) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Coupon code has expired");
    }

    // Minimum order amount check
    if (coupon.minOrderAmount !== undefined && orderAmount < coupon.minOrderAmount) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Minimum order amount of BDT ${coupon.minOrderAmount} is required to apply this coupon`
        );
    }

    // Usage limit check
    if (coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Coupon usage limit has been reached");
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
        discountAmount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount !== undefined && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
        }
    } else {
        discountAmount = coupon.discountValue;
    }

    // Cap discount amount at orderAmount
    if (discountAmount > orderAmount) {
        discountAmount = orderAmount;
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
        couponId: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
    };
};

const updateCoupon = async (id: string, data: Partial<ICoupon>) => {
    if (data.code) {
        const uppercaseCode = data.code.toUpperCase().trim();
        const existing = await CouponModel.findOne({ code: uppercaseCode, _id: { $ne: id }, isDeleted: false });
        if (existing) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Coupon code already in use");
        }
    }

    const coupon = await CouponModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: data },
        { new: true, runValidators: true }
    );

    if (!coupon) {
        throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
    }

    return coupon;
};

const deleteCoupon = async (id: string) => {
    const coupon = await CouponModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true } },
        { new: true }
    );

    if (!coupon) {
        throw new ApiError(httpStatus.NOT_FOUND, "Coupon not found");
    }

    return coupon;
};

export const couponServices = {
    createCoupon,
    getAllCoupons,
    validateCoupon,
    updateCoupon,
    deleteCoupon,
};
