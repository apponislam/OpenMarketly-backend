import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { ProductModel } from "../product/product.model";
import { WishlistModel } from "./wishlist.model";
import { activityServices } from "../activity/activity.services";
import { ActivityType } from "../activity/activity.interface";

const toggleWishlist = async (userId: string, productId: string) => {
    // Verify product exists and is active
    const product = await ProductModel.findOne({ _id: productId, isDeleted: false });
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    const existingWishlist = await WishlistModel.findOne({ user: userId, product: productId });

    if (existingWishlist) {
        // Remove if already in wishlist
        await WishlistModel.deleteOne({ _id: existingWishlist._id });

        // Log wishlist remove
        activityServices.logActivity(
            userId,
            ActivityType.WISHLIST_REMOVE,
            `Removed product: ${product.name} from wishlist`
        );

        return { isWishlisted: false };
    } else {
        // Add if not in wishlist
        await WishlistModel.create({ user: userId, product: productId });

        // Log wishlist add
        activityServices.logActivity(
            userId,
            ActivityType.WISHLIST_ADD,
            `Added product: ${product.name} to wishlist`
        );

        return { isWishlisted: true };
    }
};

const getMyWishlist = async (userId: string, page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;

    const list = await WishlistModel.find({ user: userId })
        .populate({
            path: "product",
            match: { isDeleted: false, isActive: true },
            populate: { path: "category", select: "name slug" },
        })
        .skip(skip)
        .limit(limit);

    // Filter out any populated elements that might have returned null (due to soft delete or inactive status)
    const filteredList = list.filter((item) => item.product !== null);
    const total = await WishlistModel.countDocuments({ user: userId });

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        },
        data: filteredList,
    };
};

const checkIsWishlisted = async (userId: string, productId: string) => {
    const existing = await WishlistModel.findOne({ user: userId, product: productId });
    return { isWishlisted: !!existing };
};

export const wishlistServices = {
    toggleWishlist,
    getMyWishlist,
    checkIsWishlisted,
};
