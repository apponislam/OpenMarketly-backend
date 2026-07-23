import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { FavoriteModel } from "./favorite.model";
import { ProductModel } from "../product/product.model";

const toggleFavorite = async (userId: string, productId: string) => {
    if (!productId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Product ID is required");
    }

    // Verify product exists
    const product = await ProductModel.findOne({ _id: productId, isDeleted: false });
    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
    }

    const existing = await FavoriteModel.findOne({ user: userId, product: productId });

    if (existing) {
        // If already favorited, remove it
        await FavoriteModel.findByIdAndDelete(existing._id);
        return { isFavorite: false, message: "Product removed from favorites" };
    } else {
        // Otherwise, add to favorites
        await FavoriteModel.create({ user: userId, product: productId });
        return { isFavorite: true, message: "Product added to favorites" };
    }
};

const getMyFavorites = async (userId: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const favorites = await FavoriteModel.find({ user: userId })
        .populate({
            path: "product",
            match: { isDeleted: false },
            populate: [
                { path: "category", select: "name slug" },
                { path: "seller", select: "name email profileImage" },
            ],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Filter out any null products (e.g. if product was soft deleted)
    const validFavorites = favorites.filter((fav) => fav.product !== null);
    const total = await FavoriteModel.countDocuments({ user: userId });

    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data: validFavorites,
    };
};

const checkIsFavorite = async (userId: string, productId: string) => {
    const favorite = await FavoriteModel.findOne({ user: userId, product: productId });
    return { isFavorite: !!favorite };
};

const removeFavorite = async (userId: string, productId: string) => {
    const favorite = await FavoriteModel.findOneAndDelete({ user: userId, product: productId });
    if (!favorite) {
        throw new ApiError(httpStatus.NOT_FOUND, "Favorite not found");
    }
    return { message: "Product removed from favorites" };
};

export const favoriteServices = {
    toggleFavorite,
    getMyFavorites,
    checkIsFavorite,
    removeFavorite,
};
