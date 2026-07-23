import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { IRating } from "./rating.interface";
import { RatingModel } from "./rating.model";
import { ProductModel } from "../product/product.model";
import mongoose from "mongoose";

const createOrUpdateRating = async (userId: string, data: Partial<IRating>) => {
    if (!data.product || data.rating === undefined) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Product ID and rating are required");
    }

    if (data.rating < 1 || data.rating > 5) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Rating must be between 1 and 5 stars");
    }

    // Verify product exists
    const product = await ProductModel.findOne({ _id: data.product, isDeleted: false });
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    // Upsert rating (if user already rated this product, update it)
    const ratingObj = await RatingModel.findOneAndUpdate(
        { product: data.product, user: userId },
        {
            $set: {
                rating: data.rating,
                comment: data.comment || "",
                images: data.images || [],
                isDeleted: false,
            },
        },
        { new: true, upsert: true, runValidators: true }
    ).populate("user", "name profileImage");

    return ratingObj;
};

const getProductRatings = async (productId: string, page = 1, limit = 10) => {
    const filter = { product: productId, isDeleted: false };
    const skip = (page - 1) * limit;

    const ratings = await RatingModel.find(filter)
        .populate("user", "name profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await RatingModel.countDocuments(filter);

    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data: ratings,
    };
};

const getRatingSummary = async (productId: string) => {
    const pId = new mongoose.Types.ObjectId(productId);

    const result = await RatingModel.aggregate([
        { $match: { product: pId, isDeleted: false } },
        {
            $group: {
                _id: "$product",
                averageRating: { $avg: "$rating" },
                totalRatings: { $sum: 1 },
                fiveStar: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
                fourStar: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
                threeStar: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
                twoStar: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
                oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
            },
        },
    ]);

    if (result.length === 0) {
        return {
            averageRating: 0,
            totalRatings: 0,
            fiveStar: 0,
            fourStar: 0,
            threeStar: 0,
            twoStar: 0,
            oneStar: 0,
        };
    }

    const summary = result[0];
    summary.averageRating = Math.round(summary.averageRating * 10) / 10;
    delete summary._id;

    return summary;
};

const deleteRating = async (id: string, userId: string, userRole: string) => {
    const rating = await RatingModel.findOne({ _id: id, isDeleted: false });
    if (!rating) {
        throw new ApiError(httpStatus.NOT_FOUND, "Rating not found");
    }

    if (rating.user.toString() !== userId && userRole !== "ADMIN") {
        throw new ApiError(httpStatus.FORBIDDEN, "You do not have permission to delete this rating");
    }

    const deletedRating = await RatingModel.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true } },
        { new: true }
    );

    return deletedRating;
};

export const ratingServices = {
    createOrUpdateRating,
    getProductRatings,
    getRatingSummary,
    deleteRating,
};
